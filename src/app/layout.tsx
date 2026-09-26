import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-provider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://casamelati.my";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Casa Melati Homestay | Cameron Highlands Retreat",
    template: "%s | Casa Melati Homestay",
  },
  description:
    "A family-friendly homestay in the Cameron Highlands surrounded by tea plantations and cool mountain air. Fully furnished, halal-friendly kitchen, free parking. Book direct.",
  keywords: [
    "Cameron Highlands homestay",
    "homestay Malaysia",
    "Brinchang accommodation",
    "tea plantation stay",
    "family homestay Pahang",
  ],
  openGraph: {
    title: "Casa Melati Homestay | Cameron Highlands Retreat",
    description:
      "A cozy retreat in the Cameron Highlands. Fully furnished, halal-friendly, free parking. Book direct and save.",
    url: siteUrl,
    siteName: "Casa Melati Homestay",
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casa Melati Homestay | Cameron Highlands",
    description:
      "A cozy retreat in the Cameron Highlands. Book direct and save.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
