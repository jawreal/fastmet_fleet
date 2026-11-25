"use client";
import { AuthAlert } from "./AuthAlert";
import { AuthStep } from "./AuthStep";
import { LoginForm } from "./LoginForm";
export function LoginStep() {
  return (
    <AuthStep expected="SIGNED_OUT">
      {(state, run) => (
        <>
          {state.status === "SIGNED_OUT" &&
            (state.reason === "CHALLENGE_EXPIRED" ||
              state.reason === "SESSION_EXPIRED") && (
              <AuthAlert>
                {state.reason === "SESSION_EXPIRED"
                  ? "Your session expired. Sign in again with your password and authenticator code."
                  : "Your sign-in attempt expired. Sign in again to continue."}
              </AuthAlert>
            )}
          <LoginForm
            onSubmit={(values) => run((adapter) => adapter.login(values))}
          />
        </>
      )}
    </AuthStep>
  );
}
