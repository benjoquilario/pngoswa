import { ImageResponse } from "next/og"

export const runtime = "edge"

const DEFAULT_TITLE = "PNGOSWA"
const DEFAULT_DESCRIPTION = "Philippine NGO Social Workers Association"

function sanitizeText(
  input: string | null,
  fallback: string,
  maxLength: number
) {
  if (!input) return fallback

  const normalized = input.replace(/\s+/g, " ").trim()
  if (!normalized) return fallback

  return normalized.slice(0, maxLength)
}

function getTitleSize(title: string) {
  if (title.length <= 22) return 104
  if (title.length <= 34) return 90
  if (title.length <= 50) return 76
  return 64
}

function getDescriptionSize(description: string) {
  if (description.length <= 70) return 40
  if (description.length <= 120) return 34
  return 30
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const title = sanitizeText(searchParams.get("title"), DEFAULT_TITLE, 70)
  const description = sanitizeText(
    searchParams.get("description"),
    DEFAULT_DESCRIPTION,
    160
  )

  const titleSize = getTitleSize(title)
  const descriptionSize = getDescriptionSize(description)

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "54px 62px",
        color: "#f8fafc",
        background:
          "linear-gradient(136deg, #0e2d5e 0%, #1b4f8a 56%, #2a6cb8 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-120px",
          left: "-85px",
          width: "440px",
          height: "440px",
          borderRadius: "9999px",
          background:
            "radial-gradient(circle, rgba(0,163,215,0.5) 0%, rgba(0,163,215,0.16) 45%, rgba(0,163,215,0) 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "-110px",
          right: "-130px",
          width: "400px",
          height: "400px",
          borderRadius: "9999px",
          background:
            "radial-gradient(circle, rgba(196,30,58,0.44) 0%, rgba(196,30,58,0.18) 40%, rgba(196,30,58,0) 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "11px",
          background:
            "linear-gradient(90deg, #e87b1a 0%, #c41e3a 36%, #7b2d8e 70%, #00a3d7 100%)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            border: "1px solid rgba(255,255,255,0.45)",
            background: "rgba(255,255,255,0.16)",
            padding: "10px 20px",
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}
        >
          PH NGO
        </div>
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            opacity: 0.96,
            letterSpacing: "0.01em",
          }}
        >
          PNGOSWA
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "1020px",
          gap: "16px",
          marginTop: "22px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "138px",
            height: "6px",
            borderRadius: "9999px",
            background: "linear-gradient(90deg, #00a3d7, #e87b1a)",
          }}
        />

        <div
          style={{
            fontSize: `${titleSize}px`,
            lineHeight: 1.03,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textWrap: "balance",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: `${descriptionSize}px`,
            lineHeight: 1.25,
            color: "#e6f0ff",
            opacity: 0.98,
            maxWidth: "980px",
            textWrap: "pretty",
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.3)",
          paddingTop: "18px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: "27px",
            color: "#f1f5f9",
            opacity: 0.94,
          }}
        >
          Philippine NGO Social Workers Association
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#ffd166",
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}
        >
          pngoswa.org
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
