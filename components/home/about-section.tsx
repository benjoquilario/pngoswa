import Link from "next/link"

import { aboutSummary } from "./data"

export function AboutSection() {
  return (
    <section
      id="about"
      className="section-py"
      style={{ background: "var(--surface-warm)" }}
    >
      <div className="container">
        <div
          style={{
            maxWidth: "48rem",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <span className="section-label">About Us</span>
          <h2 className="section-title">Meet PNGOSWA</h2>
          <p className="section-desc" style={{ margin: "1.25rem auto 0" }}>
            <strong>Philippine NGO Social Workers Association (PNGOSWA)</strong>{" "}
            {aboutSummary}
          </p>
          <div className="about-cta-row" style={{ marginTop: "1.5rem" }}>
            <Link href="/about" className="btn btn-primary">
              Read Full About Page
            </Link>
            <Link href="/about#programs" className="btn btn-outline">
              See Our Programs
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
