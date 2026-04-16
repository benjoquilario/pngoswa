import Image from "next/image";
import Link from "next/link";

import { UserPlusIcon } from "./icons";

export function MembershipNavbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <Image
            src="/logo.jpg"
            alt="PNGOSWA Logo"
            width={40}
            height={40}
            className="nav-logo"
            priority
          />
          <span>PNGOSWA</span>
        </Link>
        <div className="nav-links">
          <Link href="/#about" className="nav-link">
            About
          </Link>
          <Link href="/#objectives" className="nav-link">
            Objectives
          </Link>
          <Link href="/#programs" className="nav-link">
            Programs
          </Link>
          <a href="#categories" className="nav-link">
            Membership
          </a>
        </div>
        <a href="#apply" className="btn btn-cta nav-cta">
          <UserPlusIcon /> Apply Now
        </a>
      </div>
    </nav>
  );
}
