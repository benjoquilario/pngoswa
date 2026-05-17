import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_SESSION_COOKIE = "pngoswa_admin_session"
const MEMBER_SESSION_COOKIE = "pngoswa_member_session"
const CANONICAL_PRODUCTION_HOST = "www.pngoswa.org"
const APEX_PRODUCTION_HOST = "pngoswa.org"

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""
  return NextResponse.redirect(url)
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request
  const pathname = nextUrl.pathname
  const hostname = nextUrl.hostname.toLowerCase()
  const isProduction = process.env.NODE_ENV === "production"

  if (isProduction && hostname === APEX_PRODUCTION_HOST) {
    const canonicalUrl = nextUrl.clone()
    canonicalUrl.hostname = CANONICAL_PRODUCTION_HOST
    canonicalUrl.protocol = "https:"
    canonicalUrl.port = ""
    return NextResponse.redirect(canonicalUrl, 308)
  }

  const hasAdminSession = request.cookies.has(ADMIN_SESSION_COOKIE)
  const hasMemberSession = request.cookies.has(MEMBER_SESSION_COOKIE)

  if (pathname === "/admin") {
    return hasAdminSession
      ? redirectTo(request, "/admin/dashboard")
      : redirectTo(request, "/admin/login")
  }

  if (pathname === "/admin/login" && hasAdminSession) {
    return redirectTo(request, "/admin/dashboard")
  }

  if (pathname.startsWith("/admin/dashboard") && !hasAdminSession) {
    return redirectTo(request, "/admin/login")
  }

  if (pathname === "/member") {
    return hasMemberSession
      ? redirectTo(request, "/member/profile")
      : redirectTo(request, "/member/login")
  }

  if (pathname === "/member/login" && hasMemberSession) {
    return redirectTo(request, "/member/profile")
  }

  if (pathname.startsWith("/member/profile") && !hasMemberSession) {
    return redirectTo(request, "/member/login")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/auth/verify"],
}
