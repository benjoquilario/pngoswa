import type { Metadata } from "next";
import { Lexend, Merriweather } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PNGOSWA — Philippine NGO Social Workers Association",
  description:
    "Empowering NGO social workers across the Philippines through professional development, advocacy, and solidarity. Join the movement for impactful social change.",
  keywords: [
    "PNGOSWA",
    "Philippine NGO",
    "Social Workers",
    "Association",
    "NGO Philippines",
    "Social Work",
    "Professional Development",
  ],
  icons: { icon: "/logo.jpg" },
  openGraph: {
    title: "PNGOSWA — Philippine NGO Social Workers Association",
    description:
      "Empowering NGO social workers across the Philippines through professional development, advocacy, and solidarity.",
    type: "website",
    locale: "en_PH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${lexend.variable} ${merriweather.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
