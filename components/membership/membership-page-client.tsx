import Link from "next/link"

import type { MembershipCommunityStats } from "@/lib/membership"

import {
  CategoriesSection,
  GeneralPrivilegesSection,
  MembershipFooter,
  MembershipHeaderSection,
  MembershipNavbar,
  PurposeSection,
  ValiditySection,
} from "@/components/membership"

type MembershipPageClientProps = {
  communityStats: MembershipCommunityStats
}

export function MembershipPageClient({
  communityStats,
}: MembershipPageClientProps) {
  return (
    <>
      <MembershipNavbar />

      <main className="flex-1">
        <MembershipHeaderSection communityStats={communityStats} />
        <PurposeSection />
        <CategoriesSection communityStats={communityStats} />
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
