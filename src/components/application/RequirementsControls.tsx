"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/auth/Brand";
import { getAuthAdapter } from "@/lib/auth/adapter";
import { authRoutes, requirementsRoute } from "@/lib/auth/types";
import { Power } from "lucide-react";

export function RetryRequirementsButton() {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="requirements-control h-9 rounded-[8px] px-4 text-[13px] font-semibold max-[480px]:w-full"
      aria-busy={refreshing}
      disabled={refreshing}
      onClick={() => startTransition(() => router.refresh())}
    >
      {refreshing ? "Loading…" : "Try again"}
    </Button>
  );
}

export function RequirementsHeader({
  hasReplacements = false,
  submitting = false,
}: Readonly<{ hasReplacements?: boolean; submitting?: boolean }>) {
  const cancel = useRef<HTMLButtonElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (leaving) return;
    setLeaving(true);
    setError("");
    try {
      await (await getAuthAdapter()).logout();
      window.location.replace(authRoutes.SIGNED_OUT);
    } catch {
      setError("Unable to sign out. Please try again.");
      setLeaving(false);
    }
  }

  return (
    <header className="border-b dark:border-[#1f1f1f]">
      <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
        <Brand
          href={requirementsRoute}
          label="FastMet Fleet application requirements"
        />
        <AlertDialog
          onOpenChange={(open, details) => {
            if (!open && leaving) details.cancel();
            if (open) setError("");
          }}
        >
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                aria-label="Sign out"
                className="requirements-control h-9 rounded-[8px] px-3 text-sm font-medium"
              />
            }
          >
            <Power aria-hidden="true" />
          </AlertDialogTrigger>
          <AlertDialogContent
            initialFocus={cancel}
            className="requirements-dialog w-[calc(100%-2rem)]"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of Fleet?</AlertDialogTitle>
              <AlertDialogDescription>
                {hasReplacements
                  ? "You have unsubmitted replacements. Signing out will discard those files."
                  : "You’ll need to sign in again to view your application requirements."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel ref={cancel} disabled={leaving}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="button"
                variant={hasReplacements ? "destructive" : "default"}
                disabled={leaving}
                onClick={() => void signOut()}
              >
                {leaving ? "Signing out…" : "Sign out"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
