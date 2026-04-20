"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { galleryImages } from "./data";

export function GallerySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
    triggerButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % galleryImages.length;
        });
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => {
          if (prev === null) return 0;
          return (prev - 1 + galleryImages.length) % galleryImages.length;
        });
      }

      if (event.key === "Tab") {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const focusable = Array.from(
          overlay.querySelectorAll<HTMLElement>(
            'button, [href], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => !element.hasAttribute("disabled"));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === first) {
          event.preventDefault();
          last.focus();
          return;
        }

        if (!event.shiftKey && activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, closeLightbox]);

  const activeImage = activeIndex === null ? null : galleryImages[activeIndex];

  const showPrevImage = () => {
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + galleryImages.length) % galleryImages.length;
    });
  };

  const showNextImage = () => {
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % galleryImages.length;
    });
  };

  return (
    <section
      id="gallery"
      className="section-py"
      style={{ background: "var(--surface-warm)" }}
    >
      <div className="container">
        <span className="section-label">Photo Gallery</span>
        <h2 className="section-title">Our Community in Action</h2>
        <p className="section-desc">
          Browse moments from trainings, outreach activities, and member
          collaborations. Tap any photo to view it in full size.
        </p>

        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className="gallery-card"
              aria-label={`Open gallery image ${index + 1}`}
              onClick={(event) => {
                triggerButtonRef.current = event.currentTarget;
                setActiveIndex(index);
              }}
            >
              <div className="gallery-img-wrap">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1000}
                  height={760}
                  loading={index > 1 ? "lazy" : undefined}
                />
              </div>
            </button>
          ))}
        </div>

        {activeImage ? (
          <div
            className="lightbox-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Gallery lightbox"
            aria-describedby="gallery-lightbox-help"
            onClick={closeLightbox}
            ref={overlayRef}
          >
            <p id="gallery-lightbox-help" className="sr-only">
              Press Escape to close the viewer. Use Left and Right arrow keys to
              browse images.
            </p>

            <button
              ref={closeButtonRef}
              type="button"
              className="lightbox-close"
              onClick={(event) => {
                event.stopPropagation();
                closeLightbox();
              }}
              aria-label="Close image viewer"
            >
              Close
            </button>

            <button
              type="button"
              className="lightbox-nav lightbox-prev"
              onClick={(event) => {
                event.stopPropagation();
                showPrevImage();
              }}
              aria-label="Show previous image"
            >
              Prev
            </button>

            <div
              className="lightbox-frame"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                width={1600}
                height={1200}
                className="lightbox-img"
                priority
              />
            </div>

            <button
              type="button"
              className="lightbox-nav lightbox-next"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              aria-label="Show next image"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
