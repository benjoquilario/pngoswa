import Image from "next/image";

import { objectives } from "./data";

export function ObjectivesSection() {
  return (
    <section
      id="objectives"
      className="section-py"
      style={{ background: "var(--surface-warm)" }}
    >
      <div className="container">
        <span className="section-label">What We Stand For</span>
        <h2 className="section-title">Our Objectives</h2>
        <p className="section-desc">
          Seven key priorities that guide our actions and shape our commitment
          to every NGO social worker.
        </p>
        <div className="obj-grid">
          <ol className="obj-list">
            {objectives.map((objective, index) => (
              <li key={index} className="obj-item">
                <span className="obj-num">{index + 1}</span>
                <span>{objective}</span>
              </li>
            ))}
          </ol>
          <div className="obj-img">
            <Image
              src="/objectives.jpg"
              alt="Team collaboration and planning session"
              width={800}
              height={600}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
