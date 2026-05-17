const PRODUCTION_SITE_URL = "https://www.pngoswa.org"
const LOCAL_SITE_URL = "http://localhost:3000"
const PRODUCTION_SITE_HOSTNAMES = ["pngoswa.org", "www.pngoswa.org"] as const

type HeaderSource = Pick<Headers, "get">

let hasWarnedAboutProductionSiteUrl = false

function normalizeSiteUrl(value: string) {
  return value.replace(/\/$/, "")
}

function warnAboutProductionSiteUrl(message: string) {
  if (
    process.env.NODE_ENV !== "production" ||
    hasWarnedAboutProductionSiteUrl
  ) {
    return
  }

  hasWarnedAboutProductionSiteUrl = true

  console.warn(`Invalid production NEXT_PUBLIC_SITE_URL ignored: ${message}`)
}

function isInternalHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase()

  if (
    normalized === "localhost" ||
    normalized === "0.0.0.0" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  ) {
    return true
  }

  return (
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  )
}

function isProductionSiteHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase()

  return PRODUCTION_SITE_HOSTNAMES.some(
    (productionHostname) =>
      normalized === productionHostname ||
      normalized.endsWith(`.${productionHostname}`)
  )
}

function getHeaderValue(
  headerSource: HeaderSource,
  headerNames: readonly string[]
) {
  for (const headerName of headerNames) {
    const rawValue = headerSource.get(headerName)

    if (!rawValue) {
      continue
    }

    const value = rawValue.split(",")[0]?.trim()

    if (value) {
      return value
    }
  }

  return null
}

function resolveConfiguredSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL

  if (process.env.NODE_ENV === "production") {
    if (configured) {
      try {
        const normalized = normalizeSiteUrl(configured)
        const url = new URL(normalized)

        if (isInternalHostname(url.hostname)) {
          warnAboutProductionSiteUrl(
            `${configured} points to an internal host. Using ${PRODUCTION_SITE_URL} instead.`
          )
        } else if (!isProductionSiteHostname(url.hostname)) {
          warnAboutProductionSiteUrl(
            `${configured} is not on the canonical pngoswa.org host. Using ${PRODUCTION_SITE_URL} instead.`
          )
        }
      } catch {
        warnAboutProductionSiteUrl(
          `${configured} is not a valid URL. Using ${PRODUCTION_SITE_URL} instead.`
        )
      }
    }

    return PRODUCTION_SITE_URL
  }

  if (!configured) {
    return LOCAL_SITE_URL
  }

  try {
    const normalized = normalizeSiteUrl(configured)
    const url = new URL(normalized)

    if (isInternalHostname(url.hostname)) {
      return LOCAL_SITE_URL
    }

    return normalized
  } catch {
    return LOCAL_SITE_URL
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(resolveConfiguredSiteUrl())
}

export function getRequestOrigin(headerSource: HeaderSource) {
  const configuredOrigin = new URL(getSiteUrl()).origin
  const host = getHeaderValue(headerSource, ["x-forwarded-host", "host"])

  if (!host) {
    return configuredOrigin
  }

  const protocol =
    getHeaderValue(headerSource, ["x-forwarded-proto"]) ??
    new URL(configuredOrigin).protocol.replace(":", "")

  try {
    const url = new URL(`${protocol}://${host}`)

    if (isInternalHostname(url.hostname)) {
      return configuredOrigin
    }

    if (
      process.env.NODE_ENV === "production" &&
      !isProductionSiteHostname(url.hostname)
    ) {
      return configuredOrigin
    }

    return url.origin
  } catch {
    return configuredOrigin
  }
}

export function buildAbsoluteSiteUrl(
  path: string,
  headerSource?: HeaderSource
) {
  const origin = headerSource ? getRequestOrigin(headerSource) : getSiteUrl()
  return new URL(path, `${origin}/`).toString()
}

export { PRODUCTION_SITE_URL }
