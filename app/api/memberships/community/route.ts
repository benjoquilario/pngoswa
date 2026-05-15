import { getMembershipCommunityStats } from "@/lib/membership"

export const dynamic = "force-dynamic"

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
}

export async function GET() {
  try {
    const stats = await getMembershipCommunityStats()

    return Response.json(
      {
        ok: true,
        ...stats,
      },
      {
        headers: noIndexHeaders,
      }
    )
  } catch (error) {
    console.error("Failed to load membership community stats:", error)

    return Response.json(
      {
        ok: false,
        message:
          "We could not load the membership community count right now.",
      },
      {
        status: 500,
        headers: noIndexHeaders,
      }
    )
  }
}
