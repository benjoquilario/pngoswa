import type { Metadata } from "next"

import {
  AboutSection,
  FaqSection,
  GallerySection,
  HeroSection,
  HomeFooter,
  HomeNavbar,
  JoinCtaSection,
  ObjectivesSection,
  OfficersSection,
} from "@/components/home"

const homeOgImage =
  "/api/og?title=PNGOSWA&description=Support%20for%20NGO%20social%20workers%20in%20the%20Philippines"

export const metadata: Metadata = {
  title: "PNGOSWA Home",
  description:
    "PNGOSWA, the Philippine NGO Social Workers Association, supports NGO social workers in the Philippines through advocacy, programs, and membership initiatives.",
  keywords: [
    "Pngosw",
    "PNGOSWA",
    "Ph NGO",
    "Philippine NGO",
    "Philippine NGO Social Workers Association",
    "NGO social workers Philippines",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PNGOSWA | Philippine NGO Social Workers Association",
    description:
      "PNGOSWA supports NGO social workers in the Philippines through advocacy, programs, and professional development.",
    url: "/",
    images: [homeOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "PNGOSWA | Philippine NGO Social Workers Association",
    description:
      "PNGOSWA supports NGO social workers in the Philippines through advocacy, programs, and professional development.",
    images: [homeOgImage],
  },
}

export default function Home() {
  return (
    <>
      <HomeNavbar />

      <main className="flex-1" id="top">
        <HeroSection />
        <AboutSection />
        <OfficersSection />
        <ObjectivesSection />
        <GallerySection />
        <FaqSection />
        <JoinCtaSection />
      </main>

      <HomeFooter />
    </>
  )
}
