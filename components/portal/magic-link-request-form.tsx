"use client"

import { useActionState } from "react"

export type MagicLinkFormState = {
  error?: string
  success?: string
  debugUrl?: string
  submittedEmail?: string
  expiresInMinutes?: number
}

type MagicLinkRequestFormProps = {
  action: (
    state: MagicLinkFormState,
    formData: FormData
  ) => Promise<MagicLinkFormState>
  description: string
  initialError?: string
  pendingLabel: string
  submitLabel: string
}

const initialState: MagicLinkFormState = {}

export function MagicLinkRequestForm({
  action,
  description,
  initialError,
  pendingLabel,
  submitLabel,
}: MagicLinkRequestFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const submittedEmail = state.submittedEmail?.trim()

  return (
    <form action={formAction} className="auth-form">
      <p className="auth-copy">{description}</p>
      <label className="form-label" htmlFor="portal-email">
        Email address
      </label>
      <input
        id="portal-email"
        name="email"
        type="email"
        required
        autoCapitalize="none"
        autoComplete="email"
        className="form-input"
        defaultValue={submittedEmail ?? ""}
        inputMode="email"
        placeholder="you@email.com"
        spellCheck={false}
      />
      {state.error || initialError ? (
        <div
          className="form-feedback form-feedback-error"
          aria-live="assertive"
        >
          <p>{state.error ?? initialError}</p>
        </div>
      ) : null}
      {state.success ? (
        <div className="form-feedback form-feedback-success" aria-live="polite">
          <p>{state.success}</p>
          {submittedEmail ? (
            <p>
              If portal access is available for <strong>{submittedEmail}</strong>,
              the sign-in link should arrive within a minute.
            </p>
          ) : null}
          {state.expiresInMinutes ? (
            <p>
              The link expires in {state.expiresInMinutes} minutes. Open it in
              the browser where you want to stay signed in.
            </p>
          ) : null}
          {state.debugUrl ? (
            <p>
              Development access link:{" "}
              <a href={state.debugUrl}>{state.debugUrl}</a>
            </p>
          ) : null}
        </div>
      ) : null}
      <button
        type="submit"
        className="btn btn-cta btn-lg submit-btn"
        disabled={pending}
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  )
}
