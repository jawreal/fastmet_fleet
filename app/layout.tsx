import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

