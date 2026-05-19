"use client"

import { useActionState } from "react"
import Link from "next/link"

import { completeMagicLinkSignIn } from "@/app/auth/verify/actions"

type MagicLinkVerificationState = {
  error?: string
}

const initialMagicLinkVerificationState: MagicLinkVerificationState = {}

type MagicLinkVerificationFormProps = {
  expiresInMinutes: number
  scope: "ADMIN" | "MEMBER"
  token: string
}

export function MagicLinkVerificationForm({
  expiresInMinutes,
  scope,
  token,
}: MagicLinkVerificationFormProps) {
  const [state, formAction, pending] = useActionState<
    MagicLinkVerificationState,
    FormData
  >(completeMagicLinkSignIn, initialMagicLinkVerificationState)

  return (
    <form action={formAction} className="auth-form">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="scope" value={scope.toLowerCase()} />

      <div className="form-feedback form-feedback-success" aria-live="polite">
        <p>This secure link is ready.</p>
        <p>
          It expires in about {expiresInMinutes} minute
          {expiresInMinutes === 1 ? "" : "s"}.
        </p>
      </div>

      {state.error ? (
        <div
          className="form-feedback form-feedback-error"
          aria-live="assertive"
        >
          <p>{state.error}</p>
          <div className="auth-actions-row">
            <Link
              href={scope === "ADMIN" ? "/admin/login" : "/member/login"}
              className="btn btn-outline"
            >
              Back to login
            </Link>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        className="btn btn-cta btn-lg submit-btn"
        disabled={pending}
      >
        {pending
          ? scope === "ADMIN"
            ? "Signing you in..."
            : "Opening your profile..."
          : scope === "ADMIN"
            ? "Continue to admin dashboard"
            : "Continue to member profile"}
      </button>
    </form>
  )
}
