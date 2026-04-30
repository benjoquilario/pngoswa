"use client"

import { useState } from "react"

import {
  ApplicationFormSection,
  MembershipFooter,
  MembershipNavbar,
} from "@/components/membership"
import type { MembershipFormState } from "@/components/membership/types"

const initialFormState: MembershipFormState = {
  lastName: "",
  firstName: "",
  middleName: "",
  gender: "",
  dateOfBirth: "",
  civilStatus: "",
  prcLicense: "",
  dateOfRegistration: "",
  contactNumber: "",
  email: "",
  region: "",
  organization: "",
  officeAddress: "",
  position: "",
  employmentStatus: "",
  lengthOfService: "",
  areaOfPractice: "",
  degree: "",
  school: "",
  yearGraduated: "",
  postgraduateStudies: "",
  specializations: "",
  otherOrganizations: "",
  membershipType: "",
  paymentMode: "",
  isConventionAttendee: "",
  agreed: false,
}

export function MembershipApplyPageClient() {
  const [form, setForm] = useState<MembershipFormState>(initialFormState)

  const handleInput = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = event.target
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value

    setForm((prev) => ({
      ...prev,
      [target.name]: value,
    }))
  }

  const handleAgreementChange = (agreed: boolean) => {
    setForm((prev) => ({ ...prev, agreed }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    alert(
      "Thank you for your application! PNGOSWA will review your submission and contact you soon."
    )
  }

  return (
    <>
      <MembershipNavbar />
      <main className="flex-1">
        <section className="page-header">
          <div
            className="container"
            style={{ padding: "3rem 1.25rem 2.5rem", position: "relative" }}
          >
            <p className="back-link" style={{ marginBottom: "1rem" }}>
              Membership Application Form
            </p>
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                marginBottom: "0.75rem",
                color: "var(--navy-50)",
              }}
            >
              Apply for PNGOSWA Membership
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.125rem",
                maxWidth: "42rem",
                lineHeight: 1.6,
              }}
            >
              Complete your personal, employment, educational, professional,
              payment, ID, and data privacy details in one submission.
            </p>
          </div>
          <div className="gradient-bar" />
        </section>
        <ApplicationFormSection
          form={form}
          onInputChange={handleInput}
          onAgreementChange={handleAgreementChange}
          onSubmit={handleSubmit}
        />
      </main>
      <MembershipFooter />
    </>
  )
}
