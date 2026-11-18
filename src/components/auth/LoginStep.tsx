"use client";
import { AuthStep } from "./AuthStep";
import { LoginForm } from "./LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockAuthEnabled } from "@/lib/auth/adapter";
export function LoginStep() {
  return (
    <AuthStep expected="SIGNED_OUT">
      {(state, run) => (
        <>
          {state.status === "SIGNED_OUT" &&
            state.reason === "CHALLENGE_EXPIRED" && (
              <Alert role="alert">
                <AlertDescription>
                  Your sign-in attempt expired. Sign in again to continue.
                </AlertDescription>
              </Alert>
            )}
          {mockAuthEnabled && (
            <p className="text-xs leading-5 text-muted-foreground">
              Demo: first@demo.example or returning@demo.example. Use any
              synthetic password with at least 8 characters. Verification code:
              012345.
            </p>
          )}
          <LoginForm
            onSubmit={(values) => run((adapter) => adapter.login(values))}
          />
        </>
      )}
    </AuthStep>
  );
}
