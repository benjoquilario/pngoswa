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
import { prisma } from "@/lib/db"
import {
  createEmailPreview,
  createMembershipReviewEmail,
  getDefaultMemberPortalUrl,
  sendTransactionalEmail,
} from "@/lib/email"
import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromServerAction,
  isServerActionOriginAllowed,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"

import type { MagicLinkFormState } from "@/components/portal/magic-link-request-form"

export async function requestAdminMagicLink(
  _state: MagicLinkFormState,
  formData: FormData
): Promise<MagicLinkFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()

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

  let updates:
    | {
        status: "APPROVED"
        approvedAt: Date
        rejectedAt: null
        followUpMessage: null
      }
    | {
        status: "REJECTED"
        rejectedAt: Date
        approvedAt: null
      }
    | {
        status: "FOLLOW_UP"
        followUpMessage: string
        lastFollowUpSentAt: Date
      }
  let reviewType: "FOLLOW_UP" | "APPROVED" | "REJECTED"
  let emailKind: "approve" | "follow-up" | "reject"
  let communicationKind: "FOLLOW_UP" | "STATUS_UPDATE"

  if (action === "approve") {
    emailKind = "approve"
    reviewType = "APPROVED"
    communicationKind = "STATUS_UPDATE"
    updates = {
      status: "APPROVED",
      approvedAt: new Date(),
      rejectedAt: null,
      followUpMessage: null,
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
    applicationNumber: application.applicationNumber,
    memberPortalUrl: getDefaultMemberPortalUrl(),
    reviewerMessage: message,
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
    prisma.membershipReviewAction.create({
      data: {
        applicationId: application.id,
        reviewerId: session.user.id,
        type: reviewType,
        subject: emailSubject,
        message,
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
