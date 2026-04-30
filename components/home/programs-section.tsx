import { programs } from "./data"

export function ProgramsSection() {
  return (
    <section
      id="programs"
      className="section-py"
      style={{ background: "var(--surface)" }}
    >
      <div className="container">
        <span className="section-label">What We Do</span>
        <h2 className="section-title">Programs, Services &amp; Activities</h2>
        <p className="section-desc">
          The association delivers integrated programs that support advocacy,
          growth, wellness, organizational capability, and crisis response.
        </p>
        <div className="prog-grid">
          {programs.map((program) => (
            <article key={program.title} className="prog-card">
              <h3>{program.title}</h3>
              <ul className="prog-items">
                {program.items.map((item, index) => (
                  <li key={item.label} className="prog-item">
                    <span className="prog-bullet">{index + 1}</span>
                    <p className="prog-text">
                      <strong>{item.label}:</strong> {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
