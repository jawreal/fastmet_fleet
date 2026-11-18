import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/auth/Brand";
import { ThemeToggle } from "@/components/auth/ThemeToggle";
import "@/app/login/login.css";

const legalLink =
  "rounded-md underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[45%_55%]">
      <aside
        className="fleet-login-brand-panel relative isolate hidden flex-col overflow-hidden border-r bg-muted lg:flex"
        aria-label="FastMet Fleet"
      >
        <div className="relative z-20 flex min-h-svh flex-1 flex-col justify-between gap-16 p-12 xl:p-16 dark:bg-neutral-900/40">
          <Brand />
          <div className="max-w-sm py-16">
            <p className="mb-4 text-xs font-medium tracking-widest text-foreground">
              FASTMET FLEET MANAGEMENT
            </p>
            <h2 className="text-4xl leading-tight font-medium tracking-tight xl:text-5xl">
              Your fleet.
              <br />
              One clear view.
            </h2>
            <p className="mt-6 max-w-xs text-sm leading-6 text-foreground">
              Dispatch, track, and manage drivers from one workspace.
            </p>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-4 text-xs text-foreground">
            <span>© 2026 FastMet, Inc.</span>
            <nav aria-label="Legal" className="flex gap-4">
              <Link className={legalLink} href="/privacy">
                Privacy
              </Link>
              <Link className={legalLink} href="/terms">
                Terms
              </Link>
            </nav>
          </footer>
        </div>
      </aside>
      <section
        aria-labelledby="auth-heading"
        className="flex min-w-0 flex-col px-6 py-8 sm:px-12"
      >
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="lg:hidden">
            <Brand />
          </div>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-90 flex-1 items-center py-12 lg:py-16">
          {children}
        </div>
        <nav
          aria-label="Legal"
          className="flex justify-center gap-4 text-xs text-muted-foreground lg:hidden"
        >
          <Link className={legalLink} href="/privacy">
            Privacy
          </Link>
          <Link className={legalLink} href="/terms">
            Terms
          </Link>
        </nav>
      </section>
    </main>
  );
}
