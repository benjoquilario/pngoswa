export function AboutSection() {
  return (
    <section
      id="about"
      className="section-py"
      style={{ background: "var(--surface-warm)" }}
    >
      <div className="container">
        <div
          style={{
            maxWidth: "48rem",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <span className="section-label">About Us</span>
          <h2 className="section-title">Who We Are</h2>
          <p className="section-desc" style={{ margin: "1.25rem auto 0" }}>
            The{" "}
            <strong>Philippine NGO Social Workers Association (PNGOSWA)</strong>{" "}
            is a professional organization established in 2024, exclusively
            serving social workers in the non-governmental sector. We address
            the distinct needs of NGO-based practitioners - from faith-based
            organizations and civil society groups to foundations and
            development projects - championing their rights, welfare, and
            professional excellence.
          </p>
        </div>
      </div>
    </section>
  );
}
