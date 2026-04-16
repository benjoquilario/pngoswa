export function PurposeSection() {
  return (
    <section className="section-py" style={{ background: "var(--surface)" }}>
      <div className="container" style={{ maxWidth: "48rem" }}>
        <span className="section-label">Section I</span>
        <h2 className="section-title">Purpose of Membership</h2>
        <p className="section-desc">
          The Philippine NGO Social Workers Association (PNGOSWA) offers
          membership exclusively to social workers engaged in the NGO/private
          sector. Membership aims to promote
          <strong>
            {" "}
            professional support, capacity-building, ethical practice,
            networking, and collective representation
          </strong>{" "}
          of NGO social work in the Philippines.
        </p>
      </div>
    </section>
  );
}
