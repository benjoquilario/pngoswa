"use client"

import { useState } from "react"

import { officerRoleOptions } from "@/lib/officer-roles"

const reviewMessageTemplates = {
  approve: {
    label: "Accept Member",
    subject: "Your PNGOSWA membership application has been approved",
    message:
      "Thanks for filling up the form and submitting the requirements. You are now officially a member of PNGOSWA. Please settle the PHP 500 payment for the official PNGOSWA shirt and ID soon. We will announce the details soon.",
  },
  "follow-up": {
    label: "Follow Up",
    subject: "Additional requirements for your PNGOSWA membership application",
    message:
      "Thank you for your application. Please review and complete the missing or unclear requirements so we can continue processing your PNGOSWA membership.",
  },
  reject: {
    label: "Reject Application",
    subject: "Update on your PNGOSWA membership application",
    message:
      "Thank you for applying to PNGOSWA. After review, we are unable to approve your application at this time. You may reply to this email if you need clarification on the decision or next steps.",
  },
} as const

type ReviewMembershipActionFormProps = {
  actionHandler: (formData: FormData) => void | Promise<void>
  applicationId: string
  initialMessage: string
  initialOfficerRoleName: string | null
  canAssignOfficerRole: boolean
}

export function ReviewMembershipActionForm({
  actionHandler,
  applicationId,
  initialMessage,
  initialOfficerRoleName,
  canAssignOfficerRole,
}: ReviewMembershipActionFormProps) {
  const matchedOfficerRole = officerRoleOptions.find(
    (option) => option === initialOfficerRoleName
  )
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState(initialMessage)
  const [officerRoleName, setOfficerRoleName] = useState(
    matchedOfficerRole
      ? matchedOfficerRole
      : initialOfficerRoleName
        ? "__other__"
        : ""
  )
  const [customOfficerRoleName, setCustomOfficerRoleName] = useState(
    matchedOfficerRole ? "" : (initialOfficerRoleName ?? "")
  )

  const applyTemplate = (templateKey: keyof typeof reviewMessageTemplates) => {
    const template = reviewMessageTemplates[templateKey]
    setSubject(template.subject)
    setMessage(template.message)
  }

  return (
    <form action={actionHandler} className="review-form">
      <input type="hidden" name="applicationId" value={applicationId} />

      <div className="review-template-strip">
        {Object.entries(reviewMessageTemplates).map(
          ([templateKey, template]) => (
            <button
              key={templateKey}
              type="button"
              className="review-template-chip"
              onClick={() =>
                applyTemplate(
                  templateKey as keyof typeof reviewMessageTemplates
                )
              }
            >
              {template.label}
            </button>
          )
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="subject">
          Email subject
        </label>
        <div className="form-hint">
          Leave blank to use the default PNGOSWA email subject for this action.
        </div>
        <input
          id="subject"
          name="subject"
          className="form-input"
          type="text"
          placeholder="Application update from PNGOSWA"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="message">
          Reviewer message
        </label>
        <div className="form-hint">
          Optional for accept and reject. For follow-up, your note will be
          included in the email.
        </div>
        <textarea
          id="message"
          name="message"
          className="form-input"
          rows={8}
          placeholder="Use this space for follow-up instructions, decision context, or approval notes."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      {canAssignOfficerRole ? (
        <>
          <div className="form-group">
            <label className="form-label" htmlFor="officerRoleName">
              Officer role assignment
            </label>
            <div className="form-hint">
              President-only control. This is only applied when approving the
              member.
            </div>
            <select
              id="officerRoleName"
              name="officerRoleName"
              className="form-input"
              value={officerRoleName}
              onChange={(event) => setOfficerRoleName(event.target.value)}
            >
              <option value="">Keep as regular member</option>
              {officerRoleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="__other__">Other officer role</option>
            </select>
          </div>

          {officerRoleName === "__other__" ? (
            <div className="form-group">
              <label className="form-label" htmlFor="customOfficerRoleName">
                Custom officer role name
              </label>
              <input
                id="customOfficerRoleName"
                name="customOfficerRoleName"
                className="form-input"
                type="text"
                placeholder="Regional Coordinator, Board Adviser, etc."
                value={customOfficerRoleName}
                onChange={(event) =>
                  setCustomOfficerRoleName(event.target.value)
                }
              />
            </div>
          ) : (
            <input
              type="hidden"
              name="customOfficerRoleName"
              value={customOfficerRoleName}
            />
          )}
        </>
      ) : null}

      <div className="review-actions">
        <button
          className="btn btn-primary"
          type="submit"
          name="action"
          value="approve"
        >
          Accept Membership
        </button>
        <button
          className="btn btn-outline"
          type="submit"
          name="action"
          value="follow-up"
        >
          Send Follow Up
        </button>
        <button
          className="btn btn-cta"
          type="submit"
          name="action"
          value="reject"
        >
          Reject Application
        </button>
      </div>
    </form>
  )
}
