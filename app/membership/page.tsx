import type { Metadata } from "next"

import { JsonLd } from "@/components/seo/json-ld"
import { categories } from "@/components/membership/data"
import { MembershipPageClient } from "@/components/membership/membership-page-client"
import {
  createBreadcrumbJsonLd,
  ORGANIZATION_NAME,
  ORGANIZATION_SHORT_NAME,
} from "@/lib/seo"
import { getMembershipCommunityStats } from "@/lib/membership"
import { getSiteUrl } from "@/lib/site-url"

const membershipOgImage =
  "/api/og?title=PNGOSWA%20Membership&description=Join%20the%20Philippine%20NGO%20Social%20Workers%20Association"
const siteUrl = getSiteUrl()

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: `${ORGANIZATION_SHORT_NAME} Membership`,
  description:
    `Join ${ORGANIZATION_SHORT_NAME} and review membership categories, privileges, validity, renewal, and support for NGO social workers in the Philippines.`,
  keywords: [
    "PNGOSWA membership",
    `${ORGANIZATION_NAME} membership`,
    "join PNGOSWA",
    "NGO social workers membership Philippines",
  ],
  alternates: {
    canonical: "/membership",
  },
  openGraph: {
    title: "Membership | PNGOSWA",
    description:
      "Join PNGOSWA and access programs, development support, and membership privileges for NGO social workers.",
    url: "/membership",
    images: [membershipOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Membership | PNGOSWA",
    description:
      "Join PNGOSWA and access programs, development support, and membership privileges for NGO social workers.",
    images: [membershipOgImage],
  },
}

const membershipStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteUrl}/membership#webpage`,
      url: `${siteUrl}/membership`,
      name: `${ORGANIZATION_SHORT_NAME} Membership`,
      description:
        `Membership information, benefits, categories, and application guidance for ${ORGANIZATION_SHORT_NAME}.`,
      isPartOf: {
        "@id": `${siteUrl}#website`,
      },
      about: {
        "@id": `${siteUrl}#organization`,
      },
      breadcrumb: {
        "@id": `${siteUrl}/membership#breadcrumb`,
      },
    },
    {
      "@type": "ItemList",
      name: `${ORGANIZATION_SHORT_NAME} membership categories`,
      itemListElement: categories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: category.name,
        description: category.eligibility.join(" "),
      })),
    },
    {
      ...createBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Membership", path: "/membership" },
      ]),
      "@id": `${siteUrl}/membership#breadcrumb`,
    },
  ],
}

export default async function MembershipPage() {
  const communityStats = await getMembershipCommunityStats()

  return (
    <>
      <JsonLd data={membershipStructuredData} />
      <MembershipPageClient communityStats={communityStats} />
    </>
  )
}
