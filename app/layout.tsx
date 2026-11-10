import type { Metadata } from "next";
// Step 1: remove Geist and Geist_Mono if you don't need them anymore
import { Inter } from "next/font/google";
import "./globals.css";

// Step 2: create the font once at module level.
// `variable` generates the CSS variable --font-inter at build time.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FastMet Fleet",
  description: "FastMet fleet management system",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
