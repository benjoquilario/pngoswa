import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PNGOSWA | Philippine NGO Social Workers Association",
    short_name: "PNGOSWA",
    description:
      "The official website of the Philippine NGO Social Workers Association.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fb",
    theme_color: "#0e2d5e",
    icons: [
      {
        src: "/favicon_ico/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon_ico/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon_ico/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon_ico/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon_ico/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
  }
}
