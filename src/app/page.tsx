import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ClipboardList,
  Truck,
  ChartColumn,
} from "lucide-react";
import { Brand } from "@/components/auth/Brand";
import { ThemeToggle } from "@/components/auth/ThemeToggle";
import { FleetFaq } from "@/components/landing/FleetFaq";
import { FleetDashboardPreview } from "@/components/FleetDashboardPreview";
import { OperationsPreview } from "@/components/landing/OperationsPreview";
import { buttonVariants } from "@/components/ui/button";
import "./fleet-showcase.css";

export const metadata: Metadata = {
  title: "FastMet Fleet | Fleet operations in one workspace",
  description:
    "Organize bookings, vehicles, drivers, and fleet costs in one workspace with FastMet Fleet.",
  openGraph: {
    title: "FastMet Fleet",
    description: "One workspace for your bookings, vehicles, and crews.",
    type: "website",
  },
};

const sectionLinks = [
  { href: "#platform", label: "Platform" },
  { href: "#operations", label: "Operations" },
  { href: "#getting-started", label: "Getting started" },
  { href: "#faq", label: "FAQ" },
];

const capabilities = [
  {
    title: "Manage trips and bookings",
    description:
      "Review booking requests, record direct bookings, and see trip details alongside vehicle and crew assignments.",
    icon: ClipboardList,
  },
  {
    title: "Organize vehicles and crews",
    description:
      "Keep vehicle records, driver and helper rosters, service history, and fuel logs together.",
    icon: Truck,
  },
  {
    title: "Review costs and subscriptions",
    description:
      "Review per-vehicle subscriptions and renewals alongside trip earnings, fuel costs, and maintenance reports.",
    icon: ChartColumn,
  },
];

const onboarding = [
  {
    title: "Get your work credentials",
    description:
      "Your company administrator provides your work email and temporary password.",
  },
  {
    title: "Secure your account",
    description:
      "On your first sign-in, set a new password, connect Google Authenticator, and save your recovery codes.",
  },
  {
    title: "Open your fleet workspace",
    description:
      "Use the workspace to review bookings, vehicles, crew records, and reports.",
  },
];

const frame = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";
const sectionHeading =
  "max-w-xl text-3xl/tight font-semibold tracking-tight text-balance sm:text-4xl/tight";
const footerPlatformLinks = sectionLinks.slice(0, 3);

const navLink =
  "inline-flex min-h-10 items-center rounded-sm text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

