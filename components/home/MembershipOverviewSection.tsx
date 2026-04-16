import Image from "next/image";

import { memberBenefits, membershipRequirements, scopeCoverage } from "./data";

export function MembershipOverviewSection() {
  return (
    <section
      id="membership"
      className="section-py"
      style={{ background: "var(--surface-warm)" }}
    >
      <div className="container">
        <span className="section-label">Membership</span>
        <h2 className="section-title">Scope, Requirements &amp; Benefits</h2>
        <div className="mem-grid">
          <article className="mem-card">
            <h3>Scope &amp; Coverage</h3>
            <ul className="mem-list">
              {scopeCoverage.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="mem-card">
            <h3>Requirements</h3>
            <ol className="mem-list">
              {membershipRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="mem-card">
            <h3>Entitlements &amp; Benefits</h3>
            <ul className="mem-list">
              {memberBenefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
        <div className="impact-strip">
          <div className="impact-text">
            <p>
              By implementing these programs and services, PNGOSWA can
              effectively support its members and help them deliver
              high-quality, sustainable social services nationwide.
            </p>
            <p>
              This comprehensive approach strengthens professional capability,
              promotes worker welfare, and contributes to the overall social
              development of the Philippines.
            </p>
          </div>
          <Image
            src="/hero.jpg"
            alt="Professional social worker"
            width={900}
            height={640}
            className="impact-img"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
