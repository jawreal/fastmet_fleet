"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema, type PasswordValues } from "@/lib/auth/schemas";
import { AuthStep, type RunAuthAction } from "./AuthStep";
import {
  PasswordField,
  StepHeader,
  SubmitButton,
  useFormMessage,
} from "./FormParts";

interface IChangePasswordForm {
  run: RunAuthAction;
}

function ChangePasswordForm({ run }: Readonly<IChangePasswordForm>) {
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const message = useFormMessage();
  const busy = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <StepHeader
        step="Account setup · 1 of 3"
        title="Create your new password"
        description="Replace your temporary password to secure your fleet account."
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
        <p id="password-requirements" className="text-xs text-muted-foreground">
          Use at least 8 characters. Both passwords must match.
        </p>
        <PasswordField
          id="new-password"
          label="New password"
          registration={form.register("newPassword")}
          error={form.formState.errors.newPassword?.message}
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
      {(_, run) => <ChangePasswordForm run={run} />}
    </AuthStep>
  );
}
