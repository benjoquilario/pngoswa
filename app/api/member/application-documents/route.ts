import { getCurrentPortalSession } from "@/lib/auth"
import { updateMembershipApplicationDocumentsForMember } from "@/lib/membership"
import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromRequest,
  isOriginAllowed,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"

export const dynamic = "force-dynamic"

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
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

  const session = await getCurrentPortalSession("MEMBER")

  if (!session) {
    return Response.json(
      {
        ok: false,
        message: "Please sign in again to continue updating your documents.",
      },
      {
        status: 401,
        headers: noIndexHeaders,
      }
    )
  }

  const updateLimit = await consumeRateLimit({
    ...SECURITY_RATE_LIMITS.memberDocumentUpdateIp,
    identifier: `${session.user.id}:${getClientIpFromRequest(request)}`,
  })

  if (!updateLimit.allowed) {
    return Response.json(
      {
        ok: false,
        message: createRateLimitResponseMessage(updateLimit.retryAfterSeconds),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(updateLimit.retryAfterSeconds),
          ...noIndexHeaders,
        },
      }
    )
  }

  try {
    const payload = await request.json()
    const result = await updateMembershipApplicationDocumentsForMember(
      session.user.id,
      payload
    )

    return Response.json(result, {
      status: result.ok ? 200 : result.status,
      headers: noIndexHeaders,
    })
  } catch (error) {
    console.error("Failed to update membership documents:", error)

    return Response.json(
      {
        ok: false,
        message:
          "We could not save your updated documents right now. Please try again in a moment.",
      },
      {
        status: 500,
        headers: noIndexHeaders,
      }
    )
  }
}
