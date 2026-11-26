"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAuthAdapter } from "@/lib/auth/adapter";
import { authRoutes } from "@/lib/auth/types";

export function RefreshRequirementsButton() {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      disabled={refreshing}
      onClick={() => startTransition(() => router.refresh())}
    >
      {refreshing ? "Checking status…" : "Refresh status"}
    </Button>
  );
}

export function RequirementsSignOutButton() {
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        disabled={leaving}
        onClick={async () => {
          setLeaving(true);
          setError("");
          try {
            await (await getAuthAdapter()).logout();
            window.location.replace(authRoutes.SIGNED_OUT);
          } catch {
            setError("Unable to sign out. Try again.");
            setLeaving(false);
          }
        }}
      >
        {leaving ? "Signing out…" : "Sign out"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
