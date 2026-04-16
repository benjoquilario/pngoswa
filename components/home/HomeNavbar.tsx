import Image from "next/image";

import { UserPlusIcon } from "./icons";
import Link from "next/link";

export function HomeNavbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <a href="#top" className="nav-brand">
          <Image
            src="/logo.jpg"
            alt="PNGOSWA Logo"
            width={40}
            height={40}
            className="nav-logo"
            priority
          />
          <span>PNGOSWA</span>
        </a>
        <div className="nav-links">
          <a href="#about" className="nav-link">
            About
          </a>
          <a href="#objectives" className="nav-link">
            Objectives
          </a>
          <a href="#programs" className="nav-link">
            Programs
          </a>
          <a href="#membership" className="nav-link">
            Membership
          </a>
        </div>
        <Link href="/membership" className="btn btn-cta nav-cta">
          <UserPlusIcon />
          Become a Member
        </Link>
      </div>
    </nav>
  );
}
