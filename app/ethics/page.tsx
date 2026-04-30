import type { Metadata } from "next"
import Link from "next/link"

import { ethicsPrinciples, policyAreas } from "@/lib/constants"
import { HomeFooter, HomeNavbar } from "@/components/home"

const ethicsOgImage =
  "/api/og?title=PNGOSWA%20Code%20of%20Ethics&description=Code%20of%20Ethics%20and%20Policies%20of%20PNGOSWA"

export const metadata: Metadata = {
  title: "Code of Ethics & Policies | PNGOSWA",
  description:
    "Read the PNGOSWA Code of Ethics and organizational policies aligned with the association's current programs, services, and activities.",
  alternates: {
    canonical: "/ethics",
  },
  openGraph: {
    title: "Code of Ethics & Policies | PNGOSWA",
    description:
      "Code of Ethics and organizational policies aligned with PNGOSWA programs.",
    url: "/ethics",
    images: [ethicsOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Code of Ethics & Policies | PNGOSWA",
    description:
      "Code of Ethics and organizational policies aligned with PNGOSWA programs.",
    images: [ethicsOgImage],
  },
}

export default function EthicsPage() {
  return (
    <>
      <HomeNavbar />

      <main className="flex-1" id="top">
        <section className="page-header">
          <div
            className="container"
            style={{ padding: "3rem 1.25rem 2.5rem", position: "relative" }}
          >
            <Link href="/about" className="back-link">
              Back to About
            </Link>
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                marginBottom: "0.875rem",
                color: "var(--navy-50)",
              }}
            >
              Code of Ethics & Policies
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: "1.0625rem",
                maxWidth: "52rem",
                lineHeight: 1.7,
                marginBottom: "1.25rem",
              }}
            >
              This guide sets the ethical standards and policy directions of
              PNGOSWA based on the association&apos;s present programs in
              advocacy, professional development, networking, well-being,
              organizational strengthening, community engagement, public
              education, and crisis response.
            </p>
            <div className="about-header-actions">
              <Link href="/membership" className="btn btn-cta">
                Become a Member
              </Link>
              <Link href="/about#programs" className="btn btn-ghost">
                View Current Programs
              </Link>
            </div>
          </div>
          <div className="gradient-bar" />
        </section>

        <section
          className="section-py"
          style={{ background: "var(--surface-warm)" }}
        >
          <div className="container">
            <span className="section-label">Ethical Foundation</span>
            <h2 className="section-title">Code of Ethics</h2>
            <p className="section-desc">
              These principles guide the conduct of officers, members,
              committees, and partners acting under the name of PNGOSWA.
            </p>
            <div className="ethics-grid">
              {ethicsPrinciples.map((principle) => (
                <article key={principle.title} className="card ethics-card">
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section-py"
          style={{ background: "var(--surface)" }}
        >
          <div className="container">
            <span className="section-label">Program-Aligned Governance</span>
            <h2 className="section-title">Organizational Policies</h2>
            <p className="section-desc">
              These policies translate the Code of Ethics into standards for
              your current PNGOSWA programs, services, and activities.
            </p>
            <div className="policy-stack">
              {policyAreas.map((policy) => (
                <article key={policy.title} className="card policy-card">
                  <p className="policy-kicker">{policy.alignment}</p>
                  <h3>{policy.title}</h3>
                  <ul className="about-list policy-list">
                    {policy.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section-py"
          style={{ background: "var(--surface-warm)", paddingTop: "0" }}
        >
          <div className="container">
            <div className="about-join-card">
              <h2>Use This as Your Governance Draft</h2>
              <p>
                You can adopt this as a working draft for your officers, improve
                the wording in meetings, and later align it with your
                Constitution, By-Laws, membership handbook, and committee
                guidelines.
              </p>
              <Link href="/membership" className="btn btn-cta">
                Share With Members
              </Link>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </>
  )
}
