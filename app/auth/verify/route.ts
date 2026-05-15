import { consumeMagicLink, setPortalSessionCookie } from "@/lib/auth"
import { isDatabaseConnectionError } from "@/lib/db"
import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromRequest,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
}

function redirectWithNoIndex(path: string, request: Request) {
  return new Response(null, {
    status: 307,
    headers: {
      Location: new URL(path, request.url).toString(),
      ...noIndexHeaders,
    },
  })
}

export async function GET(request: Request) {
  const verifyLimit = await consumeRateLimit({
    ...SECURITY_RATE_LIMITS.authVerifyIp,
    identifier: getClientIpFromRequest(request),
  })

  if (!verifyLimit.allowed) {
    return new Response(createRateLimitResponseMessage(verifyLimit.retryAfterSeconds), {
      status: 429,
      headers: {
        "Retry-After": String(verifyLimit.retryAfterSeconds),
        "Content-Type": "text/plain; charset=utf-8",
        ...noIndexHeaders,
      },
    })
  }

  const url = new URL(request.url)
  const rawToken = url.searchParams.get("token")
  const rawScope = url.searchParams.get("scope")
  const scope = rawScope === "admin" ? "ADMIN" : rawScope === "member" ? "MEMBER" : null

  if (!rawToken || !scope || !/^[a-f0-9]{64}$/i.test(rawToken)) {
    return redirectWithNoIndex("/", request)
  }

  let session

  try {
    session = await consumeMagicLink(rawToken, scope)
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return redirectWithNoIndex(
        scope === "ADMIN"
          ? "/admin/login?invalid=1"
          : "/member/login?invalid=1",
        request
      )
    }

    throw error
  }

  if (!session) {
    return redirectWithNoIndex(
      scope === "ADMIN" ? "/admin/login?invalid=1" : "/member/login?invalid=1",
      request
    )
  }

  await setPortalSessionCookie(scope, session.rawSessionToken, session.expiresAt)

  return redirectWithNoIndex(session.redirectPath, request)
}