function SignInLink({ primary = false }: Readonly<{ primary?: boolean }>) {
  return (
    <Link
      href="/login"
      className={buttonVariants({
        variant: primary ? "default" : "outline",
        className:
          "h-11 gap-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
      })}
    >
      Sign in <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

export default function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-10 rounded-md bg-background p-3 text-sm focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to content
      </a>

      {/* ------------- NAVBAR ---------------- */}
      <header className="w-full sticky top-0 border-b bg-background z-10">
        <div className={frame}>
          <div className="grid min-h-18 grid-cols-[1fr_auto] items-center gap-x-3 py-3 md:grid-cols-[1fr_auto_1fr]">
            <Brand />
            <nav
              aria-label="Main navigation"
              className="col-span-2 row-start-2 flex flex-wrap gap-x-5 md:col-span-1 md:col-start-2 md:row-start-1 md:gap-x-7"
            >
              {sectionLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className={`${navLink} text-muted-foreground hover:text-foreground`}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="col-start-2 row-start-1 flex items-center justify-end gap-2 sm:gap-3 md:col-start-3">
              <ThemeToggle />
              <SignInLink />
            </div>
          </div>
        </div>
      </header>

      {/* ------------- HERO ---------------- */}
      <main id="main" tabIndex={-1}>
        <section
          aria-labelledby="hero-heading"
          className="fleet-showcase-surface"
        >
          <div className={frame}>
            <div className="mx-auto max-w-4xl pt-12 pb-9 text-center sm:pt-16 sm:pb-12">
              <h1
                id="hero-heading"
                className="text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.03] font-semibold tracking-[-0.055em] text-balance"
              >
                Run your fleet in{" "}
                <span className="text-primary-foreground dark:text-primary">
                  one place.
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-foreground/85 sm:text-lg sm:leading-8">
                FastMet Fleet gives dispatchers and fleet managers one place to
                organize bookings, vehicles, crews, and operating costs.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                <SignInLink primary />
                <a href="#platform" className={navLink}>
                  Explore the platform
                  <ArrowDown aria-hidden="true" className="ml-2 size-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="fleet-showcase-art relative isolate pb-8 sm:pb-12">
            <div className={frame}>
              <FleetDashboardPreview />
            </div>
          </div>
        </section>

        <section
          id="platform"
          aria-labelledby="platform-heading"
          className="fleet-showcase-surface"
        >
          <div
            className={`${frame} grid gap-y-4 py-16 sm:py-24 lg:grid-cols-12 lg:items-baseline-last`}
          >
            <h2
              id="platform-heading"
              className="text-3xl leading-[1.03] font-semibold tracking-[-0.055em] text-balance sm:text-4xl lg:col-span-7 lg:text-5xl"
            >
              From the next booking to the{" "}
              <span className="text-primary-foreground dark:text-primary">
                monthly review.
              </span>
            </h2>
            <p className="max-w-lg text-lg leading-7 text-foreground/85 lg:col-span-4 lg:col-start-9 lg:pl-6">
              Keep trip details, fleet records, and business reporting in the
              same workspace so your team can see how the pieces fit together.
            </p>
            <ul className="col-span-full mt-8 grid divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0 lg:mt-10 lg:grid-cols-subgrid">
              {capabilities.map(({ title, description, icon: Icon }) => (
                <li
                  key={title}
                  className="py-6 md:px-3 md:py-8 md:first:pl-0 md:last:pr-0 lg:col-span-4 lg:px-6"
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="mb-3 size-5 text-primary"
                  />
                  <h3 className="text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-[33ch] text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ------------- FLEET IN VIEW ---------------- */}
        <section
          id="operations"
          aria-labelledby="operations-heading"
          className="border-y bg-muted/45"
        >
          <div className={frame}>
            <div className="grid items-center gap-9 py-16 sm:py-24 lg:grid-cols-[6fr_5fr] lg:gap-16">
              <div className="lg:col-start-2">
                <h2 id="operations-heading" className={sectionHeading}>
                  Plan trips with the fleet in view.
                </h2>
                <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
                  Give dispatchers the context they need to plan each trip, from
                  booking details to the vehicle and crew assigned to it.
                </p>
                <dl className="mt-8 space-y-5 border-l-2 border-primary pl-5">
                  <div>
                    <dt className="font-semibold">Before dispatch</dt>
                    <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                      Review pickup and delivery details, crew assignments, and
                      vehicle records.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">After the trip</dt>
                    <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                      Refer to completed trips, fares, fuel logs, and service
                      history when reviewing fleet performance.
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="lg:col-start-1 lg:row-start-1">
                <OperationsPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ------------- GETTING STARTED WITH FLEET ---------------- */}
        <section
          id="getting-started"
          aria-labelledby="getting-started-heading"
          className={frame}
        >
          <div className="py-16 sm:py-24">
            <h2 id="getting-started-heading" className={sectionHeading}>
              Getting started with Fleet
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Fleet access is set up through your company administrator.
            </p>
            <ol className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-3">
              {onboarding.map(({ title, description }, index) => (
                <li key={title} className="border-t py-5">
                  <span
                    aria-hidden="true"
                    className="text-sm tabular-nums text-muted-foreground"
                  >
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------- FAQ ---------------- */}
        <FleetFaq />

        {/* -------------ALREADY HAVE AN ACCOUNT ---------------- */}
        <section aria-labelledby="access-heading" className="border-y bg-muted">
          <div className={frame}>
            <div className="grid items-center gap-7 border-l-4 border-primary py-10 pl-5 sm:grid-cols-[1fr_auto] sm:py-12 sm:pl-8">
              <div>
                <h2
                  id="access-heading"
                  className="text-2xl font-semibold tracking-tight"
                >
                  Already have a Fleet account?
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-foreground">
                  Sign in with your company-issued credentials. This preview
                  uses sample data and requires a connected deployment for live
                  account access.
                </p>
              </div>
              <div className="justify-self-end">
                <SignInLink primary />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ------------- FOOTER ---------------- */}
      <footer className="dark bg-stone-950 text-foreground">
        <div className={frame}>
          <div className="grid gap-9 py-12 sm:grid-cols-[1fr_auto] sm:gap-12 md:py-16">
            <div className="space-y-3">
              <Brand />
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Manage fleet operations, vehicles, and deliveries in one place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 sm:gap-x-10 lg:gap-x-16">
              <nav aria-labelledby="footer-platform">
                <h2 id="footer-platform" className="mb-2 text-sm font-semibold">
                  Platform
                </h2>
                <ul>
                  {footerPlatformLinks.map(({ href, label }) => (
                    <li key={href}>
                      <a
                        href={href}
                        className={`${navLink} text-muted-foreground hover:text-foreground`}
                      >
                        {href === "#platform" ? "Overview" : label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-labelledby="footer-resources">
                <h2
                  id="footer-resources"
                  className="mb-2 text-sm font-semibold"
                >
                  Resources
                </h2>
                <ul>
                  <li>
                    <a
                      href="#faq"
                      className={`${navLink} text-muted-foreground hover:text-foreground`}
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className={`${navLink} text-muted-foreground hover:text-foreground`}
                    >
                      Sign in
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t py-5 text-xs text-muted-foreground">
            <small className="text-xs">
              © 2026 FastMet, Inc. All rights reserved.
            </small>
            <ul
              aria-label="Policies"
              className="flex flex-wrap gap-x-5 gap-y-2"
            >
              <li>Privacy</li>
              <li>Terms of Use</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
