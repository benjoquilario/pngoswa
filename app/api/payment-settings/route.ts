import { getPublicPaymentSettings } from "@/lib/payment-settings"

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
}

export async function GET() {
  const settings = await getPublicPaymentSettings()

  return Response.json(settings, {
    headers: noIndexHeaders,
  })
}
