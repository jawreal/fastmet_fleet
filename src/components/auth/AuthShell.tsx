import type { ReactNode } from "react";
import Link from "next/link";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Brand } from "@/components/auth/Brand";
import { ThemeToggle } from "@/components/auth/ThemeToggle";

const legalLink =
  "inline-flex min-h-10 items-center rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export function AuthShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <a
        href="#auth-content"
        className="sr-only z-50 rounded-md bg-background p-3 text-sm focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to form
      </a>
      <header className="flex items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
        <Brand />
        <ThemeToggle />
      </header>
      <main className="grid flex-1 lg:grid-cols-2">
        <section
          id="auth-content"
          tabIndex={-1}
          aria-labelledby="auth-heading"
          className="flex min-w-0 items-center justify-center px-6 py-12 outline-none sm:px-12 lg:py-16"
        >
          <div className="w-full max-w-96">{children}</div>
        </section>
        <AuthShowcase />
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t px-6 py-3 text-xs text-muted-foreground sm:px-10 lg:px-12">
        <span>© 2026 FastMet, Inc.</span>
        <nav aria-label="Legal" className="flex gap-5">
          <Link className={legalLink} href="/privacy">
            Privacy
          </Link>
          <Link className={legalLink} href="/terms">
            Terms
          </Link>
        </nav>
      </footer>
    </div>
  );
}
