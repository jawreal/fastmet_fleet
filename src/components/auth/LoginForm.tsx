"use client";

import { useRef, useState, type ReactNode } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, submitLogin, type LoginValues } from "@/lib/auth/login";

interface LoginFormProps {
  demoAccess?: ReactNode;
  onSubmit?: (values: LoginValues) => Promise<unknown>;
}

const textLink =
  "inline-flex min-h-8 items-center rounded-sm text-xs font-normal text-muted-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export function LoginForm({
  demoAccess,
  onSubmit = submitLogin,
}: Readonly<LoginFormProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const requestPending = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", keepSignedIn: false },
  });
  const busy = form.formState.isSubmitting;

  function report(message: string) {
    setMessage(message);
    requestAnimationFrame(() => alertRef.current?.focus());
  }

  const handleSubmit: SubmitHandler<LoginValues> = async (values) => {
    if (requestPending.current) return;
    requestPending.current = true;
    setMessage(null);
    try {
      await onSubmit(values);
    } catch (error) {
      report(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      requestPending.current = false;
    }
  };

  return (
    <div className="w-full">
      <header className="mb-8 space-y-3">
        <h1 id="auth-heading" className="text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Sign in with your work email to manage your fleet.
        </p>
      </header>
      <form
        noValidate
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        aria-busy={busy}
      >
        <FieldGroup className="gap-5">
          {message && (
            <Alert
              ref={alertRef}
              tabIndex={-1}
              role="alert"
              className="rounded-md focus-visible:outline-2 focus-visible:outline-ring"
            >
              <AlertCircle aria-hidden="true" />
              <AlertDescription className="text-foreground">
                {message}
              </AlertDescription>
            </Alert>
          )}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor="email">Work email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="name@company.com"
                  disabled={busy}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? "email-error" : undefined
                  }
                  className="h-11 text-base sm:text-sm"
                />
                {fieldState.invalid && (
                  <FieldError id="email-error" errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <div className="flex items-center justify-between gap-4">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    className={textLink}
                    disabled={busy}
                    onClick={() =>
                      report(
                        "Contact your company administrator to request a password reset.",
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={busy}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? "password-error" : undefined
                    }
                    className="h-11 pr-12 text-base sm:text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 size-11 rounded-md transition-colors duration-150"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    aria-controls="password"
                    disabled={busy}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {fieldState.invalid && (
                  <FieldError id="password-error" errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="keepSignedIn"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal" className="min-h-8 gap-2">
                <Checkbox
                  id="keep-signed-in"
                  name={field.name}
                  ref={field.ref}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={busy}
                />
                <FieldLabel htmlFor="keep-signed-in" className="font-normal">
                  Keep me signed in
                </FieldLabel>
              </Field>
            )}
          />
          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full gap-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            {form.formState.isSubmitting && (
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
            )}
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            {!busy && <ArrowRight aria-hidden="true" className="size-4" />}
          </Button>
          {demoAccess}
        </FieldGroup>
      </form>
      <footer className="mt-7 space-y-6">
        <p className="text-xs leading-5 text-muted-foreground">
          Need access to FastMet Fleet?
          <br />
          <button
            type="button"
            className={textLink}
            onClick={() =>
              report(
                "Account access is managed by your company administrator. Contact them for your credentials.",
              )
            }
          >
            Contact your administrator
          </button>
        </p>
        <p className="flex items-center gap-2 border-t pt-5 text-xs leading-5 text-foreground/85">
          <LockKeyhole aria-hidden="true" className="size-3" />
          Email and authenticator verification
        </p>
      </footer>
    </div>
  );
}
