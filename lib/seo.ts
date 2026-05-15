import { getSiteUrl } from "@/lib/site-url"

export const ORGANIZATION_NAME = "Philippine NGO Social Workers Association"
export const ORGANIZATION_SHORT_NAME = "PNGOSWA"
export const ORGANIZATION_DESCRIPTION =
  "PNGOSWA stands for the Philippine NGO Social Workers Association. It is a professional organization dedicated to representing, connecting, and empowering social workers operating within the non-governmental organization (NGO) and private sectors in the Philippines."

export const ORGANIZATION_KEYWORDS = [
  "PNGOSWA",
  "Philippine NGO Social Workers Association",
  "NGO social workers Philippines",
  "social workers in NGOs",
  "professional organization for social workers",
  "Philippines NGO association",
  "social work advocacy Philippines",
  "NGO and private sector social workers",
]

export const PUBLIC_SITE_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Membership", path: "/membership" },
  { name: "Ethics", path: "/ethics" },
] as const

export function absoluteUrl(path = "/") {
  const siteUrl = getSiteUrl()

  if (path === "/") {
    return siteUrl
  }

  return `${siteUrl}${path}`
}

export function createBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function createSiteNavigationJsonLd() {
  return PUBLIC_SITE_LINKS.map((item) => ({
    "@type": "SiteNavigationElement",
    name: item.name,
    url: absoluteUrl(item.path),
  }))
}
