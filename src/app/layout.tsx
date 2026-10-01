import type { Metadata, Viewport } from "next";
import { Comfortaa, DM_Sans } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({ subsets: ["latin"], variable: "--font-comfortaa", weight: ["400", "500", "600", "700"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Socio Top Paper — UPSC Sociology topper answer copies",
  description:
    "Search thousands of UPSC Sociology Optional topper answers by question, thinker, syllabus topic or topper — and open the exact page of the original answer copy.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${comfortaa.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
