"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { UserPlusIcon } from "./icons";

export function MembershipNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`navbar ${isMenuOpen ? "menu-open" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="nav-inner">
        <Link href="/" className="nav-brand" onClick={closeMenu}>
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
          <Link href="/about" className="nav-link">
            About
          </Link>
          <Link href="/#objectives" className="nav-link">
            Objectives
          </Link>
          <Link href="/about#programs" className="nav-link">
            Programs
          </Link>
          <a href="#membership" className="nav-link">
            Membership
          </a>
        </div>
        <a href="#apply" className="btn btn-cta nav-cta">
          <UserPlusIcon /> Apply Now
        </a>

        <button
          ref={menuButtonRef}
          type="button"
          className="nav-toggle"
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-controls="membership-mobile-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="nav-toggle-icon" aria-hidden="true">
            <span className="nav-toggle-line" />
            <span className="nav-toggle-line" />
            <span className="nav-toggle-line" />
          </span>
        </button>
      </div>

      <div
        id="membership-mobile-menu"
        className={`nav-mobile-panel ${isMenuOpen ? "open" : ""}`}
        role="region"
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
        hidden={!isMenuOpen}
      >
        <div className="nav-mobile-links">
          <Link href="/about" className="nav-mobile-link" onClick={closeMenu}>
            About
          </Link>
          <Link
            href="/#objectives"
            className="nav-mobile-link"
            onClick={closeMenu}
          >
            Objectives
          </Link>
          <Link
            href="/about#programs"
            className="nav-mobile-link"
            onClick={closeMenu}
          >
            Programs
          </Link>
          <a href="#membership" className="nav-mobile-link" onClick={closeMenu}>
            Membership
          </a>
          <a
            href="#apply"
            className="btn btn-cta nav-mobile-cta"
            onClick={closeMenu}
          >
            <UserPlusIcon />
            Apply Now
          </a>
        </div>
      </div>
    </nav>
  );
}
