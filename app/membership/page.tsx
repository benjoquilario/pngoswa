import type { Metadata } from "next";

import { MembershipPageClient } from "@/components/membership/membership-page-client";

const membershipOgImage =
  "/api/og?title=PNGOSWA%20Membership&description=Join%20the%20Philippine%20NGO%20Social%20Workers%20Association";

export const metadata: Metadata = {
  title: "Membership | Philippine NGO Social Workers Association",
  description:
    "Apply for PNGOSWA membership and review categories, privileges, validity, renewal, and membership support for NGO social workers in the Philippines.",
  keywords: [
    "PNGOSWA membership",
    "Philippine NGO Social Workers Association membership",
    "Philippine NGO membership",
    "Ph NGO membership",
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
};

export default function MembershipPage() {
  return <MembershipPageClient />;
}
