import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Media Harvest — Free YouTube Downloader",
  description:
    "A free, open source, cross-platform desktop app to download YouTube videos at any quality. No account. No limits. No cost.",
  openGraph: {
    title: "Media Harvest — Free YouTube Downloader",
    description:
      "A free, open source, cross-platform desktop app to download YouTube videos at any quality. No account. No limits. No cost.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="mh-site-shell min-h-screen font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
