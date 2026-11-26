"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAuthAdapter } from "@/lib/auth/adapter";
import {
  AuthError,
  authRoutes,
  type AuthAdapter,
  type AuthState,
} from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { AuthAlert } from "./AuthAlert";
import { AuthFormSkeleton } from "./AuthFormSkeleton";

interface IAuthStep {
  expected: AuthState["status"];
  children: (state: AuthState, run: RunAuthAction) => ReactNode;
}

export type AuthAction = (adapter: AuthAdapter) => Promise<AuthState>;
export type RunAuthAction = (action: AuthAction) => Promise<void>;

const loadingFieldCounts = {
  SIGNED_OUT: 2,
  PASSWORD_CHANGE_REQUIRED: 2,
  TWO_FACTOR_SETUP_REQUIRED: 1,
  TWO_FACTOR_REQUIRED: 1,
  RECOVERY_CODES_REQUIRED: 0,
  AUTHENTICATED: 0,
} satisfies Record<AuthState["status"], 0 | 1 | 2>;

export function AuthStep({ expected, children }: Readonly<IAuthStep>) {
  const router = useRouter();
  const [state, setState] = useState<AuthState | null>(null);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const accept = useCallback(
    (next: AuthState) => {
      setState(next);
      if (next.status === expected) return;
      if (next.status === "AUTHENTICATED") {
        // The server chooses between the dashboard and the application review workspace.
        window.location.replace(next.destination);
      } else if (next.status === "SIGNED_OUT") {
        window.location.replace(authRoutes.SIGNED_OUT);
      } else {
        router.replace(authRoutes[next.status]);
      }
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
        <AuthAlert>{error}</AuthAlert>
        <Button onClick={() => void restore()}>Try again</Button>
      </div>
    );

  if (!state || state?.status !== expected) {
    return <AuthFormSkeleton fields={loadingFieldCounts[expected]} />;
  }

  return (
    <div className="w-full space-y-5">
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
