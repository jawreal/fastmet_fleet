"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  codeSchema,
  recoverySchema,
  type CodeValues,
} from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { AuthStep, type RunAuthAction } from "./AuthStep";
import {
  CodeField,
  StepHeader,
  SubmitButton,
  useFormMessage,
} from "./FormParts";

interface IVerifyForm {
  run: RunAuthAction;
}

function VerifyForm({ run }: Readonly<IVerifyForm>) {
  const [recovery, setRecovery] = useState(false);
  const form = useForm<CodeValues>({
    resolver: zodResolver(recovery ? recoverySchema : codeSchema),
    defaultValues: { code: "" },
  });
  const message = useFormMessage();
  const busy = form.formState.isSubmitting;
  return (
    <div className="space-y-6">
      <StepHeader
        title={recovery ? "Use a recovery code" : "Verify your sign-in"}
        description={
          recovery
            ? "Enter one of the recovery codes you saved when setting up your account."
            : "Open Google Authenticator and enter the current six-digit code for your FLEET account. No QR scan is needed."
        }
      />
      <form
        noValidate
        aria-busy={busy}
        className="space-y-5"
        onSubmit={form.handleSubmit(async ({ code }) => {
          message.clear();
          try {
            await run((adapter) =>
              recovery
                ? adapter.verifyRecoveryCode(code)
                : adapter.verifyTwoFactor(code),
            );
            form.reset();
          } catch (error) {
            form.reset();
            message.report(error);
          }
        })}
      >
        {message.alert}
        <CodeField
          key={String(recovery)}
          registration={form.register("code")}
          error={form.formState.errors.code?.message}
          busy={busy}
          recovery={recovery}
        />
        <SubmitButton busy={busy}>Verify and continue</SubmitButton>
        <Button
          type="button"
          variant="link"
          className="w-full text-foreground"
          disabled={busy}
          onClick={() => {
            setRecovery(!recovery);
            form.reset();
            message.clear();
            requestAnimationFrame(() => form.setFocus("code"));
          }}
        >
          {recovery ? "Use Google Authenticator" : "Use a recovery code"}
        </Button>
      </form>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Lost access to both? Contact your company administrator.
      </p>
    </div>
  );
}
export function TwoFactorVerifyStep() {
  return (
    <AuthStep expected="TWO_FACTOR_REQUIRED">
      {(_, run) => <VerifyForm run={run} />}
    </AuthStep>
  );
}
