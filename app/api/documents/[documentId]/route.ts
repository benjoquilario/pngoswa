import { getCurrentPortalSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { readStoredFile } from "@/lib/storage"

export const dynamic = "force-dynamic"

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
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

  if (/^https?:\/\//.test(document.storagePath)) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: document.storagePath,
        ...noIndexHeaders,
      },
    })
  }

  const fileBuffer = await readStoredFile(document.storagePath)

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      "Content-Disposition": `inline; filename="${document.originalName}"`,
      "Content-Type": document.mimeType,
      "Content-Length": String(document.sizeBytes),
      ...noIndexHeaders,
    },
  })
}
