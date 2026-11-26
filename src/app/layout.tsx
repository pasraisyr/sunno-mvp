import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MORRA.ASIA — Ekosistem Digital Perniagaan & Ganjaran Token Tempatan",
  description:
    "Platform e-dagang dan ekosistem perniagaan tempatan terintegrasi dengan Pakej Pioneer Merchant RM512, Ganjaran Token Belanja, dan Sistem Komisen 2-Level berasaskan Fi Platform 5%.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ms"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
