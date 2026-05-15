import type { MembershipCommunityStats } from "@/lib/membership"

import { categories } from "./data"

type CategoriesSectionProps = {
  communityStats: MembershipCommunityStats
}

export function CategoriesSection({ communityStats }: CategoriesSectionProps) {
  const progressPercent = Math.min(
    (communityStats.freeRegularMembershipUsed /
      communityStats.freeRegularMembershipLimit) *
      100,
    100
  )

  return (
    <section
      id="categories"
      className="section-py"
      style={{ background: "var(--surface-warm)" }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="section-label">Section II</span>
          <h2 className="section-title">Membership Categories</h2>
          <p className="section-desc" style={{ margin: "0 auto" }}>
            Individual membership - exclusively for NGO Social Workers.
          </p>
        </div>
        <div className="cat-grid">
          {categories.map((category) => (
            <article
              key={category.name}
              className="cat-card card-accent-top"
              style={{ borderTopColor: category.accent }}
            >
              <div className="cat-header">
                <h3 className="cat-name" style={{ color: category.accent }}>
                  {category.name}
                </h3>
                <span
                  className="cat-badge"
                  style={{ background: category.badgeBg }}
                >
                  {category.badge}
                </span>
              </div>
              <div className="cat-price-block">
                <p className="cat-price">{category.fee}</p>
                {category.feeNote && (
                  <p className="cat-price-note">{category.feeNote}</p>
                )}
                <p className="cat-annual">{category.annual}</p>
                {category.name === "Regular Member" ? (
                  <div className="community-meter">
                    <div className="community-meter-heading">
                      <strong>
                        {communityStats.freeRegularMembershipUsed}/
                        {communityStats.freeRegularMembershipLimit} approved
                        regular members
                      </strong>
                      <span>
                        {communityStats.freeRegularMembershipRemaining} left
                      </span>
                    </div>
                    <div
                      className="community-progress"
                      aria-label="Approved regular membership community count"
                    >
                      <span
                        className="community-progress-bar"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="cat-section">
                <h4 className="cat-label">Eligibility</h4>
                <ul className="cat-list">
                  {category.eligibility.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="cat-section" style={{ flex: 1 }}>
                <h4 className="cat-label">Rights &amp; Privileges</h4>
                <ul className="cat-check-list">
                  {category.privileges.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="cat-validity">
                <strong>Validity:</strong> {category.validity}
              </div>
              <div className="cat-section">
                <h4 className="cat-label">Application Requirements</h4>
                <ul className="cat-list">
                  {category.requirements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
