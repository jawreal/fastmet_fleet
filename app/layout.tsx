import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

interface IRoot {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "FastMet Fleet",
  description: "FastMet fleet management system",
  icons: {
    icon: "/icon.png",
  },
};

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<IRoot>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
