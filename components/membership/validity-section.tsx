export function ValiditySection() {
  return (
    <section
      className="section-py"
      style={{ background: "var(--surface-warm)" }}
    >
      <div className="container" style={{ maxWidth: "56rem" }}>
        <span className="section-label">Section IV</span>
        <h2 className="section-title">Validity, Renewal &amp; Termination</h2>
        <div className="mem-grid" style={{ marginTop: "1.5rem" }}>
          <article className="mem-card">
            <h3 style={{ color: "var(--navy)" }}>Validity</h3>
            <p style={{ margin: 0, color: "var(--ink-secondary)" }}>
              One (1) year from date of approval (except Lifetime and Honorary
              Members).
            </p>
          </article>
          <article className="mem-card">
            <h3 style={{ color: "var(--cyan)" }}>Renewal</h3>
            <p style={{ margin: 0, color: "var(--ink-secondary)" }}>
              Annual renewal upon payment of applicable annual dues.
            </p>
          </article>
          <article className="mem-card">
            <h3 style={{ color: "var(--crimson)" }}>Grounds for Termination</h3>
            <ul className="mem-list">
              <li>Non-renewal of membership</li>
              <li>
                Violation of the Association&apos;s Constitution, By-Laws, or
                Code of Ethics
              </li>
            </ul>
          </article>
          <article className="mem-card">
            <h3 style={{ color: "var(--violet)" }}>Reinstatement</h3>
            <p style={{ margin: 0, color: "var(--ink-secondary)" }}>
              Subject to compliance with requirements and Board approval.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
