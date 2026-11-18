import type { ReactNode } from "react";
import Link from "next/link";
import { DriverProductImage } from "@/components/auth/DriverProductImage";
import { FleetProductImage } from "@/components/auth/FleetProductImage";
import { Brand } from "@/components/auth/Brand";
import { ThemeToggle } from "@/components/auth/ThemeToggle";
import "@/app/login/login.css";

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
      <main className="grid flex-1 lg:grid-cols-[46%_54%]">
        <section
          id="auth-content"
          tabIndex={-1}
          aria-labelledby="auth-heading"
          className="flex min-w-0 items-center justify-center px-6 py-12 outline-none sm:px-12 lg:py-16"
        >
          <div className="w-full max-w-96">{children}</div>
        </section>
        <section
          aria-labelledby="fleet-introduction"
          className="fleet-auth-showcase hidden overflow-hidden lg:flex"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col justify-center py-12 pr-8 pl-20 xl:pr-12 xl:pl-24">
            <h2
              id="fleet-introduction"
              className="max-w-lg text-4xl leading-[1.1] font-semibold tracking-tight xl:text-5xl"
            >
              Your fleet.
              <br />
              Moving together.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 xl:text-base xl:leading-7">
              Dispatch trips, coordinate drivers, and manage vehicles from one
              connected workspace.
            </p>
            <figure className="mt-10">
              <div className="fleet-auth-devices relative pb-[14%]">
                <div className="w-full">
                  <FleetProductImage />
                </div>
                <div className="absolute -right-6 bottom-0 w-[42%]">
                  <DriverProductImage />
                </div>
              </div>
            </figure>
          </div>
        </section>
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
