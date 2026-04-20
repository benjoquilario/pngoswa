import { faqs } from "./data";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="section-py"
      style={{ background: "var(--surface)" }}
    >
      <div className="container">
        <span className="section-label">Frequently Asked Questions</span>
        <h2 className="section-title">Why Join PNGOSWA?</h2>
        <p className="section-desc">
          Quick answers to common questions from social workers who are planning
          to become members.
        </p>

        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
