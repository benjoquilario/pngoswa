"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import type { MembershipUploadedFile } from "@/lib/membership-form"
import { UploadInput } from "@/components/ui"

type MemberDocumentUpdateFormProps = {
  applicationId: string
  membershipType: string
  paymentCategory: string
  isConventionAttendee: boolean
  hasPrcLicense: boolean
  existingDocumentTypes: string[]
}

type MemberDocumentUpdateValues = {
  resumeUpload: MembershipUploadedFile | null
  employmentProofUpload: MembershipUploadedFile | null
  prcLicenseUpload: MembershipUploadedFile | null
  endorsementUpload: MembershipUploadedFile | null
  certificateUpload: MembershipUploadedFile | null
  membershipPaymentProof: MembershipUploadedFile | null
  shirtIdPaymentProof: MembershipUploadedFile | null
  photoUpload: MembershipUploadedFile | null
}

type UpdateResponse =
  | {
      ok: true
      message: string
      updatedDocuments: string[]
    }
  | {
      ok: false
      message: string
      errors?: Record<string, string>
    }

const emptyValues: MemberDocumentUpdateValues = {
  resumeUpload: null,
  employmentProofUpload: null,
  prcLicenseUpload: null,
  endorsementUpload: null,
  certificateUpload: null,
  membershipPaymentProof: null,
  shirtIdPaymentProof: null,
  photoUpload: null,
}

