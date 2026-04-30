import Image from "next/image"
import Link from "next/link"

import { UserPlusIcon } from "./icons"

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-grid container">
        <div className="anim-rise">
          <span className="section-label">Est. 2024 - Philippines</span>
          <div className="hero-banner">
            <p className="hero-kicker">
              Philippine NGO Social Workers Association
            </p>
            <h1 className="hero-title">
              One National Banner for{" "}
              <span className="gradient-text">NGO Social Workers</span>
            </h1>
          </div>
          <p className="hero-desc">
            Building one strong voice for advocacy, professional growth, and
            shared social impact.
          </p>
          <div className="hero-banner-tags" aria-label="Core pillars">
            <span>Advocacy</span>
            <span>Professional Growth</span>
            <span>National Collaboration</span>
          </div>
          <div className="hero-actions">
            <Link href="/membership" className="btn btn-cta btn-lg">
              <UserPlusIcon />
              Become a Member
            </Link>
            <a href="#gallery" className="btn btn-outline btn-lg">
              View Gallery
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
                10+
              </p>
              <p className="hero-stat-label">Core Programs</p>
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
              src="/helping-others.png"
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
              Stronger together for every community
            </div>
          </div>
        </div>
      </div>
      <div className="gradient-bar" />
    </section>
  )
}
