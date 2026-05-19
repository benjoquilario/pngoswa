import Link from "next/link"
import { redirect } from "next/navigation"

import { MagicLinkVerificationForm } from "@/components/portal/magic-link-verification-form"
import {
  getCurrentPortalSession,
  getPortalLoginPath,
  getPortalRedirectPath,
  parsePortalScope,
  previewMagicLink,
} from "@/lib/auth"
import { getDatabaseUnavailableMessage } from "@/lib/db"

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

function getVerifyCopy(scope: "ADMIN" | "MEMBER") {
  if (scope === "ADMIN") {
    return {
      sectionLabel: "Admin Platform",
      title: "Confirm your admin sign-in",
      description:
        "For security, this email link is only used after you confirm it from this browser.",
      fallbackHref: "/admin/login",
      fallbackLabel: "Request another admin link",
    }
  }

  return {
    sectionLabel: "Member Portal",
    title: "Confirm your member sign-in",
    description:
      "For security, this email link is only used after you confirm it from this browser.",
    fallbackHref: "/member/login",
    fallbackLabel: "Request another member link",
  }
}

function getInvalidStateMessage(
  scope: "ADMIN" | "MEMBER",
  status: "invalid" | "used" | "expired" | "unavailable"
) {
  if (status === "used") {
    return `This ${scope === "ADMIN" ? "admin" : "member"} sign-in link has already been used. Request a new one below if you still need to sign in.`
  }

  if (status === "expired") {
    return `This ${scope === "ADMIN" ? "admin" : "member"} sign-in link has expired. Request a fresh one below.`
  }

  if (status === "unavailable") {
    return getDatabaseUnavailableMessage()
  }

  return `This ${scope === "ADMIN" ? "admin" : "member"} sign-in link is invalid. Request a new one below.`
}

export default async function VerifyMagicLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; scope?: string }>
}) {
  const params = await searchParams
  const scope = parsePortalScope(params.scope ?? null)

  if (!scope) {
    redirect("/")
  }

  const session = await getCurrentPortalSession(scope)

  if (session) {
    redirect(getPortalRedirectPath(scope))
  }

  const copy = getVerifyCopy(scope)
  const rawToken = params.token?.trim() ?? ""

  if (!/^[a-f0-9]{64}$/i.test(rawToken)) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <span className="section-label">{copy.sectionLabel}</span>
          <h1 className="auth-title">{copy.title}</h1>
          <p className="auth-copy">{copy.description}</p>
          <div className="form-feedback form-feedback-error">
            <p>{getInvalidStateMessage(scope, "invalid")}</p>
          </div>
          <div className="auth-actions-row">
            <Link href={copy.fallbackHref} className="btn btn-outline">
              {copy.fallbackLabel}
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const preview = await previewMagicLink(rawToken, scope)

  if (!preview.ok) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <span className="section-label">{copy.sectionLabel}</span>
          <h1 className="auth-title">{copy.title}</h1>
          <p className="auth-copy">{copy.description}</p>
          <div className="form-feedback form-feedback-error">
            <p>{getInvalidStateMessage(scope, preview.status)}</p>
          </div>
          <div className="auth-actions-row">
            <Link
              href={
                preview.status === "unavailable"
                  ? getPortalLoginPath(scope)
                  : copy.fallbackHref
              }
              className="btn btn-outline"
            >
              {preview.status === "unavailable"
                ? "Back to login"
                : copy.fallbackLabel}
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="section-label">{copy.sectionLabel}</span>
        <h1 className="auth-title">{copy.title}</h1>
        <p className="auth-copy">{copy.description}</p>
        <MagicLinkVerificationForm
          expiresInMinutes={preview.expiresInMinutes}
          scope={scope}
          token={rawToken}
        />
      </section>
    </main>
  )
}
