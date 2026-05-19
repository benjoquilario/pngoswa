import { getCurrentPortalSession } from "@/lib/auth"
import { updatePaymentSettings } from "@/lib/payment-settings"
import { isOriginAllowed } from "@/lib/security"

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

  const session = await getCurrentPortalSession("ADMIN")

  if (!session) {
    return Response.json(
      {
        ok: false,
        message: "Admin session expired. Please sign in again.",
      },
      {
        status: 401,
        headers: noIndexHeaders,
      }
    )
  }

  try {
    const payload = await request.json()
    const result = await updatePaymentSettings(payload)

    if (!result.ok) {
      return Response.json(result, {
        status: result.status,
        headers: noIndexHeaders,
      })
    }

    return Response.json(result, {
      headers: noIndexHeaders,
    })
  } catch (error) {
    console.error("Failed to update payment settings:", error)

    return Response.json(
      {
        ok: false,
        message:
          "We could not save the payment settings right now. Please try again in a moment.",
      },
      {
        status: 500,
        headers: noIndexHeaders,
      }
    )
  }
}
