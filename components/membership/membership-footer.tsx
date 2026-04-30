import Image from "next/image"
import Link from "next/link"

export function MembershipFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <Image
                src="/logo.jpg"
                alt="PNGOSWA"
                width={44}
                height={44}
                style={{
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-heading), system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.125rem",
                }}
              >
                PNGOSWA
              </span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                opacity: 0.6,
                lineHeight: 1.6,
                maxWidth: "20rem",
              }}
            >
              Empowering NGO social workers through advocacy, professional
              development, and solidarity since 2024.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link href="/#about">About Us</Link>
              </li>
              <li>
                <Link href="/#objectives">Objectives</Link>
              </li>
              <li>
                <Link href="/#programs">Programs</Link>
              </li>
              <li>
                <a href="#categories">Membership</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:info@pngoswa.org">info@pngoswa.org</a>
              </li>
              <li>
                <a href="#apply">Apply for Membership</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} PNGOSWA. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
