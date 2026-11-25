"use client";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormMessage } from "@/components/auth/FormParts";
import { PasswordField } from "@/components/auth/PasswordField";
import { getAuthAdapter } from "@/lib/auth/adapter";
import { checkPasswordStrength } from "@/lib/auth/password-policy";
import {
  settingsPasswordSchema,
  type SettingsPasswordValues,
} from "@/lib/auth/schemas";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PasswordSettings({
  passwordTerms,
}: Readonly<{ passwordTerms: readonly string[] }>) {
  const form = useForm<SettingsPasswordValues>({
    resolver: zodResolver(
      settingsPasswordSchema.superRefine(checkPasswordStrength(passwordTerms)),
    ),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const newPassword = useWatch({ control: form.control, name: "newPassword" });
  const { errors, isSubmitting: busy } = form.formState;
  const message = useFormMessage();

  const changePassword: SubmitHandler<SettingsPasswordValues> = async (
    values,
  ) => {
    message.clear();
    try {
      await (await getAuthAdapter()).changeAccountPassword(values);
      window.location.replace("/login");
    } catch (error) {
      message.report(error);
    }
  };
  return (
    <Card className="@container min-w-0" aria-labelledby="password-heading">
      <CardHeader>
        <CardTitle id="password-heading">Password</CardTitle>
        <CardDescription>
          Change the password used to sign in to your company account.
        </CardDescription>
      </CardHeader>
      <form
        noValidate
        aria-busy={busy}
        onSubmit={form.handleSubmit(changePassword)}
        className="flex flex-1 flex-col gap-4"
      >
        <CardContent className="grid w-full max-w-md gap-4">
          {message.alert}
          <PasswordField
            id="current-password"
            label="Current password"
            autoComplete="current-password"
            registration={form.register("currentPassword")}
            error={errors.currentPassword?.message}
            busy={busy}
          />
          <PasswordField
            id="new-password"
            label="New password"
            registration={form.register("newPassword")}
            error={errors.newPassword?.message}
            strength={{ value: newPassword, passwordTerms }}
            busy={busy}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            registration={form.register("confirmPassword")}
            error={errors.confirmPassword?.message}
            busy={busy}
          />
        </CardContent>
        <CardFooter className="mt-auto justify-end border-t">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
