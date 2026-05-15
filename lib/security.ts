import { createHash } from "node:crypto"

import { headers as nextHeaders } from "next/headers"

import { prisma } from "@/lib/db"
import { getSiteUrl } from "@/lib/site-url"

type HeaderSource = Headers

type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

type RateLimitOptions = {
  action: string
  identifier: string
  limit: number
  windowMs: number
  blockDurationMs?: number
}

const CLIENT_IP_HEADER_NAMES = [
  "cf-connecting-ip",
  "x-real-ip",
  "x-forwarded-for",
  "fly-client-ip",
  "x-client-ip",
] as const

export const SECURITY_RATE_LIMITS = {
  membershipApplyIp: {
    action: "membership-apply-ip",
    limit: 8,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 30 * 60 * 1000,
  },
  membershipApplyEmail: {
    action: "membership-apply-email",
    limit: 3,
    windowMs: 24 * 60 * 60 * 1000,
    blockDurationMs: 24 * 60 * 60 * 1000,
  },
  memberMagicLinkIp: {
    action: "member-magic-link-ip",
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  memberMagicLinkEmail: {
    action: "member-magic-link-email",
    limit: 4,
    windowMs: 30 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  adminMagicLinkIp: {
    action: "admin-magic-link-ip",
    limit: 3,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 2 * 60 * 60 * 1000,
  },
  adminMagicLinkEmail: {
    action: "admin-magic-link-email",
    limit: 3,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 2 * 60 * 60 * 1000,
  },
  uploadIp: {
    action: "upload-ip",
    limit: 25,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  authVerifyIp: {
    action: "auth-verify-ip",
    limit: 20,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  memberDocumentUpdateIp: {
    action: "member-document-update-ip",
    limit: 20,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  documentDownloadUser: {
    action: "document-download-user",
    limit: 120,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 30 * 60 * 1000,
  },
} as const

function getRateLimitSecret() {
  return (
    process.env.RATE_LIMIT_SECRET ??
    process.env.RESEND_API_KEY ??
    process.env.DATABASE_URL ??
    "pngoswa-dev-rate-limit-secret"
  )
}

function hashIdentifier(identifier: string) {
  return createHash("sha256")
    .update(`${getRateLimitSecret()}:${identifier}`)
    .digest("hex")
}

function normalizeOrigin(origin: string | null) {
  if (!origin) {
    return null
  }

  try {
    return new URL(origin).origin
  } catch {
    return null
  }
}

function parseOriginFromReferer(referer: string | null) {
  if (!referer) {
    return null
  }

  try {
    return new URL(referer).origin
  } catch {
    return null
  }
}

function getAllowedOrigins() {
  const origins = new Set<string>([new URL(getSiteUrl()).origin])

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000")
    origins.add("http://localhost:3006")
    origins.add("https://localhost:3000")
    origins.add("https://localhost:3006")
    origins.add("http://127.0.0.1:3000")
    origins.add("http://127.0.0.1:3006")
  }

  return origins
}

function validateOriginInternal(headerSource: HeaderSource, method: string) {
  const normalizedMethod = method.toUpperCase()

  if (
    normalizedMethod === "GET" ||
    normalizedMethod === "HEAD" ||
    normalizedMethod === "OPTIONS"
  ) {
    return true
  }

  const origin =
    normalizeOrigin(headerSource.get("origin")) ??
    parseOriginFromReferer(headerSource.get("referer"))

  if (!origin) {
    return process.env.NODE_ENV !== "production"
  }

  return getAllowedOrigins().has(origin)
}

function getClientIpInternal(headerSource: HeaderSource) {
  for (const headerName of CLIENT_IP_HEADER_NAMES) {
    const rawValue = headerSource.get(headerName)

    if (!rawValue) {
      continue
    }

    const value = rawValue.split(",")[0]?.trim()

    if (value) {
      return value
    }
  }

  return "unknown"
}

export function isOriginAllowed(request: Request) {
  return validateOriginInternal(request.headers, request.method)
}

export async function isServerActionOriginAllowed() {
  const headerStore = await nextHeaders()
  return validateOriginInternal(headerStore, "POST")
}

export function getClientIpFromRequest(request: Request) {
  return getClientIpInternal(request.headers)
}

export async function getClientIpFromServerAction() {
  const headerStore = await nextHeaders()
  return getClientIpInternal(headerStore)
}

export function createRateLimitResponseMessage(retryAfterSeconds: number) {
  const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60)

  return `Too many requests. Please wait about ${retryAfterMinutes} minute${
    retryAfterMinutes === 1 ? "" : "s"
  } and try again.`
}

export async function consumeRateLimit({
  action,
  identifier,
  limit,
  windowMs,
  blockDurationMs = windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  const now = new Date()
  const key = `${action}:${hashIdentifier(identifier || "unknown")}`
  const existing = await prisma.securityThrottle.findUnique({
    where: {
      key,
    },
  })

  if (!existing) {
    await prisma.securityThrottle.create({
      data: {
        key,
        action,
        count: 1,
        windowStartedAt: now,
      },
    })

    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      retryAfterSeconds: 0,
    }
  }

  if (existing.blockedUntil && existing.blockedUntil > now) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(
        Math.ceil((existing.blockedUntil.getTime() - now.getTime()) / 1000),
        1
      ),
    }
  }

  const windowExpired =
    now.getTime() - existing.windowStartedAt.getTime() >= windowMs

  if (windowExpired) {
    await prisma.securityThrottle.update({
      where: {
        key,
      },
      data: {
        count: 1,
        windowStartedAt: now,
        blockedUntil: null,
      },
    })

    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      retryAfterSeconds: 0,
    }
  }

  const nextCount = existing.count + 1
  const shouldBlock = nextCount > limit
  const blockedUntil = shouldBlock
    ? new Date(now.getTime() + blockDurationMs)
    : null

  await prisma.securityThrottle.update({
    where: {
      key,
    },
    data: {
      count: nextCount,
      blockedUntil,
    },
  })

  return {
    allowed: !shouldBlock,
    limit,
    remaining: shouldBlock ? 0 : Math.max(limit - nextCount, 0),
    retryAfterSeconds: shouldBlock ? Math.ceil(blockDurationMs / 1000) : 0,
  }
}
