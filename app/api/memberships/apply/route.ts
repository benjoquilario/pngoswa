import { createMembershipApplication } from "@/lib/membership"
import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromRequest,
  isOriginAllowed,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
}

function extractSubmittedEmail(payload: unknown) {
  if (payload instanceof FormData) {
    const value = payload.get("email")
    return typeof value === "string" ? value.trim().toLowerCase() : ""
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    typeof payload.email === "string"
  ) {
    return payload.email.trim().toLowerCase()
  }

  return ""
}

export async function POST(request: Request) {
  if (!isOriginAllowed(request)) {
    return Response.json(
      {
        ok: false,
        message: "The request origin is not allowed.",
      },
      {
        status: 403,
        headers: noIndexHeaders,
      }
    )
  }

  try {
    const contentType = request.headers.get("content-type") ?? ""
    const payload = contentType.includes("application/json")
      ? await request.json()
      : await request.formData()
    const clientIp = getClientIpFromRequest(request)
    const email = extractSubmittedEmail(payload)
    const [ipLimit, emailLimit] = await Promise.all([
      consumeRateLimit({
        ...SECURITY_RATE_LIMITS.membershipApplyIp,
        identifier: clientIp,
      }),
      consumeRateLimit({
        ...SECURITY_RATE_LIMITS.membershipApplyEmail,
        identifier: email || `${clientIp}:anonymous`,
      }),
    ])

    if (!ipLimit.allowed || !emailLimit.allowed) {
      return Response.json(
        {
          ok: false,
          message: createRateLimitResponseMessage(
            Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds)
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds)
            ),
            ...noIndexHeaders,
          },
        }
      )
    }

    const result = await createMembershipApplication(payload)

    if (!result.ok) {
      return Response.json(
        {
          ok: false,
          code: "code" in result ? result.code : undefined,
          applicationId:
            "applicationId" in result ? result.applicationId : undefined,
          applicationNumber:
            "applicationNumber" in result
              ? result.applicationNumber
              : undefined,
          loginPath: "loginPath" in result ? result.loginPath : undefined,
          membershipStatus:
            "membershipStatus" in result ? result.membershipStatus : undefined,
          message: result.message,
          errors: "errors" in result ? result.errors : undefined,
        },
        {
          status: result.status,
          headers: noIndexHeaders,
        }
      )
    }

    return Response.json(
      {
        ok: true,
        applicationId: result.applicationId,
        applicationNumber: result.applicationNumber,
        emailSent: result.emailSent,
        message: result.message,
        debugUrl: result.debugUrl,
      },
      {
        headers: noIndexHeaders,
      }
    )
  } catch (error) {
    console.error("Failed to save membership application:", error)

    return Response.json(
      {
        ok: false,
        message:
          "We could not save your application right now. Please try again in a moment.",
      },
      {
        status: 500,
        headers: noIndexHeaders,
      }
    )
  }
}
