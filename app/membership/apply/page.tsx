import type { Metadata } from "next"

import { getMembershipCommunityStats } from "@/lib/membership"
import { getPublicPaymentSettings } from "@/lib/payment-settings"
import {
  createBreadcrumbJsonLd,
  ORGANIZATION_NAME,
  ORGANIZATION_SHORT_NAME,
} from "@/lib/seo"
import { getSiteUrl } from "@/lib/site-url"
import { MembershipApplyPageClient } from "@/components/membership/membership-apply-page-client"
import { JsonLd } from "@/components/seo/json-ld"

const membershipApplyOgImage =
  "/api/og?title=PNGOSWA%20Membership%20Application&description=Complete%20your%20PNGOSWA%20membership%20application%20form"
const siteUrl = getSiteUrl()

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: `Apply for ${ORGANIZATION_SHORT_NAME} Membership`,
  description: `Complete the online membership application form for ${ORGANIZATION_NAME}.`,
  alternates: {
    canonical: "/membership/apply",
  },
  openGraph: {
    title: "Membership Application | PNGOSWA",
    description: "Complete the PNGOSWA membership application form online.",
    url: "/membership/apply",
    images: [membershipApplyOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Membership Application | PNGOSWA",
    description: "Complete the PNGOSWA membership application form online.",
    images: [membershipApplyOgImage],
  },
}

const membershipApplyStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/membership/apply#webpage`,
      url: `${siteUrl}/membership/apply`,
      name: `Apply for ${ORGANIZATION_SHORT_NAME} Membership`,
      description: `Online application form for ${ORGANIZATION_SHORT_NAME} membership.`,
      isPartOf: {
        "@id": `${siteUrl}#website`,
      },
      about: {
        "@id": `${siteUrl}#organization`,
      },
      breadcrumb: {
        "@id": `${siteUrl}/membership/apply#breadcrumb`,
      },
    },
    {
      ...createBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Membership", path: "/membership" },
        { name: "Apply", path: "/membership/apply" },
      ]),
      "@id": `${siteUrl}/membership/apply#breadcrumb`,
    },
  ],
}

export default async function MembershipApplyPage() {
  const [paymentSettings, communityStats] = await Promise.all([
    getPublicPaymentSettings(),
    getMembershipCommunityStats(),
  ])

  return (
    <>
      <JsonLd data={membershipApplyStructuredData} />
      <MembershipApplyPageClient
        paymentSettings={paymentSettings}
        communityStats={communityStats}
      />
    </>
  )
}
