import { AppShell } from "@/components/AppShell";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { FleetDataSettings } from "@/components/settings/FleetDataSettings";
import { VehicleRatesSettings } from "@/components/settings/VehicleRatesSettings";

export default function Page() {
  return (
    <AppShell title="Settings">
      <div className="@container mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="space-y-1 border-b pb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Company profile, account security and fleet data
          </p>
        </div>
        <div className="grid items-start gap-6 md:grid-cols-[11rem_minmax(0,1fr)]">
          <nav
            aria-label="Settings sections"
            className="flex gap-1 overflow-x-auto md:sticky md:top-4 md:flex-col"
          >
            {[
              ["company", "Company"],
              ["password", "Password"],
              ["vehicle-rates", "Vehicle rates"],
              ["fleet-data", "Fleet data"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={"#" + id}
                className="shrink-0 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="min-w-0 space-y-5">
            <section id="company" className="scroll-mt-5">
              <CompanySettings />
            </section>
            <section id="password" className="scroll-mt-5">
              <PasswordSettings />
            </section>
            <section id="vehicle-rates" className="scroll-mt-5">
              <VehicleRatesSettings />
            </section>
            <section id="fleet-data" className="scroll-mt-5">
              <FleetDataSettings />
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
