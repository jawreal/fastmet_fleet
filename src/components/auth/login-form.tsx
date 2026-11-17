"use client";

import { useRef, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
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
  onSubmit?: (values: LoginValues) => Promise<void>;
}

const textLink =
  "rounded-md text-xs font-medium text-foreground underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export function LoginForm({
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
      <header className="mb-8 space-y-2">
        <h1 id="login-heading" className="text-2xl font-medium tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Enter your work credentials.
        </p>
      </header>
      <form
        noValidate
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        aria-busy={busy}
      >
        <FieldGroup>
          {message && (
            <Alert
              ref={alertRef}
              tabIndex={-1}
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
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
                  className="h-8 text-base md:text-xs"
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
                    className="h-8 pr-10 text-base md:text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 size-8 rounded-md transition-colors duration-150"
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
              <Field orientation="horizontal" className="gap-2">
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
            className="h-8 w-full rounded-md transition-colors duration-150"
          >
            {form.formState.isSubmitting && (
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
            )}
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
      <footer className="mt-8 space-y-6 text-center">
        <p className="text-xs leading-5 text-muted-foreground">
          Don&apos;t have an account?
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
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole aria-hidden="true" className="size-3" />
          Protected by enterprise-grade security
        </p>
      </footer>
    </div>
  );
}
