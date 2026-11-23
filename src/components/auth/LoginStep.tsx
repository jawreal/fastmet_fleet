"use client";
import { AuthStep, demoNotice } from "./AuthStep";
import { LoginForm } from "./LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockAuthEnabled } from "@/lib/auth/adapter";
export function LoginStep() {
  return (
    <AuthStep expected="SIGNED_OUT">
      {(state, run) => (
        <>
          {state.status === "SIGNED_OUT" &&
            (state.reason === "CHALLENGE_EXPIRED" ||
              state.reason === "SESSION_EXPIRED") && (
              <Alert role="alert">
                <AlertDescription>
                  {state.reason === "SESSION_EXPIRED"
                    ? "Your session expired. Sign in again with your password and authenticator code."
                    : "Your sign-in attempt expired. Sign in again to continue."}
                </AlertDescription>
              </Alert>
            )}
          <LoginForm
            demoAccess={
              mockAuthEnabled ? (
                <aside
                  aria-label="Demo access"
                  className="space-y-1 rounded-md border border-dashed border-input px-3 py-2.5 text-xs leading-5 text-muted-foreground"
                >
                  <p className="font-medium text-foreground">Demo access</p>
                  <p>{demoNotice}</p>
                  <p>
                    Use first@demo.example or returning@demo.example and any
                    synthetic password with at least 8 characters. Verification
                    code: <span className="font-mono">012345</span>.
                  </p>
                </aside>
              ) : undefined
            }
            onSubmit={(values) => run((adapter) => adapter.login(values))}
          />
        </>
      )}
    </AuthStep>
  );
}
