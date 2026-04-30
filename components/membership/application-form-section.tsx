import Link from "next/link"

import { membershipTypeOptions } from "./data"
import type { MembershipFormState } from "./types"

type ApplicationFormSectionProps = {
  form: MembershipFormState
  onInputChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void
  onAgreementChange: (agreed: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function ApplicationFormSection({
  form,
  onInputChange,
  onAgreementChange,
  onSubmit,
}: ApplicationFormSectionProps) {
  return (
    <section
      id="apply"
      className="section-py"
      style={{ background: "var(--surface)" }}
    >
      <div className="container" style={{ maxWidth: "64rem" }}>
        <span className="section-label">Membership Form</span>
        <h2 className="section-title">Membership Application Form</h2>
        <p className="section-desc" style={{ marginBottom: "0.5rem" }}>
          Fill out the form below to apply for PNGOSWA membership. Fields marked
          with an asterisk are required.
        </p>

        <form onSubmit={onSubmit} className="membership-form">
          <fieldset className="form-fieldset">
            <legend className="form-legend">1. Personal Information</legend>
            <div className="form-row form-row-3">
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name <span className="req">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="Dela Cruz"
                />
              </div>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name <span className="req">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="Juan"
                />
              </div>
              <div className="form-group">
                <label htmlFor="middleName" className="form-label">
                  Middle Name
                </label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  value={form.middleName}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="Santos"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Sex / Gender <span className="req">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={form.gender}
                  onChange={onInputChange}
                  className="form-input"
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth <span className="req">*</span>
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={form.dateOfBirth}
                  onChange={onInputChange}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="civilStatus" className="form-label">
                  Civil Status <span className="req">*</span>
                </label>
                <select
                  id="civilStatus"
                  name="civilStatus"
                  required
                  value={form.civilStatus}
                  onChange={onInputChange}
                  className="form-input"
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="prcLicense" className="form-label">
                  PRC License Number{" "}
                  <span className="form-hint">(if applicable)</span>
                </label>
                <input
                  id="prcLicense"
                  name="prcLicense"
                  type="text"
                  value={form.prcLicense}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="License number"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfRegistration" className="form-label">
                  Date of Registration <span className="req">*</span>
                </label>
                <input
                  id="dateOfRegistration"
                  name="dateOfRegistration"
                  type="date"
                  required
                  value={form.dateOfRegistration}
                  onChange={onInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactNumber" className="form-label">
                  Contact Number <span className="req">*</span>
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  required
                  value={form.contactNumber}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="09XX XXX XXXX"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="you@email.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="region" className="form-label">
                  Region <span className="req">*</span>
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  required
                  value={form.region}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="NCR, Region IV-A, Region VII"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">2. Employment Information</legend>
            <div className="form-group">
              <label htmlFor="organization" className="form-label">
                Name of Organization / NGO <span className="req">*</span>
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                value={form.organization}
                onChange={onInputChange}
                className="form-input"
                placeholder="Organization name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="officeAddress" className="form-label">
                Office Address <span className="req">*</span>
              </label>
              <textarea
                id="officeAddress"
                name="officeAddress"
                required
                value={form.officeAddress}
                onChange={onInputChange}
                className="form-input"
                rows={3}
                placeholder="Complete office address"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="position" className="form-label">
                  Position / Designation <span className="req">*</span>
                </label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  required
                  value={form.position}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="Social Worker, Case Manager"
                />
              </div>
              <div className="form-group">
                <label htmlFor="employmentStatus" className="form-label">
                  Employment Status <span className="req">*</span>
                </label>
                <select
                  id="employmentStatus"
                  name="employmentStatus"
                  required
                  value={form.employmentStatus}
                  onChange={onInputChange}
                  className="form-input"
                >
                  <option value="">Select status</option>
                  <option value="regular">Regular</option>
                  <option value="contractual">Contractual</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lengthOfService" className="form-label">
                  Length of Service <span className="req">*</span>
                </label>
                <input
                  id="lengthOfService"
                  name="lengthOfService"
                  type="text"
                  required
                  value={form.lengthOfService}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="3 years"
                />
              </div>
              <div className="form-group">
                <label htmlFor="areaOfPractice" className="form-label">
                  Area of Practice <span className="req">*</span>
                </label>
                <input
                  id="areaOfPractice"
                  name="areaOfPractice"
                  type="text"
                  required
                  value={form.areaOfPractice}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="Child Welfare, Community Development"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">3. Educational Background</legend>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="degree" className="form-label">
                  Degree <span className="req">*</span>
                </label>
                <input
                  id="degree"
                  name="degree"
                  type="text"
                  required
                  value={form.degree}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="BS Social Work"
                />
              </div>
              <div className="form-group">
                <label htmlFor="school" className="form-label">
                  School / University <span className="req">*</span>
                </label>
                <input
                  id="school"
                  name="school"
                  type="text"
                  required
                  value={form.school}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="School name"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="yearGraduated" className="form-label">
                  Year Graduated <span className="req">*</span>
                </label>
                <input
                  id="yearGraduated"
                  name="yearGraduated"
                  type="text"
                  required
                  value={form.yearGraduated}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="2020"
                />
              </div>
              <div className="form-group">
                <label htmlFor="postgraduateStudies" className="form-label">
                  Postgraduate Studies{" "}
                  <span className="form-hint">(if any)</span>
                </label>
                <input
                  id="postgraduateStudies"
                  name="postgraduateStudies"
                  type="text"
                  value={form.postgraduateStudies}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="MA Social Work"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">4. Professional Information</legend>
            <div className="form-group">
              <label htmlFor="specializations" className="form-label">
                Areas of Specialization <span className="req">*</span>
              </label>
              <textarea
                id="specializations"
                name="specializations"
                required
                value={form.specializations}
                onChange={onInputChange}
                className="form-input"
                rows={3}
                placeholder="Case management, child protection, community organizing"
              />
            </div>
            <div className="form-group">
              <label htmlFor="otherOrganizations" className="form-label">
                Membership in Other Professional Organizations
              </label>
              <textarea
                id="otherOrganizations"
                name="otherOrganizations"
                value={form.otherOrganizations}
                onChange={onInputChange}
                className="form-input"
                rows={3}
                placeholder="List organizations or write N/A"
              />
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">
              Membership Type <span className="req">*</span>
            </legend>
            <div className="option-group">
              {membershipTypeOptions.map((typeOption) => (
                <label
                  key={typeOption.value}
                  className={`option-card ${form.membershipType === typeOption.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="membershipType"
                    value={typeOption.value}
                    checked={form.membershipType === typeOption.value}
                    onChange={onInputChange}
                    className="option-input"
                    required
                  />
                  <div>
                    <strong>{typeOption.label}</strong>
                    <span className="option-desc">{typeOption.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">5. Payment</legend>
            <div className="form-notice">
              <strong>Notice:</strong> Membership fee is waived for convention
              attendees. Only ID and T-shirt fees are required. Please upload
              your certificate.
            </div>
            <div className="option-group">
              <label
                className={`option-card ${form.isConventionAttendee === "yes" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="isConventionAttendee"
                  value="yes"
                  checked={form.isConventionAttendee === "yes"}
                  onChange={onInputChange}
                  className="option-input"
                  required
                />
                <span>Convention Attendee with Certificate</span>
              </label>
              <label
                className={`option-card ${form.isConventionAttendee === "no" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="isConventionAttendee"
                  value="no"
                  checked={form.isConventionAttendee === "no"}
                  onChange={onInputChange}
                  className="option-input"
                  required
                />
                <span>Regular Applicant</span>
              </label>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="certificateUpload" className="form-label">
                  Upload Certificate of Participation/Attendance
                </label>
                <input
                  id="certificateUpload"
                  name="certificateUpload"
                  type="file"
                  className="form-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              <div className="form-group">
                <label htmlFor="paymentProof" className="form-label">
                  Upload Proof of Payment <span className="req">*</span>
                </label>
                <input
                  id="paymentProof"
                  name="paymentProof"
                  type="file"
                  required
                  className="form-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="paymentMode" className="form-label">
                Mode of Payment <span className="req">*</span>
              </label>
              <select
                id="paymentMode"
                name="paymentMode"
                required
                value={form.paymentMode}
                onChange={onInputChange}
                className="form-input"
              >
                <option value="">Select payment mode</option>
                <option value="gcash">GCash</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">6. ID Information</legend>
            <div className="form-group">
              <label htmlFor="photoUpload" className="form-label">
                Upload 2x2 Photo <span className="req">*</span>
              </label>
              <input
                id="photoUpload"
                name="photoUpload"
                type="file"
                required
                className="form-input"
                accept=".jpg,.jpeg,.png"
              />
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-legend">
              7. Declaration and Data Privacy Consent
            </legend>
            <div className="agreement-box">
              <p>
                Please read the statement below carefully and indicate your
                agreement before submitting your application.
              </p>
              <p>
                I hereby certify that all information provided in this form is
                true and correct to the best of my knowledge. I agree to abide
                by the Constitution and By-Laws, policies, and{" "}
                <Link className="text-[#e8475e]" href="/ethics">
                  Code of Ethics
                </Link>{" "}
                of the PNGOSWA.
              </p>
              <p>
                In compliance with the Data Privacy Act of 2012, I hereby
                authorize PNGOSWA to collect, process, store, and use my
                personal information for membership processing, record-keeping,
                and official communication purposes. I understand that my
                information will be treated with confidentiality and will not be
                disclosed to third parties without my consent, except as
                required by law.
              </p>
              <p>
                I have read and understood the above statements and voluntarily
                give my full consent.
              </p>
              <label className="option-card privacy-consent">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(event) => onAgreementChange(event.target.checked)}
                  required
                  className="option-input"
                />
                <span>
                  I agree to the Declaration and Data Privacy Consent{" "}
                  <span className="req">*</span>
                </span>
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            className="btn btn-cta btn-lg submit-btn"
            disabled={!form.agreed}
            style={{
              opacity: form.agreed ? 1 : 0.45,
              cursor: form.agreed ? "pointer" : "not-allowed",
            }}
          >
            Submit Application
          </button>
        </form>
      </div>
    </section>
  )
}
