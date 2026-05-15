import Link from "next/link"

import type { MembershipCommunityStats } from "@/lib/membership"

import { ArrowLeftIcon } from "./icons"

type MembershipHeaderSectionProps = {
  communityStats: MembershipCommunityStats
}

export function MembershipHeaderSection({
  communityStats,
}: MembershipHeaderSectionProps) {
  const progressPercent = Math.min(
    (communityStats.freeRegularMembershipUsed /
      communityStats.freeRegularMembershipLimit) *
      100,
    100
  )

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
        <div className="community-highlight">
          <article className="community-stat-card">
            <span className="community-stat-label">
              Approved PNGOSWA members
            </span>
            <strong className="community-stat-value">
              {communityStats.approvedMembers}
            </strong>
            <p className="community-stat-copy">
              Members already reflected in the association community.
            </p>
          </article>
          <article className="community-stat-card">
            <span className="community-stat-label">
              Free regular-member allocation
            </span>
            <strong className="community-stat-value">
              {communityStats.freeRegularMembershipUsed}/
              {communityStats.freeRegularMembershipLimit}
            </strong>
            <div
              className="community-progress"
              aria-label="Free regular membership allocation progress"
            >
              <span
                className="community-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="community-stat-copy">
              {communityStats.freeRegularMembershipRemaining > 0
                ? `${communityStats.freeRegularMembershipRemaining} free regular-member slots left.`
                : "The first 500 free regular-member slots have all been claimed."}
            </p>
          </article>
        </div>
      </div>
      <div className="gradient-bar" />
    </section>
  )
}
