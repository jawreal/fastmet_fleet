import type { Metadata } from "next";
import { CircleAlert, FileWarning } from "lucide-react";
import { Suspense } from "react";
import { RequirementsForm } from "@/components/application/RequirementsForm";
import {
  RetryRequirementsButton,
  RequirementsHeader,
} from "@/components/application/RequirementsControls";
import { loadFleetRequirements } from "@/lib/application/backend";
import { fleetSupportEmail } from "@/lib/application/requirements";
import { requireOnboardingAccess } from "@/lib/auth/server/dal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import "@/components/application/requirements-workspace.css";
import DataLoader from "@/components/Loader";

export const metadata: Metadata = {
  title: "Application requirements | FastMet Fleet",
};

async function Workspace() {
  const { account } = await requireOnboardingAccess();
  if (account.status === "rejected") {
    const reason = account.rejectionReason?.trim();
    return (
      <div className="requirements-workspace flex flex-col">
        <RequirementsHeader />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-10">
          <Alert className="items-start rounded-2xl p-5 sm:p-6">
            <CircleAlert
              aria-hidden="true"
              className="size-5 text-destructive"
            />
            <AlertTitle>
              <h1 className="text-sm font-semibold">Application rejected</h1>
            </AlertTitle>
            <AlertDescription className="space-y-3 text-[13px]">
              <p className="whitespace-pre-wrap wrap-anywhere">
                {reason || "A reason was not provided."}
              </p>
              <p>
                If you have questions about this decision, email{" "}
                <a href={`mailto:${fleetSupportEmail}`}>{fleetSupportEmail}</a>.
              </p>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

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
    <div className="requirements-workspace flex flex-col">
      <RequirementsHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-10 text-center">
        <section
          aria-labelledby="requirements-load-error"
          className="mt-6 flex flex-col items-center gap-4 rounded-[16px] border bg-card p-5 text-card-foreground sm:p-6"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-destructive/10 text-destructive">
            <FileWarning aria-hidden="true" className="size-5" />
          </span>
          <div role="alert" className="space-y-1">
            <h2 id="requirements-load-error" className="text-sm font-semibold">
              We couldn’t load your requirements
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Try again to reload your application documents.
            </p>
          </div>
          <RetryRequirementsButton />
        </section>
      </main>
    </div>
  );
}

export default function RequirementsPage() {
  return (
    <Suspense
      fallback={
        <output className="flex justify-center items-center min-h-screen">
          <DataLoader />
        </output>
      }
    >
      <Workspace />
    </Suspense>
  );
}
