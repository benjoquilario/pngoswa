import { createRouteHandler } from "uploadthing/next"

import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromRequest,
  isOriginAllowed,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"

import { uploadRouter } from "./core"

const uploadthingRouteHandler = createRouteHandler({
  router: uploadRouter,
})

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
}

export async function GET(...args: Parameters<typeof uploadthingRouteHandler.GET>) {
  return uploadthingRouteHandler.GET(...args)
}

export async function POST(
  ...args: Parameters<typeof uploadthingRouteHandler.POST>
) {
  const [request] = args

  if (!isOriginAllowed(request)) {
    return Response.json(
      {
        message: "The request origin is not allowed.",
      },
      {
        status: 403,
        headers: noIndexHeaders,
      }
    )
  }

  const uploadLimit = await consumeRateLimit({
    ...SECURITY_RATE_LIMITS.uploadIp,
    identifier: getClientIpFromRequest(request),
  })

  if (!uploadLimit.allowed) {
    return Response.json(
      {
        message: createRateLimitResponseMessage(uploadLimit.retryAfterSeconds),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(uploadLimit.retryAfterSeconds),
          ...noIndexHeaders,
        },
      }
    )
  }

  return uploadthingRouteHandler.POST(...args)
}
