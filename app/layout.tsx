import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Emily & Joe · 08.27.27",
  description: "Together with their families, Emily Peter & Joe Perticone request the pleasure of your company. Friday, August 27, 2027.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Emily & Joe are getting married",
    description: "Friday, August 27, 2027 — kindly open your invitation.",
    images: [{ url: "/photos/amalfi-beach-engagement.webp" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#343a1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bodoni.variable} ${cormorant.variable} ${pinyon.variable}`}>
      <body>{children}</body>
    </html>
  );
}
