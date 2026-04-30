import type { Metadata } from "next"

import { MembershipApplyPageClient } from "@/components/membership/membership-apply-page-client"

const membershipApplyOgImage =
  "/api/og?title=PNGOSWA%20Membership%20Application&description=Complete%20your%20PNGOSWA%20membership%20application%20form"

export const metadata: Metadata = {
  title: "Membership Application | Philippine NGO Social Workers Association",
  description:
    "Complete the PNGOSWA membership application form with your personal, employment, educational, professional, payment, and consent details.",
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

export default function MembershipApplyPage() {
  return <MembershipApplyPageClient />
}
