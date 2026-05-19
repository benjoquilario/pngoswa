"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  isDevelopmentAuthBypassEnabled,
  logoutPortalSession,
  requestMagicLink,
  requirePortalSession,
  signInForDevelopment,
} from "@/lib/auth"
import { isPresidentAdminEmail } from "@/lib/auth/admin-access"
import { prisma } from "@/lib/db"
import {
  createEmailPreview,
  createMembershipReviewEmail,
  getDefaultMemberPortalUrl,
  sendTransactionalEmail,
} from "@/lib/email"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  allocateReservedOfficerApplicationNumber,
} from "@/lib/membership"
import { formatOfficerRoleName } from "@/lib/officer-roles"
import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromServerAction,
  isServerActionOriginAllowed,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"

import type { MagicLinkFormState } from "@/components/portal/magic-link-request-form"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function requestAdminMagicLink(
  _state: MagicLinkFormState,
  formData: FormData
): Promise<MagicLinkFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()

  if (!email) {
    return {
      error: "Enter the admin email address you want to use.",
    }
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      error: "Enter a valid email address.",
      submittedEmail: email,
    }
  }

  if (!(await isServerActionOriginAllowed())) {
    return {
      error: "The request origin is not allowed.",
    }
  }

  if (isDevelopmentAuthBypassEnabled()) {
    const result = await signInForDevelopment("ADMIN", email)

    if (!result.ok) {
      return {
        error: result.message,
      }
    }

    redirect(result.redirectPath)
  }

  const clientIp = await getClientIpFromServerAction()
  const [ipLimit, emailLimit] = await Promise.all([
    consumeRateLimit({
      ...SECURITY_RATE_LIMITS.adminMagicLinkIp,
      identifier: clientIp,
    }),
    consumeRateLimit({
      ...SECURITY_RATE_LIMITS.adminMagicLinkEmail,
      identifier: email || "unknown-email",
    }),
  ])

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return {
      error: createRateLimitResponseMessage(
        Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds)
      ),
    }
  }

  const result = await requestMagicLink({
    email,
    scope: "ADMIN",
  })

  if (!result.ok) {
    return {
      error: result.message,
    }
  }

  return {
    success: result.message,
    debugUrl: result.debugUrl,
    submittedEmail: result.submittedEmail,
    expiresInMinutes: result.expiresInMinutes,
  }
}

export async function logoutAdmin() {
  await logoutPortalSession("ADMIN")
  redirect("/admin/login")
}

export async function reviewMembershipAction(formData: FormData) {
  const session = await requirePortalSession("ADMIN")
  const applicationId = String(formData.get("applicationId") ?? "")
  const action = String(formData.get("action") ?? "")
  const subject = String(formData.get("subject") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()
  const selectedOfficerRoleName = String(
    formData.get("officerRoleName") ?? ""
  ).trim()
  const customOfficerRoleName = String(
    formData.get("customOfficerRoleName") ?? ""
  ).trim()
  const isPresidentReviewer = isPresidentAdminEmail(session.user.email)

  if (!applicationId) {
    redirect("/admin/dashboard")
  }

  const application = await prisma.membershipApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: true,
    },
  })

  if (!application) {
    redirect("/admin/dashboard")
  }

  const resolvedOfficerRoleName =
    selectedOfficerRoleName === "__other__"
      ? customOfficerRoleName
      : selectedOfficerRoleName
  const assignedOfficerRoleName =
    isPresidentReviewer && action === "approve" && resolvedOfficerRoleName
      ? resolvedOfficerRoleName
      : null
  const officerRoleLabel = formatOfficerRoleName(assignedOfficerRoleName)
  const reviewMessageWithOfficerRole =
    assignedOfficerRoleName && !message.includes(officerRoleLabel)
      ? `${message ? `${message}\n\n` : ""}Assigned officer role: ${officerRoleLabel}.`
      : message
  let effectiveApplicationNumber = application.applicationNumber
  let updates: Prisma.MembershipApplicationUpdateInput
  let reviewType: "FOLLOW_UP" | "APPROVED" | "REJECTED"
  let emailKind: "approve" | "follow-up" | "reject"
  let communicationKind: "FOLLOW_UP" | "STATUS_UPDATE"

  if (action === "approve") {
    const reservedOfficerApplicationNumber =
      assignedOfficerRoleName && !application.officerRoleName
        ? await allocateReservedOfficerApplicationNumber(
            application.createdAt.getFullYear()
          )
        : null

    effectiveApplicationNumber =
      reservedOfficerApplicationNumber ?? application.applicationNumber

    emailKind = "approve"
    reviewType = "APPROVED"
    communicationKind = "STATUS_UPDATE"
    updates = {
      status: "APPROVED",
      approvedAt: new Date(),
      rejectedAt: null,
      followUpMessage: null,
      ...(assignedOfficerRoleName
        ? {
            officerRoleName: assignedOfficerRoleName,
          }
        : {}),
      ...(reservedOfficerApplicationNumber
        ? {
            applicationNumber: reservedOfficerApplicationNumber,
          }
        : {}),
    }
  } else if (action === "reject") {
    emailKind = "reject"
    reviewType = "REJECTED"
    communicationKind = "STATUS_UPDATE"
    updates = {
      status: "REJECTED",
      rejectedAt: new Date(),
      approvedAt: null,
    }
  } else {
    emailKind = "follow-up"
    reviewType = "FOLLOW_UP"
    communicationKind = "FOLLOW_UP"
    updates = {
      status: "FOLLOW_UP",
      followUpMessage: message,
      lastFollowUpSentAt: new Date(),
    }
  }

  const defaultEmail = createMembershipReviewEmail({
    kind: emailKind,
    memberName: application.firstName,
    applicationNumber: effectiveApplicationNumber,
    memberPortalUrl: getDefaultMemberPortalUrl(),
    reviewerMessage: reviewMessageWithOfficerRole,
  })

  const emailSubject = subject || defaultEmail.subject
  const emailText = defaultEmail.text
  const emailHtml = defaultEmail.html

  const emailResult = await sendTransactionalEmail({
    to: application.email,
    subject: emailSubject,
    html: emailHtml,
    text: emailText,
  })

  await prisma.$transaction([
    prisma.membershipApplication.update({
      where: { id: application.id },
      data: updates,
    }),
    ...(assignedOfficerRoleName
      ? [
          prisma.user.update({
            where: {
              id: application.userId,
            },
            data: {
              officerRoleName: assignedOfficerRoleName,
            },
          }),
        ]
      : []),
    prisma.membershipReviewAction.create({
      data: {
        applicationId: application.id,
        reviewerId: session.user.id,
        type: reviewType,
        subject: emailSubject,
        message: reviewMessageWithOfficerRole,
      },
    }),
    prisma.communicationLog.create({
      data: {
        applicationId: application.id,
        userId: application.userId,
        kind: communicationKind,
        status: emailResult.ok ? "SENT" : "FAILED",
        recipientEmail: application.email,
        subject: emailSubject,
        previewText: createEmailPreview(emailText),
        errorMessage: emailResult.ok ? null : emailResult.error,
        sentAt: emailResult.ok ? new Date() : null,
      },
    }),
  ])

  revalidatePath("/admin/dashboard")
  revalidatePath(`/admin/dashboard/applications/${application.id}`)
  revalidatePath("/member/profile")
  redirect(`/admin/dashboard/applications/${application.id}?updated=${action}`)
}
