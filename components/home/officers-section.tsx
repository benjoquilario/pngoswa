import Image from "next/image"
import Link from "next/link"

import { officers } from "./data"

const animationClasses = ["d1", "d2", "d3", "d4", "d5", "d6"]

export function OfficersSection() {
  return (
    <section id="officers" className="section-py officers-section">
      <div className="container">
        <div className="officers-head">
          <span className="section-label">National Leadership</span>
          <h2 className="section-title">Meet the Officers</h2>
          <p className="section-desc">
            PNGOSWA officers lead advocacy, programs, and member support across
            regions to keep NGO social workers connected and represented.
          </p>
        </div>

        <div className="officers-grid">
          {officers.map((officer, index) => (
            <article
              key={officer.src}
              className={`officer-card anim-rise ${animationClasses[index % animationClasses.length]}`}
            >
              <div className="officer-photo-wrap">
                <Image
                  src={officer.src}
                  alt={`${officer.name}, ${officer.position}`}
                  width={720}
                  height={960}
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  loading={index > 3 ? "lazy" : undefined}
                  className="officer-photo"
                  style={
                    officer.objectPosition
                      ? { objectPosition: officer.objectPosition }
                      : undefined
                  }
                />
                <div className="officer-photo-overlay" />
              </div>
              <div className="officer-body">
                <p className="officer-position">{officer.position}</p>
                <h3>{officer.name}</h3>
              </div>
            </article>
          ))}
        </div>

        <div className="officers-cta">
          <p>
            Serving members nationwide with shared purpose and accountability.
          </p>
          <Link href="/membership" className="btn btn-primary">
            Join PNGOSWA
          </Link>
        </div>
      </div>
    </section>
  )
}
