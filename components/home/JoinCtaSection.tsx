import Link from "next/link";

import { UserPlusIcon } from "./icons";

export function JoinCtaSection() {
  return (
    <section className="cta-section section-py">
      <div
        className="container"
        style={{ position: "relative", textAlign: "center" }}
      >
        <div style={{ maxWidth: "36rem", margin: "0 auto" }}>
          <h2
            style={{
              color: "white",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.12,
              marginBottom: "1rem",
            }}
          >
            Join the Movement for Philippine NGO Social Workers
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "1.125rem",
              lineHeight: 1.65,
              marginBottom: "2rem",
            }}
          >
            Be part of a growing community of passionate professionals. Access
            exclusive trainings, networking events, and advocacy platforms that
            amplify your impact.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <Link href="/membership" className="btn btn-cta btn-lg">
              <UserPlusIcon />
              Become a Member
            </Link>
            <a href="#about" className="btn btn-ghost btn-lg">
              Learn About Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
