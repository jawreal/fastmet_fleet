"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAuthAdapter, mockAuthEnabled } from "@/lib/auth/adapter";
import {
  AuthError,
  authRoutes,
  type AuthAdapter,
  type AuthState,
} from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type AuthAction = (adapter: AuthAdapter) => Promise<AuthState>;
export type RunAuthAction = (action: AuthAction) => Promise<void>;

export function AuthStep({
  expected,
  children,
}: {
  expected: AuthState["status"];
  children: (state: AuthState, run: RunAuthAction) => ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<AuthState | null>(null);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const accept = useCallback(
    (next: AuthState) => {
      setState(next);
      if (next.status !== expected) router.replace(authRoutes[next.status]);
    },
    [expected, router],
  );

  const restore = useCallback(async () => {
    try {
      const next = await (await getAuthAdapter()).getAuthState();
      setError("");
      accept(next);
    } catch {
      setError("Unable to restore your sign-in step. Please try again.");
    }
  }, [accept]);

  useEffect(() => {
    let active = true;
    getAuthAdapter()
      .then((adapter) => adapter.getAuthState())
      .then((next) => {
        if (active) accept(next);
      })
      .catch(() => {
        if (active)
          setError("Unable to restore your sign-in step. Please try again.");
      });
    return () => {
      active = false;
    };
  }, [accept]);

  useEffect(() => {
    if (!state || !("expiresAt" in state)) return;
    const timer = window.setTimeout(
      () => {
        void restore();
      },
      Math.max(0, state.expiresAt - Date.now()) + 25,
    );
    const onFocus = () => {
      void restore();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [state, restore]);

  const run: RunAuthAction = useCallback(
    async (action) => {
      try {
        accept(await action(await getAuthAdapter()));
      } catch (error) {
        if (
          error instanceof AuthError &&
          (error.code === "CHALLENGE_EXPIRED" ||
            error.code === "STEP_UNAVAILABLE")
        ) {
          await restore();
        }
        throw error;
      }
    },
    [accept, restore],
  );

  if (error)
    return (
      <div className="space-y-4">
        <Alert role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => void restore()}>Try again</Button>
      </div>
    );

  if (!state || state.status !== expected)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Restoring your sign-in step…
      </p>
    );

  return (
    <div className="w-full space-y-5">
      {mockAuthEnabled && (
        <p className="rounded-md border border-dashed p-3 text-xs leading-5 text-muted-foreground">
          Development demo · synthetic data only. No real session is created.
        </p>
      )}
      {children(state, run)}
      {expected !== "SIGNED_OUT" && (
        <Button
          variant="ghost"
          className="w-full"
          disabled={leaving}
          onClick={async () => {
            setLeaving(true);
            try {
              await run((adapter) => adapter.logout());
            } catch {
              setError("Unable to end this sign-in attempt. Please try again.");
            } finally {
              setLeaving(false);
            }
          }}
        >
          Sign in with another account
        </Button>
      )}
    </div>
  );
}
