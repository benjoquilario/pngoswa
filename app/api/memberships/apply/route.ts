import { createMembershipApplication } from "@/lib/membership"

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    const payload = contentType.includes("application/json")
      ? await request.json()
      : await request.formData()
    const result = await createMembershipApplication(payload)

    if (!result.ok) {
      return Response.json(
        {
          ok: false,
          errors: result.errors,
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
