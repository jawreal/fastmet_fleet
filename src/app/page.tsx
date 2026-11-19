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
import { FleetStripes } from "@/components/landing/FleetStripes";
import { FleetFaq } from "@/components/landing/FleetFaq";
import { FleetMobileNav } from "@/components/landing/FleetMobileNav";
import { FleetReveal } from "@/components/landing/FleetReveal";
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

const frame = "fleet-container";
const sectionHeading = "fleet-heading";
const primaryButton =
  "fleet-button fleet-button-primary focus-visible:ring-foreground/40";
const secondaryButton =
  "fleet-button fleet-button-secondary inline-flex items-center justify-center hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";
const footerPlatformLinks = sectionLinks.slice(0, 3);

const navLink =
  "inline-flex min-h-10 items-center rounded-sm text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

function SignInLink({ primary = false }: Readonly<{ primary?: boolean }>) {
  return (
    <Link
      href="/login"
      className={buttonVariants({
        variant: primary ? "default" : "link",
        className: primary
          ? primaryButton
          : `${secondaryButton} text-foreground`,
      })}
    >
      Sign in
      {!primary && <ArrowRight aria-hidden="true" className="size-4" />}
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="fleet-landing">
      <a
        href="#main"
        className="sr-only z-10 rounded-md bg-background p-3 text-sm focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to content
      </a>

      {/* ------------- NAVBAR ---------------- */}
      <header className="sticky top-0 z-10 w-full border-b bg-background">
        <div className={frame}>
          <div className="grid min-h-18 grid-cols-[1fr_auto] items-center gap-x-3 py-3 md:grid-cols-[1fr_auto_1fr]">
            <Brand />
            <nav
              aria-label="Main navigation"
              className="hidden gap-x-7 md:flex"
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
            <div className="flex items-center justify-end gap-2 sm:gap-3 max-md:[&>button]:size-11">
              <ThemeToggle />
              <div className="hidden md:block">
                <SignInLink />
              </div>
              <FleetMobileNav
                links={sectionLinks}
                signIn={<SignInLink primary />}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ------------- HERO ---------------- */}
      <main id="main" tabIndex={-1}>
        <FleetReveal rootId="main" />
        <section aria-labelledby="hero-heading" className="fleet-section">
          <div className={frame}>
            <div className="mx-auto max-w-4xl pb-12 text-center">
              <h1
                id="hero-heading"
                className="fleet-hero-fade text-4xl/tight font-semibold tracking-tight text-balance sm:text-5xl/tight lg:text-6xl/tight"
              >
                Run your fleet in{" "}
                <span className="text-primary-foreground">one place.</span>
              </h1>
              <p className="fleet-hero-fade fleet-copy fleet-muted mx-auto mt-5 max-w-xl">
                FastMet Fleet gives dispatchers and fleet managers one place to
                organize bookings, vehicles, crews, and operating costs.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                <SignInLink primary />
                <a href="#platform" className={secondaryButton}>
                  Explore the platform
                  <ArrowDown aria-hidden="true" className="ml-2 size-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="relative isolate pb-8 sm:pb-12">
            <FleetStripes className="top-0" />
            <div className={frame}>
              <FleetDashboardPreview sizes="(min-width: 1280px) 1166px, (min-width: 1024px) calc(100vw - 114px), (min-width: 640px) calc(100vw - 82px), calc(100vw - 54px)" />
            </div>
          </div>
        </section>

        <section
          id="platform"
          tabIndex={-1}
          aria-labelledby="platform-heading"
          data-fleet-section=""
          className="fleet-tint-surface fleet-night-surface fleet-section"
        >
          <div className={`${frame} fleet-split`}>
            <h2
              id="platform-heading"
              data-fleet-motion="up"
              className={sectionHeading}
            >
              From the next booking to the{" "}
              <span className="text-primary-foreground">monthly review.</span>
            </h2>
            <p
              data-fleet-motion="up"
              className="fleet-copy fleet-muted max-w-xl"
            >
              Keep trip details, fleet records, and business reporting in the
              same workspace so your team can see how the pieces fit together.
            </p>
            <ul className="col-span-full grid divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0">
              {capabilities.map(({ title, description, icon: Icon }) => (
                <li
                  key={title}
                  data-fleet-motion="item"
                  className="py-6 md:px-6 md:py-8 md:first:pl-0 md:last:pr-0"
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="mb-4 size-5 text-primary-foreground"
                  />
                  <h3 className="text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="fleet-copy fleet-muted mt-2">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ------------- FLEET IN VIEW ---------------- */}
        <section
          id="operations"
          tabIndex={-1}
          aria-labelledby="operations-heading"
          data-fleet-section=""
          className="dark fleet-dark-surface fleet-section"
        >
          <div className={frame}>
            <div className="fleet-split items-center">
              <div className="min-w-0">
                <h2
                  id="operations-heading"
                  data-fleet-motion="up"
                  className={sectionHeading}
                >
                  Plan trips with the fleet in view.
                </h2>
                <p
                  data-fleet-motion="left"
                  className="fleet-copy fleet-muted mt-4"
                >
                  Give dispatchers the context they need to plan each trip, from
                  booking details to the vehicle and crew assigned to it.
                </p>
                <dl data-fleet-motion="left" className="mt-8 divide-y">
                  <div className="pb-5">
                    <dt className="text-base font-medium">Before dispatch</dt>
                    <dd className="fleet-copy fleet-muted mt-2">
                      Review pickup and delivery details, crew assignments, and
                      vehicle records.
                    </dd>
                  </div>
                  <div className="pt-5">
                    <dt className="text-base font-medium">After the trip</dt>
                    <dd className="fleet-copy fleet-muted mt-2">
                      Refer to completed trips, fares, fuel logs, and service
                      history when reviewing fleet performance.
                    </dd>
                  </div>
                </dl>
              </div>
              <div data-fleet-motion="image-right" className="min-w-0">
                <OperationsPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ------------- GETTING STARTED + FAQ ---------------- */}
        <div className="fleet-night-surface fleet-section">
          <div className={`${frame} space-y-24 pb-5`}>
            <section
              id="getting-started"
              tabIndex={-1}
              aria-labelledby="getting-started-heading"
              data-fleet-section=""
              className="space-y-10 mb-42 py-10"
            >
              <div data-fleet-motion="up">
                <h2 id="getting-started-heading" className={sectionHeading}>
                  Getting started with Fleet
                </h2>
                <p className="fleet-copy fleet-muted mt-4">
                  Fleet access is set up through your company administrator.
                </p>
              </div>
              <ol className="grid gap-8 md:grid-cols-3">
                {onboarding.map(({ title, description }, index) => (
                  <li
                    key={title}
                    data-fleet-motion="item"
                    className="relative grid grid-cols-[auto_minmax(0,1fr)] content-start items-start gap-4 md:grid-cols-1"
                  >
                    <span className="grid size-8 place-items-center rounded-full border text-sm font-medium tabular-nums">
                      {index + 1}
                    </span>
                    {index < onboarding.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute top-10 -bottom-6 left-4 flex -translate-x-1/2 flex-col items-center text-primary md:top-4 md:-right-6 md:bottom-auto md:left-10 md:translate-x-0 md:-translate-y-1/2 md:flex-row"
                      >
                        <span className="w-0 flex-1 border-l-2 border-dashed border-current md:h-0 md:border-t-2 md:border-l-0" />
                        <span className="size-0 border-x-4 border-t-6 border-x-transparent border-t-current md:border-y-4 md:border-r-0 md:border-l-6 md:border-y-transparent md:border-l-current" />
                      </span>
                    )}
                    <div className="max-w-xl pt-0.5">
                      <h3 className="text-lg font-semibold tracking-tight">
                        {title}
                      </h3>
                      <p className="fleet-copy fleet-muted mt-2">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <FleetFaq />
          </div>
        </div>

        {/* ------------- FINAL CTA ---------------- */}
        <section
          aria-labelledby="access-heading"
          data-fleet-section=""
          className="dark fleet-dark-surface fleet-access-panel relative isolate overflow-hidden border-y"
        >
          <div>
            <div
              className={`${frame} grid items-center gap-8 pt-7 pb-16 sm:pt-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12`}
            >
              <div data-fleet-motion="up">
                <h2
                  id="access-heading"
                  className="text-3xl/tight font-semibold tracking-tight text-balance"
                >
                  Already have a Fleet account?
                </h2>
                <p className="fleet-copy fleet-muted mt-4 max-w-xl">
                  Sign in with your company-issued credentials to access
                  bookings, vehicles, drivers, crews, and subscriptions.
                </p>
              </div>
              <div
                data-fleet-motion="up"
                className="flex flex-col items-start gap-3 border-t pt-7 lg:border-t-0 lg:border-l lg:py-5 lg:pl-12"
              >
                <Link
                  href="/login"
                  className={buttonVariants({
                    className: primaryButton,
                  })}
                >
                  Sign in
                </Link>
                <p className="text-sm leading-6 text-muted-foreground">
                  Need access? Contact your administrator.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ------------- FOOTER ---------------- */}
      <footer className="dark fleet-footer-surface">
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
                <h3 id="footer-platform" className="mb-2 text-sm font-semibold">
                  Platform
                </h3>
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
                <h3
                  id="footer-resources"
                  className="mb-2 text-sm font-semibold"
                >
                  Resources
                </h3>
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
    </div>
  );
}