export function MemberDocumentUpdateForm({
  applicationId,
  membershipType,
  paymentCategory,
  isConventionAttendee,
  hasPrcLicense,
  existingDocumentTypes,
}: MemberDocumentUpdateFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<MemberDocumentUpdateValues>(emptyValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const documentStatuses = useMemo(
    () => [
      {
        fieldName: "resumeUpload" as const,
        type: "RESUME",
        label: "CV / Resume",
        endpoint: "membershipDocument" as const,
        accept: ".pdf,.jpg,.jpeg,.png",
        allowedText: "PDF, JPG, or PNG up to 8MB",
        required: true,
      },
      {
        fieldName: "employmentProofUpload" as const,
        type: "EMPLOYMENT_PROOF",
        label: "Proof of Employment / Leadership Role",
        endpoint: "membershipDocument" as const,
        accept: ".pdf,.jpg,.jpeg,.png",
        allowedText: "PDF, JPG, or PNG up to 8MB",
        required: membershipType !== "HONORARY",
      },
      {
        fieldName: "prcLicenseUpload" as const,
        type: "PRC_LICENSE",
        label: "PRC License Copy",
        endpoint: "membershipDocument" as const,
        accept: ".pdf,.jpg,.jpeg,.png",
        allowedText: "PDF, JPG, or PNG up to 8MB",
        required: hasPrcLicense,
      },
      {
        fieldName: "endorsementUpload" as const,
        type: "ENDORSEMENT",
        label: "Recommendation / Endorsement",
        endpoint: "membershipDocument" as const,
        accept: ".pdf,.jpg,.jpeg,.png",
        allowedText: "PDF, JPG, or PNG up to 8MB",
        required: membershipType === "HONORARY",
      },
      {
        fieldName: "certificateUpload" as const,
        type: "ATTENDANCE_CERTIFICATE",
        label: "Certificate of Participation / Attendance",
        endpoint: "membershipDocument" as const,
        accept: ".pdf,.jpg,.jpeg,.png",
        allowedText: "PDF, JPG, or PNG up to 8MB",
        required: isConventionAttendee,
      },
      {
        fieldName: "membershipPaymentProof" as const,
        type: "MEMBERSHIP_PAYMENT_PROOF",
        label: "Membership Fee Proof of Payment",
        endpoint: "membershipDocument" as const,
        accept: ".pdf,.jpg,.jpeg,.png",
        allowedText: "PDF, JPG, or PNG up to 8MB",
        required: paymentCategory !== "WAIVED_FREE_MEMBERSHIP",
      },
      {
        fieldName: "shirtIdPaymentProof" as const,
        type: "SHIRT_ID_PAYMENT_PROOF",
        label: "T-Shirt and ID Proof of Payment",
        endpoint: "membershipDocument" as const,
        accept: ".pdf,.jpg,.jpeg,.png",
        allowedText: "PDF, JPG, or PNG up to 8MB",
        required: true,
      },
      {
        fieldName: "photoUpload" as const,
        type: "ID_PHOTO",
        label: "2x2 ID Photo",
        endpoint: "membershipPhoto" as const,
        accept: ".jpg,.jpeg,.png",
        allowedText: "JPG or PNG up to 8MB",
        required: true,
      },
    ],
    [hasPrcLicense, isConventionAttendee, membershipType, paymentCategory]
  )

  const selectedUploadsCount = Object.values(values).filter(Boolean).length
  const hasExistingDocument = (type: string) =>
    existingDocumentTypes.includes(type) ||
    (existingDocumentTypes.includes("PAYMENT_PROOF") &&
      (type === "MEMBERSHIP_PAYMENT_PROOF" ||
        type === "SHIRT_ID_PAYMENT_PROOF"))

  const setFieldValue = (
    fieldName: keyof MemberDocumentUpdateValues,
    value: MembershipUploadedFile | null
  ) => {
    setValues((current) => ({
      ...current,
      [fieldName]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (selectedUploadsCount === 0) {
      setSubmitSuccess(null)
      setSubmitError("Choose at least one document before saving updates.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const response = await fetch("/api/member/application-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          ...values,
        }),
      })

      const payload = (await response.json()) as UpdateResponse

      if (!response.ok || !payload.ok) {
        setSubmitError(
          payload.message ||
            "We could not save your updated documents right now."
        )
        return
      }

      setSubmitSuccess(payload.message)
      setValues(emptyValues)
      router.refresh()
    } catch {
      setSubmitError(
        "We could not save your updated documents right now. Please try again in a moment."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="member-doc-form" onSubmit={handleSubmit}>
      <div className="form-notice member-doc-notice">
        <strong>Upload additional or replacement files.</strong>
        <p>
          Use this section if PNGOSWA requested follow-up documents or if you
          need to replace a file you already submitted. Missing payment proofs
          can also be completed here.
        </p>
      </div>

      {submitSuccess ? (
        <div className="form-feedback form-feedback-success">
          <strong>Documents updated successfully.</strong>
          <p>{submitSuccess}</p>
        </div>
      ) : null}

      {submitError ? (
        <div className="form-feedback form-feedback-error">
          <strong>We could not save your document update yet.</strong>
          <p>{submitError}</p>
        </div>
      ) : null}

      <div className="member-doc-grid">
        {documentStatuses.map((document) => {
          const alreadySubmitted = hasExistingDocument(document.type)
          const hint = alreadySubmitted
            ? "Already uploaded. Add a new file only if you need to replace it."
            : document.required
              ? document.fieldName === "shirtIdPaymentProof"
                ? "Missing from your application. All members need to upload this payment proof here."
                : "Missing from your application. Please upload it here."
              : "Optional unless PNGOSWA asks for it."

          return (
            <UploadInput
              key={document.fieldName}
              id={document.fieldName}
              label={document.label}
              hint={hint}
              required={!alreadySubmitted && document.required}
              accept={document.accept}
              allowedText={document.allowedText}
              endpoint={document.endpoint}
              value={values[document.fieldName]}
              onChange={(value) => setFieldValue(document.fieldName, value)}
              disabled={isSubmitting}
            />
          )
        })}
      </div>

      <div className="member-doc-toolbar">
        <p className="member-doc-meta">
          {selectedUploadsCount === 0
            ? "No new files selected yet."
            : `${selectedUploadsCount} document${selectedUploadsCount === 1 ? "" : "s"} ready to save.`}
        </p>
        <button
          type="submit"
          className="btn btn-cta btn-lg"
          disabled={isSubmitting || selectedUploadsCount === 0}
        >
          {isSubmitting ? "Saving documents..." : "Save document updates"}
        </button>
      </div>
    </form>
  )
}
