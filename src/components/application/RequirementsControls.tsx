"use client";

import Image from "next/image";
import Link from "next/link";
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
import { getAuthAdapter } from "@/lib/auth/adapter";
import { authRoutes } from "@/lib/auth/types";

export function RetryRequirementsButton() {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
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
    <header className="h-12 border-b dark:border-[#1f1f1f]">
      <div className="mx-auto flex h-full max-w-[1040px] items-center justify-between gap-3 px-4">
        <Link
          href="/"
          aria-label="FastMet Fleet home"
          className="flex items-center gap-2 rounded-sm"
        >
          <Image src="/icon.png" alt="" width={24} height={24} />
          <span className="text-[13px] font-semibold">
            FastMet{" "}
            <span className="font-normal text-muted-foreground">/ Fleet</span>
          </span>
        </Link>
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
                size="lg"
                disabled={submitting}
                className="requirements-control h-8 rounded-[8px] px-3 text-xs font-medium"
              />
            }
          >
            Sign out
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
