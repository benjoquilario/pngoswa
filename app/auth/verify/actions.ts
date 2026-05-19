"use server"

import { redirect } from "next/navigation"

import {
  consumeMagicLink,
  getPortalLoginPath,
  getPortalRedirectPath,
  parsePortalScope,
  setPortalSessionCookie,
} from "@/lib/auth"
import { getDatabaseUnavailableMessage, isDatabaseConnectionError } from "@/lib/db"
import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromServerAction,
  isServerActionOriginAllowed,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"

export type MagicLinkVerificationState = {
  error?: string
}

const initialState: MagicLinkVerificationState = {}

export async function completeMagicLinkSignIn(
  _state: MagicLinkVerificationState,
  formData: FormData
): Promise<MagicLinkVerificationState> {
  if (!(await isServerActionOriginAllowed())) {
    return {
      error: "The request origin is not allowed.",
    }
  }

  const rawToken = String(formData.get("token") ?? "")
  const scope = parsePortalScope(String(formData.get("scope") ?? null))

  if (!rawToken || !scope || !/^[a-f0-9]{64}$/i.test(rawToken)) {
    return {
      error: "That sign-in link is invalid. Request a new link and try again.",
    }
  }

  const verifyLimit = await consumeRateLimit({
    ...SECURITY_RATE_LIMITS.authVerifyIp,
    identifier: await getClientIpFromServerAction(),
  })

  if (!verifyLimit.allowed) {
    return {
      error: createRateLimitResponseMessage(verifyLimit.retryAfterSeconds),
    }
  }

  let session

  try {
    session = await consumeMagicLink(rawToken, scope)
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return {
        error: getDatabaseUnavailableMessage(),
      }
    }

    throw error
  }

  if (!session) {
    redirect(`${getPortalLoginPath(scope)}?invalid=1`)
  }

  await setPortalSessionCookie(scope, session.rawSessionToken, session.expiresAt)
  redirect(getPortalRedirectPath(scope))
}

export { initialState as initialMagicLinkVerificationState }
