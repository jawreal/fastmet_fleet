"use client";

import { useCallback, useRef, useState, type SubmitEvent } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthError } from "@/lib/auth/types";
import {
  loginSchema,
  submitLogin,
  type LoginRequest,
  type LoginValues,
} from "@/lib/auth/login";
import { AuthAlert } from "./AuthAlert";
import { ApplicationRejection } from "./ApplicationRejection";
import { TurnstileWidget, type TurnstileWidgetHandle } from "./TurnstileWidget";

interface LoginFormProps {
  onSubmit?: (values: LoginRequest) => Promise<unknown>;
}

const textLink =
  "inline-flex min-h-8 items-center rounded-sm text-xs font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export function LoginForm({
  onSubmit = submitLogin,
}: Readonly<LoginFormProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const requestPending = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const turnstileWidget = useRef<TurnstileWidgetHandle>(null);
  const token = useRef<string | null>(null);
  const [verified, setVerified] = useState(false);
  const setToken = useCallback((value: string | null) => {
    token.current = value;
    setVerified(value !== null);
  }, []);
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
    const turnstileToken = token.current;
    if (!turnstileToken) {
      report("Complete the security verification to sign in.");
      return;
    }
    setMessage(null);
    try {
      await onSubmit({ ...values, turnstileToken });
    } catch (error) {
      if (error instanceof AuthError && error.code === "APPLICATION_REJECTED") {
        form.resetField("password");
        setShowPassword(false);
        setToken(null);
        setRejectionReason(error.rejectionReason ?? "");
      } else {
        report(
          error instanceof Error
            ? error.message
            : "Unable to sign in. Please try again.",
        );
      }
    } finally {
      turnstileWidget.current?.reset();
    }
  };

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestPending.current) return;
    requestPending.current = true;
    try {
      await form.handleSubmit(handleSubmit)(event);
    } finally {
      requestPending.current = false;
    }
  }

  if (rejectionReason !== null) {
    return (
      <ApplicationRejection
        reason={rejectionReason}
        onBack={() => {
          setRejectionReason(null);
          requestAnimationFrame(() => form.setFocus("email"));
        }}
      />
    );
  }

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
      <form method="post" noValidate onSubmit={submit} aria-busy={busy}>
        <FieldGroup className="gap-5">
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
                  autoComplete="username"
                  required
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
                    required
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
                  Keep me signed in for 7 days
                </FieldLabel>
              </Field>
            )}
          />
          <div>
            <TurnstileWidget ref={turnstileWidget} onTokenChange={setToken} />
            <span className="sr-only" aria-live="polite">
              {verified || busy
                ? ""
                : "Sign-in is waiting for security verification."}
            </span>
            <Button
              type="submit"
              disabled={busy || !verified}
              className="h-11 w-full gap-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
            >
              {busy && (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              )}
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <ArrowRight aria-hidden="true" className="size-4" />}
            </Button>
          </div>
          {message && <AuthAlert ref={alertRef}>{message}</AuthAlert>}
        </FieldGroup>
      </form>
      <footer className="mt-7 border-t pt-4">
        <p className="text-xs leading-5 text-muted-foreground">
          Your account is managed by your fleet administrator.
        </p>
        <Popover>
          <PopoverTrigger
            className={`${textLink} max-w-full text-left font-bold text-foreground`}
          >
            Learn how to access your account.
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="top"
            sideOffset={8}
            className="w-72 max-w-[calc(100vw-2rem)] gap-3 p-3 motion-reduce:animate-none motion-reduce:duration-0"
          >
            <PopoverTitle className="text-xs font-semibold">
              How sign-in works
            </PopoverTitle>
            <PopoverDescription className="text-xs leading-5">
              Use your registered work email and password, then verify with
              Google Authenticator.
            </PopoverDescription>
            <ol className="list-decimal space-y-2 pl-4 text-xs leading-5 text-muted-foreground">
              <li>Sign in with the credentials provided to your company.</li>
              <li>
                On your first sign-in, follow the steps to set up your
                authenticator and save your recovery codes.
              </li>
              <li>
                For future sign-ins, enter a fresh authenticator code or an
                unused recovery code.
              </li>
            </ol>
            <p className="border-t pt-2 text-xs leading-5 text-muted-foreground">
              Need credentials or a password reset?{" "}
              <strong className="font-semibold text-foreground">
                Contact your administrator.
              </strong>
            </p>
          </PopoverContent>
        </Popover>
      </footer>
    </div>
  );
}
