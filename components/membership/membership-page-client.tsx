import Link from "next/link"

import {
  CategoriesSection,
  GeneralPrivilegesSection,
  MembershipFooter,
  MembershipHeaderSection,
  MembershipNavbar,
  PurposeSection,
  ValiditySection,
} from "@/components/membership"

export function MembershipPageClient() {
  return (
    <>
      <MembershipNavbar />

      <main className="flex-1">
        <MembershipHeaderSection />
        <PurposeSection />
        <CategoriesSection />
        <GeneralPrivilegesSection />
        <section
          id="apply"
          className="section-py"
          style={{ background: "var(--surface)" }}
        >
          <div className="container">
            <div className="membership-signup-card">
              <span className="section-label">Membership Sign-up</span>
              <h2 className="section-title">Ready to apply for membership?</h2>
              <p className="section-desc">
                Complete the dedicated membership form so PNGOSWA can review
                your personal, employment, education, professional, payment, ID,
                and consent details.
              </p>
              <Link href="/membership/apply" className="btn btn-cta btn-lg">
                Fill Out Membership Form
              </Link>
            </div>
          </div>
        </section>
        <ValiditySection />
      </main>

      <MembershipFooter />
    </>
  )
}
