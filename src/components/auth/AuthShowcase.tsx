import { FleetDashboardPreview } from "@/components/FleetDashboardPreview";
import "@/app/fleet-showcase.css";

export function AuthShowcase() {
  return (
    <section
      aria-labelledby="auth-showcase-heading"
      className="fleet-showcase-surface hidden flex-col justify-center overflow-hidden border-l py-14 lg:flex"
    >
      <div className="mx-auto w-full max-w-3xl px-8 xl:px-12">
        <h2
          id="auth-showcase-heading"
          className="text-4xl leading-[1.03] font-semibold tracking-[-0.055em] xl:text-5xl"
        >
          Your fleet.
          <br />
          <span className="text-primary-foreground dark:text-primary">
            Moving together.
          </span>
        </h2>
        <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground xl:text-base xl:leading-7">
          Dispatch trips, coordinate drivers, and manage vehicles from one
          connected workspace.
        </p>
      </div>
      <div className="fleet-showcase-art relative isolate mt-8 py-6 [--fleet-showcase-accent-opacity:0.5]">
        <div className="mx-auto w-full max-w-3xl px-8 xl:px-12">
          <FleetDashboardPreview
            decorative
            sizes="(min-width: 1536px) 654px, (min-width: 1280px) calc(50vw - 114px), (min-width: 1024px) calc(50vw - 82px), 1px"
          />
        </div>
      </div>
    </section>
  );
}
