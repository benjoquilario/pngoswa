import Image from "next/image";
import Link from "next/link";

import { UserPlusIcon } from "./icons";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="anim-rise">
          <span className="section-label">Est. 2024 - Philippines</span>
          <h1 className="hero-title">
            Empowering <span className="gradient-text">NGO Social Workers</span>{" "}
            Across the Philippines
          </h1>
          <p className="hero-desc">
            We are a unified community of NGO social workers committed to
            advocacy, professional growth, and driving impactful social change
            for communities nationwide.
          </p>
          <blockquote className="hero-quote">
            &ldquo;Alone we can do so little; together we can do so much.&rdquo;
            <cite>- Ricky A. Bunao, RSW, MPS-MPA, MCDRM, PhD (HC)</cite>
          </blockquote>
          <div className="hero-actions">
            <Link href="/membership" className="btn btn-cta btn-lg">
              <UserPlusIcon />
              Become a Member
            </Link>
            <a href="#about" className="btn btn-outline btn-lg">
              Learn More
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <p className="hero-stat-val" style={{ color: "var(--navy)" }}>
                2024
              </p>
              <p className="hero-stat-label">Founded</p>
            </div>
            <div>
              <p className="hero-stat-val" style={{ color: "var(--crimson)" }}>
                NGO
              </p>
              <p className="hero-stat-label">Sector Focus</p>
            </div>
            <div>
              <p className="hero-stat-val" style={{ color: "var(--cyan)" }}>
                PH
              </p>
              <p className="hero-stat-label">Nationwide</p>
            </div>
          </div>
        </div>
        <div className="anim-rise d2">
          <div className="hero-img-wrap">
            <Image
              src="/hero.jpg"
              alt="Social workers collaborating together"
              width={1200}
              height={900}
              priority
            />
            <div className="hero-img-overlay" />
            <div className="hero-img-badge">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              Nationwide collaboration for social impact
            </div>
          </div>
        </div>
      </div>
      <div className="gradient-bar" />
    </section>
  );
}
