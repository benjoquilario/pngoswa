import type { Metadata } from "next";
import Link from "next/link";

import {
  FoundationSection,
  HomeFooter,
  HomeNavbar,
  ProgramsSection,
} from "@/components/home";
import {
  aboutFullDescription,
  objectives,
  scopeCoverage,
} from "@/components/home/data";

const aboutOgImage =
  "/api/og?title=About%20PNGOSWA&description=Philippine%20NGO%20Social%20Workers%20Association";

export const metadata: Metadata = {
  title: "About Philippine NGO Social Workers Association",
  description:
    "Learn about PNGOSWA, the Philippine NGO Social Workers Association, including our foundation, programs, and mission for NGO social workers in the Philippines.",
  keywords: [
    "About PNGOSWA",
    "Philippine NGO Social Workers Association",
    "Philippine NGO",
    "Ph NGO",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About PNGOSWA",
    description:
      "Learn about PNGOSWA, the Philippine NGO Social Workers Association, and our work for NGO social workers in the Philippines.",
    url: "/about",
    images: [aboutOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "About PNGOSWA",
    description:
      "Learn about PNGOSWA, the Philippine NGO Social Workers Association, and our work for NGO social workers in the Philippines.",
    images: [aboutOgImage],
  },
};

export default function AboutPage() {
  return (
    <>
      <HomeNavbar />

      <main className="flex-1" id="top">
        <section className="page-header">
          <div
            className="container"
            style={{ padding: "3rem 1.25rem 2.5rem", position: "relative" }}
          >
            <Link href="/" className="back-link">
              Back to Home
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
              About PNGOSWA
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: "1.0625rem",
                maxWidth: "48rem",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              {aboutFullDescription}
            </p>
            <div className="about-header-actions">
              <Link href="/membership" className="btn btn-cta">
                Become a Member
              </Link>
              <Link href="/#gallery" className="btn btn-ghost">
                View Community Gallery
              </Link>
            </div>
          </div>
          <div className="gradient-bar" />
        </section>

        <section
          className="section-py"
          style={{ background: "var(--surface-warm)" }}
        >
          <div className="container about-grid">
            <article className="card about-card">
              <h2>Who We Serve</h2>
              <p>
                PNGOSWA is dedicated to NGO social workers in diverse practice
                settings, making sure no sector is left behind in professional
                support and representation.
              </p>
              <ul className="about-list">
                {scopeCoverage.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="card about-card">
              <h2>Why This Association Matters</h2>
              <p>
                NGO social workers often work in complex and under-resourced
                environments. PNGOSWA strengthens the profession by creating a
                unified network for advocacy, skill development, and collective
                support.
              </p>
              <p>
                Through shared programs and partnerships, members can build
                stronger services for communities while advancing their own
                professional growth.
              </p>
            </article>
          </div>
        </section>

        <FoundationSection />

        <ProgramsSection />

        <section
          className="section-py"
          style={{ background: "var(--surface)" }}
        >
          <div className="container">
            <span className="section-label">Our Commitments</span>
            <h2 className="section-title">How We Deliver Impact</h2>
            <p className="section-desc" style={{ marginBottom: "1.25rem" }}>
              These objectives guide our programs, collaborations, and long-term
              work for NGO social workers across the country.
            </p>
            <ol className="obj-list">
              {objectives.map((objective, index) => (
                <li key={objective} className="obj-item">
                  <span className="obj-num">{index + 1}</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="section-py"
          style={{ background: "var(--surface-warm)", paddingTop: "0" }}
        >
          <div className="container">
            <div className="about-join-card">
              <h2>Be Part of the PNGOSWA Community</h2>
              <p>
                Join a nationwide movement of social workers committed to
                advocacy, excellence, and sustainable impact.
              </p>
              <Link href="/membership" className="btn btn-cta">
                Start Membership Application
              </Link>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </>
  );
}
