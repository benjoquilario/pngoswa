import { getCurrentPortalSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  consumeRateLimit,
  createRateLimitResponseMessage,
  getClientIpFromRequest,
  SECURITY_RATE_LIMITS,
} from "@/lib/security"
import { readStoredFile } from "@/lib/storage"

export const dynamic = "force-dynamic"

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
}

function sanitizeDownloadFileName(fileName: string) {
  return fileName.replace(/[\r\n"]/g, "_")
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await context.params
  const [adminSession, memberSession] = await Promise.all([
    getCurrentPortalSession("ADMIN"),
    getCurrentPortalSession("MEMBER"),
  ])

  if (!adminSession && !memberSession) {
    return new Response("Unauthorized", {
      status: 401,
      headers: noIndexHeaders,
    })
  }

  const authenticatedActor = adminSession?.user.id ?? memberSession?.user.id
  const downloadLimit = await consumeRateLimit({
    ...SECURITY_RATE_LIMITS.documentDownloadUser,
    identifier: `${authenticatedActor}:${getClientIpFromRequest(_request)}`,
  })

  if (!downloadLimit.allowed) {
    return new Response(
      createRateLimitResponseMessage(downloadLimit.retryAfterSeconds),
      {
        status: 429,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Retry-After": String(downloadLimit.retryAfterSeconds),
          ...noIndexHeaders,
        },
      }
    )
  }

  const document = await prisma.membershipDocument.findUnique({
    where: {
      id: documentId,
    },
    include: {
      application: true,
    },
  })

  if (!document) {
    return new Response("Document not found", {
      status: 404,
      headers: noIndexHeaders,
    })
  }

  if (!document.application) {
    return new Response("Document not found", {
      status: 404,
      headers: noIndexHeaders,
    })
  }

  if (
    !adminSession &&
    memberSession &&
    document.application.userId !== memberSession.user.id
  ) {
    return new Response("Forbidden", {
      status: 403,
      headers: noIndexHeaders,
    })
  }

  let fileBuffer: Buffer

  if (/^https?:\/\//.test(document.storagePath)) {
    const upstreamResponse = await fetch(document.storagePath, {
      cache: "no-store",
    })

    if (!upstreamResponse.ok) {
      return new Response("Unable to load the document file.", {
        status: 502,
        headers: noIndexHeaders,
      })
    }

    fileBuffer = Buffer.from(await upstreamResponse.arrayBuffer())
  } else {
    fileBuffer = await readStoredFile(document.storagePath)
  }

  return new Response(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `inline; filename="${sanitizeDownloadFileName(document.originalName)}"`,
      "Content-Type": document.mimeType,
      "Content-Length": String(fileBuffer.byteLength),
      "Cross-Origin-Resource-Policy": "same-site",
      ...noIndexHeaders,
    },
  })
}
