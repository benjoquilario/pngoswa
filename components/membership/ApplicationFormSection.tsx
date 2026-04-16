import { docOptions, membershipTypeOptions } from "./data";
import type { MembershipFormState } from "./types";

type ApplicationFormSectionProps = {
  form: MembershipFormState;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleDoc: (doc: string) => void;
  onAgreementChange: (agreed: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ApplicationFormSection({
  form,
  onInputChange,
  onToggleDoc,
  onAgreementChange,
  onSubmit,
}: ApplicationFormSectionProps) {
  return (
    <section
      id="apply"
      className="section-py"
      style={{ background: "var(--surface)" }}
    >
      <div className="container" style={{ maxWidth: "48rem" }}>
        <span className="section-label">Section V</span>
        <h2 className="section-title">Membership Application Form</h2>
        <p className="section-desc" style={{ marginBottom: "0.5rem" }}>
          Fill out the form below to apply for PNGOSWA membership.
        </p>

        <form onSubmit={onSubmit} className="membership-form">
          <fieldset className="form-fieldset">
            <legend className="form-legend">Personal Information</legend>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div className="form-group">
                <label htmlFor="profession" className="form-label">
                  Profession / Position <span className="req">*</span>
                </label>
                <input
                  id="profession"
                  name="profession"
                  type="text"
                  required
                  value={form.profession}
                  onChange={onInputChange}
                  className="form-input"
                  placeholder="Social Worker"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="organization" className="form-label">
                NGO / Organization <span className="req">*</span>
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
              <label htmlFor="prcLicense" className="form-label">
                PRC License No.{" "}
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
            <legend className="form-legend">
              Application Requirements Uploaded
            </legend>
            <p className="form-hint" style={{ marginBottom: "0.5rem" }}>
              Check all documents you are submitting:
            </p>
            <div className="option-group">
              {docOptions.map((doc) => (
                <label
                  key={doc}
                  className={`option-card ${form.docs.includes(doc) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={form.docs.includes(doc)}
                    onChange={() => onToggleDoc(doc)}
                    className="option-input"
                  />
                  <span>{doc}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="agreement-box">
            <label
              className="option-card"
              style={{
                border: "none",
                padding: 0,
                background: "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(event) => onAgreementChange(event.target.checked)}
                required
                className="option-input"
              />
              <span>
                I agree to abide by the Constitution, By-Laws, and Code of
                Ethics of the Philippine NGO Social Workers Association.{" "}
                <span className="req">*</span>
              </span>
            </label>
          </div>

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
  );
}
