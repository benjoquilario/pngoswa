import type { Metadata } from "next"

import { JsonLd } from "@/components/seo/json-ld"
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
import { faqs } from "@/components/home/data"
import {
  createBreadcrumbJsonLd,
  ORGANIZATION_NAME,
  ORGANIZATION_SHORT_NAME,
} from "@/lib/seo"
import { getSiteUrl } from "@/lib/site-url"

const homeOgImage =
  "/api/og?title=PNGOSWA&description=Support%20for%20NGO%20social%20workers%20in%20the%20Philippines"
const siteUrl = getSiteUrl()
const homeDescription =
  `${ORGANIZATION_SHORT_NAME} stands for the ${ORGANIZATION_NAME}. It is a professional organization dedicated to representing, connecting, and empowering social workers operating within the non-governmental organization (NGO) and private sectors in the Philippines.`

export const metadata: Metadata = {
  title: `${ORGANIZATION_SHORT_NAME} | ${ORGANIZATION_NAME}`,
  description: homeDescription,
  keywords: [
    "PNGOSWA",
    "what is PNGOSWA",
    "PNGOSWA meaning",
    "Philippine NGO Social Workers Association",
    "NGO social workers Philippines",
    "social workers in NGOs Philippines",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${ORGANIZATION_SHORT_NAME} | ${ORGANIZATION_NAME}`,
    description: homeDescription,
    url: "/",
    images: [homeOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ORGANIZATION_SHORT_NAME} | ${ORGANIZATION_NAME}`,
    description: homeDescription,
    images: [homeOgImage],
  },
}

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#home`,
      url: siteUrl,
      name: `${ORGANIZATION_SHORT_NAME} | ${ORGANIZATION_NAME}`,
      description: homeDescription,
      isPartOf: {
        "@id": `${siteUrl}#website`,
      },
      about: {
        "@id": `${siteUrl}#organization`,
      },
      breadcrumb: {
        "@id": `${siteUrl}/#breadcrumb`,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      ...createBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
      "@id": `${siteUrl}/#breadcrumb`,
    },
  ],
}

export default function Home() {
  return (
    <>
      <HomeNavbar />
      <JsonLd data={homeStructuredData} />

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
