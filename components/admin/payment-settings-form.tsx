"use client"

import { useState, type FormEvent } from "react"

import type { PublicPaymentSettings } from "@/lib/payment-settings"
import { Field, Input, Textarea, UploadInput } from "@/components/ui"

type SaveResponse =
  | {
      ok: true
      message: string
      settings: PublicPaymentSettings
    }
  | {
      ok: false
      message: string
      errors?: Record<string, string>
    }

type PaymentSettingsFormProps = {
  initialSettings: PublicPaymentSettings
}

export function PaymentSettingsForm({
  initialSettings,
}: PaymentSettingsFormProps) {
  const [gcashNumber, setGcashNumber] = useState(initialSettings.gcashNumber)
  const [mayaNumber, setMayaNumber] = useState(initialSettings.mayaNumber)
  const [privacyMessage, setPrivacyMessage] = useState(
    initialSettings.privacyMessage
  )
  const [qrCode, setQrCode] = useState(initialSettings.qrCode)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setFieldErrors({})
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gcashNumber,
          mayaNumber,
          privacyMessage,
          qrCode,
        }),
      })

      const payload = (await response.json()) as SaveResponse

      if (!response.ok || !payload.ok) {
        setFieldErrors(payload.ok ? {} : (payload.errors ?? {}))
        setSubmitError(
          payload.message || "We could not save the payment settings right now."
        )
        return
      }

      setGcashNumber(payload.settings.gcashNumber)
      setMayaNumber(payload.settings.mayaNumber)
      setPrivacyMessage(payload.settings.privacyMessage)
      setQrCode(payload.settings.qrCode)
      setSubmitSuccess(payload.message)
    } catch {
      setSubmitError(
        "We could not save the payment settings right now. Please try again in a moment."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-notice">
        Configure the payment details shown to applicants under the membership
        form payment mode section.
      </div>

      {submitSuccess ? (
        <div className="form-feedback form-feedback-success">
          <strong>Payment settings saved.</strong>
          <p>{submitSuccess}</p>
        </div>
      ) : null}

      {submitError ? (
        <div className="form-feedback form-feedback-error">
          <strong>We could not save the payment settings yet.</strong>
          <p>{submitError}</p>
        </div>
      ) : null}

      <div className="dashboard-settings-grid">
        <Field
          htmlFor="gcashNumber"
          label="GCash Number"
          error={fieldErrors.gcashNumber}
        >
          <Input
            id="gcashNumber"
            placeholder="09XX XXX XXXX"
            value={gcashNumber}
            onChange={(event) => setGcashNumber(event.target.value)}
            invalid={!!fieldErrors.gcashNumber}
          />
        </Field>

        <Field
          htmlFor="mayaNumber"
          label="Maya Number"
          error={fieldErrors.mayaNumber}
        >
          <Input
            id="mayaNumber"
            placeholder="09XX XXX XXXX"
            value={mayaNumber}
            onChange={(event) => setMayaNumber(event.target.value)}
            invalid={!!fieldErrors.mayaNumber}
          />
        </Field>
      </div>

      <UploadInput
        id="paymentQrCode"
        label="Payment QR Code"
        hint="Optional. Upload the QR code you want to show for digital wallet payments."
        accept=".jpg,.jpeg,.png"
        allowedText="JPG or PNG up to 8MB"
        endpoint="paymentQrCode"
        value={qrCode}
        onChange={setQrCode}
        error={fieldErrors.qrCode}
        disabled={isSaving}
      />

      <Field
        htmlFor="privacyMessage"
        label="Privacy Reassurance Message"
        error={fieldErrors.privacyMessage}
      >
        <Textarea
          id="privacyMessage"
          rows={4}
          placeholder="Your payment and personal information are protected..."
          value={privacyMessage}
          onChange={(event) => setPrivacyMessage(event.target.value)}
          invalid={!!fieldErrors.privacyMessage}
        />
      </Field>

      <div className="review-actions">
        <button className="btn btn-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Saving payment settings..." : "Save payment settings"}
        </button>
      </div>
    </form>
  )
}
