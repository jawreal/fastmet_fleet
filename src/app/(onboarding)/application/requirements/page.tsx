import type { Metadata } from "next";
import { Suspense } from "react";
import { RequirementsForm } from "@/components/application/RequirementsForm";
import {
  RefreshRequirementsButton,
  RequirementsSignOutButton,
} from "@/components/application/RequirementsControls";
import { Brand } from "@/components/auth/Brand";
import { FleetThemeMenu } from "@/components/FleetThemeMenu";
import { loadFleetRequirements } from "@/lib/application/backend";
import { requireOnboardingAccess } from "@/lib/auth/server/dal";

export const metadata: Metadata = {
  title: "Application requirements | FastMet Fleet",
};

async function Workspace() {
  const { account } = await requireOnboardingAccess();
  const application = await loadFleetRequirements();
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <FleetThemeMenu />
            <RequirementsSignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{account.companyName}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Application requirements
          </h1>
        </div>
        {/* A new review round or status starts a fresh replacement form. */}
        {application ? (
          <RequirementsForm
            key={`${application.round}-${application.status}`}
            application={application}
          />
        ) : (
          <div className="space-y-3">
            <p role="alert" className="text-sm">
              We couldn’t load your requirements. Refresh to check the current
              status.
            </p>
            <RefreshRequirementsButton />
          </div>
        )}
      </main>
    </>
  );
}

export default function RequirementsPage() {
  return (
    <Suspense
      fallback={
        <output className="block p-6 text-sm text-muted-foreground">
          Loading application…
        </output>
      }
    >
      <Workspace />
    </Suspense>
  );
}
