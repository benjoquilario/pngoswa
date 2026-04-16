import Link from "next/link";

import { ArrowLeftIcon } from "./icons";

export function MembershipHeaderSection() {
  return (
    <section className="page-header">
      <div
        className="container"
        style={{ padding: "3rem 1.25rem 2.5rem", position: "relative" }}
      >
        <Link href="/" className="back-link">
          <ArrowLeftIcon /> Back to Home
        </Link>
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.12,
            marginBottom: "0.75rem",
            color: "var(--navy-50)",
          }}
        >
          Membership Guidelines
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "1.125rem",
            maxWidth: "36rem",
            lineHeight: 1.6,
          }}
        >
          Join the Philippine NGO Social Workers Association and become part of
          a professional community dedicated to excellence, advocacy, and
          solidarity.
        </p>
      </div>
      <div className="gradient-bar" />
    </section>
  );
}
