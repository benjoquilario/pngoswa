import { statements } from "./data";
import { EyeIcon, FlagIcon, TargetIcon } from "./icons";

const statementIcons = {
  eye: EyeIcon,
  target: TargetIcon,
  flag: FlagIcon,
} as const;

export function FoundationSection() {
  return (
    <section className="section-py" style={{ background: "var(--surface)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="section-label">Our Foundation</span>
          <h2 className="section-title">Vision, Mission &amp; Goal</h2>
          <p className="section-desc" style={{ margin: "0 auto" }}>
            Guided by purpose, driven by impact - the pillars that define
            everything we do.
          </p>
        </div>
        <div className="vmg-grid">
          {statements.map((statement) => {
            const Icon = statementIcons[statement.icon];

            return (
              <article
                key={statement.name}
                className="card card-accent-top vmg-card"
                style={{ borderTopColor: statement.accent }}
              >
                <div
                  className="vmg-icon-wrap"
                  style={{ background: statement.bg }}
                >
                  <Icon />
                </div>
                <h3 style={{ color: statement.accent }}>{statement.name}</h3>
                <p>{statement.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
