import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { relationship } from "@/data/relationship";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://artoym-sofa-love.vercel.app"),
  title: `${relationship.partnerA} × ${relationship.partnerB} — ${relationship.tagline}`,
  description: "История любви Артема и Софы. Наша хронология, любимые места, воспоминания и база знаний.",
  applicationName: "Артем × Софа",
  authors: [{ name: "Артем" }],
  keywords: ["Артем и Софа", "История любви", "Артем", "Софа", "Любовь", "22.03.2026"],
  openGraph: {
    title: `${relationship.partnerA} × ${relationship.partnerB} — ${relationship.tagline}`,
    description: "История любви Артема и Софы. Наша хронология, любимые места, воспоминания и база знаний.",
    url: "https://artoym-sofa-love.vercel.app",
    siteName: `${relationship.partnerA} × ${relationship.partnerB}`,
    images: [
      {
        url: "https://artoym-sofa-love.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: `${relationship.partnerA} × ${relationship.partnerB} — ${relationship.tagline}`,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${relationship.partnerA} × ${relationship.partnerB} — ${relationship.tagline}`,
    description: "История любви Артема и Софы. Наша хронология, любимые места, воспоминания и база знаний.",
    images: ["https://artoym-sofa-love.vercel.app/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0e0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`}>
      <head>
        <meta property="og:image" content="https://artoym-sofa-love.vercel.app/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://artoym-sofa-love.vercel.app/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://artoym-sofa-love.vercel.app/og-image.jpg" />
        <link rel="image_src" href="https://artoym-sofa-love.vercel.app/og-image.jpg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
