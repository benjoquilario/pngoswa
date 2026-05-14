import { redirect } from "next/navigation"

import { requestAdminMagicLink } from "@/app/admin/actions"
import { MagicLinkRequestForm } from "@/components/portal/magic-link-request-form"
import { getCurrentPortalSession, isDevelopmentAuthBypassEnabled } from "@/lib/auth"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ invalid?: string }>
}) {
  const params = await searchParams
  const session = await getCurrentPortalSession("ADMIN")
  const isDevBypass = isDevelopmentAuthBypassEnabled()

  if (session) {
    redirect("/admin/dashboard")
  }

  return (
    <main className="auth-shell">
      <section className="auth-card auth-card-admin">
        <span className="section-label">Admin Platform</span>
        <h1 className="auth-title">Access the membership dashboard</h1>
        <MagicLinkRequestForm
          action={requestAdminMagicLink}
          description={
            isDevBypass
              ? "Use an admin email that has already been synced into the database. In development, approved admin accounts are signed in directly and redirected to the dashboard without email delivery."
              : "Use an admin email that has already been synced into the database to receive a secure access link for the PNGOSWA membership review dashboard."
          }
          initialError={
            params.invalid === "1"
              ? "That admin sign-in link is invalid, expired, or has already been used. Request a new access link below."
              : undefined
          }
          pendingLabel={
            isDevBypass ? "Signing in..." : "Sending admin access link..."
          }
          submitLabel={
            isDevBypass ? "Sign in to admin dashboard" : "Send admin access link"
          }
        />
      </section>
    </main>
  )
}
