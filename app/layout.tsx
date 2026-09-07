import type { Metadata } from "next";
import { Anton, DM_Sans, Space_Grotesk } from "next/font/google";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-family-sans",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-family-hero",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-family-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alpha Clasher — Support the Stream",
    template: "%s | Alpha Clasher",
  },
  description: "Send a tip and a message to Alpha Clasher on stream.",
  openGraph: {
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  );
}
