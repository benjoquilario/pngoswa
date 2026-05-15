import type { Metadata } from "next"
import { Lexend, Merriweather } from "next/font/google"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"

import { uploadRouter } from "@/app/api/uploadthing/core"
import { JsonLd } from "@/components/seo/json-ld"
import {
  createSiteNavigationJsonLd,
  ORGANIZATION_DESCRIPTION,
  ORGANIZATION_KEYWORDS,
  ORGANIZATION_NAME,
  ORGANIZATION_SHORT_NAME,
} from "@/lib/seo"
import { getSiteUrl } from "@/lib/site-url"

import "./globals.css"

const siteUrl = getSiteUrl()

const defaultOgImage =
  "/api/og?title=PNGOSWA&description=Philippine%20NGO%20Social%20Workers%20Association"

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
})

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: ORGANIZATION_SHORT_NAME,
  manifest: "/manifest.webmanifest",
  title: {
    default: `${ORGANIZATION_SHORT_NAME} | ${ORGANIZATION_NAME}`,
    template: `%s | ${ORGANIZATION_SHORT_NAME}`,
  },
  description: ORGANIZATION_DESCRIPTION,
  keywords: ORGANIZATION_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/favicon_ico/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon_ico/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon_ico/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    shortcut: ["/favicon_ico/favicon.ico"],
    apple: [
      {
        url: "/favicon_ico/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  openGraph: {
    title: `${ORGANIZATION_SHORT_NAME} | ${ORGANIZATION_NAME}`,
    description: ORGANIZATION_DESCRIPTION,
    url: "/",
    siteName: ORGANIZATION_SHORT_NAME,
    type: "website",
    locale: "en_PH",
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ORGANIZATION_SHORT_NAME} | ${ORGANIZATION_NAME}`,
    description: ORGANIZATION_DESCRIPTION,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NonprofitOrganization",
      "@id": `${siteUrl}#organization`,
      name: ORGANIZATION_NAME,
      alternateName: [ORGANIZATION_SHORT_NAME, "Ph NGO Social Workers Association"],
      url: siteUrl,
      description: ORGANIZATION_DESCRIPTION,
      email: "info@pngoswa.org",
      foundingDate: "2024",
      areaServed: "Philippines",
      knowsAbout: [
        "NGO social work",
        "professional development",
        "social work advocacy",
        "community engagement",
      ],
      keywords: ORGANIZATION_KEYWORDS.join(", "),
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.jpg`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      url: siteUrl,
      name: ORGANIZATION_SHORT_NAME,
      alternateName: ORGANIZATION_NAME,
      description: ORGANIZATION_DESCRIPTION,
      inLanguage: "en-PH",
      publisher: {
        "@id": `${siteUrl}#organization`,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#website-page`,
      url: siteUrl,
      name: `${ORGANIZATION_SHORT_NAME} | ${ORGANIZATION_NAME}`,
      description: ORGANIZATION_DESCRIPTION,
      isPartOf: {
        "@id": `${siteUrl}#website`,
      },
      about: {
        "@id": `${siteUrl}#organization`,
      },
    },
    ...createSiteNavigationJsonLd(),
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${lexend.variable} ${merriweather.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
        {children}
        <JsonLd data={structuredData} />
      </body>
    </html>
  )
}
