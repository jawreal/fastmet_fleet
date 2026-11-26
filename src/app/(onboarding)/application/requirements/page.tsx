import type { Metadata } from "next";
import { Suspense } from "react";
import { RequirementsForm } from "@/components/application/RequirementsForm";
import {
  RetryRequirementsButton,
  RequirementsHeader,
} from "@/components/application/RequirementsControls";
import { loadFleetRequirements } from "@/lib/application/backend";
import { requireOnboardingAccess } from "@/lib/auth/server/dal";
import "@/components/application/requirements-workspace.css";

export const metadata: Metadata = {
  title: "Application requirements | FastMet Fleet",
};

async function Workspace() {
  const { account } = await requireOnboardingAccess();
  const application = await loadFleetRequirements();
  if (application) {
    // A new review round or status starts a fresh replacement form.
    return (
      <RequirementsForm
        key={`${application.round}-${application.status}`}
        application={application}
        companyName={account.companyName}
      />
    );
  }

  return (
    <div className="requirements-workspace">
      <RequirementsHeader />
      <main className="mx-auto max-w-[1040px] space-y-3 px-4 pt-10 pb-16">
        <p className="text-sm text-muted-foreground">{account.companyName}</p>
        <h1 className="text-xl font-semibold tracking-tight">
          Application requirements
        </h1>
        <p role="alert" className="text-sm">
          We couldn’t load your requirements.
        </p>
        <RetryRequirementsButton />
      </main>
    </div>
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
