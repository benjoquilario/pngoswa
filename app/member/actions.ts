"use server"

import { redirect } from "next/navigation"

import {
  isDevelopmentAuthBypassEnabled,
  logoutPortalSession,
  requestMagicLink,
  signInForDevelopment,
} from "@/lib/auth"
import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromServerAction,
  isServerActionOriginAllowed,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"

import type { MagicLinkFormState } from "@/components/portal/magic-link-request-form"

export async function requestMemberMagicLink(
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
    const result = await signInForDevelopment("MEMBER", email)

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
      ...SECURITY_RATE_LIMITS.memberMagicLinkIp,
      identifier: clientIp,
    }),
    consumeRateLimit({
      ...SECURITY_RATE_LIMITS.memberMagicLinkEmail,
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
    scope: "MEMBER",
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

export async function logoutMember() {
  await logoutPortalSession("MEMBER")
  redirect("/member/login")
}
