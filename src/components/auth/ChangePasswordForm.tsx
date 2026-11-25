"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkPasswordStrength } from "@/lib/auth/password-policy";
import { passwordSchema, type PasswordValues } from "@/lib/auth/schemas";
import { AuthStep, type RunAuthAction } from "./AuthStep";
import { PasswordField } from "./PasswordField";
import { StepHeader, SubmitButton, useFormMessage } from "./FormParts";

interface IChangePasswordForm {
  run: RunAuthAction;
  passwordTerms: readonly string[];
}

function ChangePasswordForm({
  run,
  passwordTerms,
}: Readonly<IChangePasswordForm>) {
  const form = useForm<PasswordValues>({
    resolver: zodResolver(
      passwordSchema.superRefine(checkPasswordStrength(passwordTerms)),
    ),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control: form.control, name: "newPassword" });
  const message = useFormMessage();
  const busy = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <StepHeader
        step="Account setup · 1 of 3"
        title="Create your new password"
        description="Replace your initial password to secure your fleet account."
      />
      <form
        noValidate
        aria-busy={busy}
        className="space-y-5"
        onSubmit={form.handleSubmit(async (values) => {
          message.clear();
          try {
            await run((adapter) => adapter.changePassword(values));
            form.reset();
          } catch (error) {
            message.report(error);
          }
        })}
      >
        {message.alert}
        <PasswordField
          id="new-password"
          label="New password"
          registration={form.register("newPassword")}
          error={form.formState.errors.newPassword?.message}
          strength={{ value: newPassword, passwordTerms }}
          busy={busy}
        />
        <PasswordField
          id="confirm-password"
          label="Confirm password"
          registration={form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
          busy={busy}
        />
        <SubmitButton busy={busy}>Save password and continue</SubmitButton>
      </form>
    </div>
  );
}
export function ChangePasswordStep() {
  return (
    <AuthStep expected="PASSWORD_CHANGE_REQUIRED">
      {(state, run) =>
        state.status === "PASSWORD_CHANGE_REQUIRED" && (
          <ChangePasswordForm run={run} passwordTerms={state.passwordTerms} />
        )
      }
    </AuthStep>
  );
}
