"use client";
import { useCallback, useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthAlert } from "./AuthAlert";

interface IPasswordField {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  busy: boolean;
}

interface ICodeField {
  registration: UseFormRegisterReturn;
  error?: string;
  busy: boolean;
  recovery?: boolean;
}

interface IStepHeader {
  title: string;
  description: string;
  step?: string;
}

interface ISubmitButton {
  busy: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function StepHeader({
  title,
  description,
  step,
}: Readonly<IStepHeader>) {
  return (
    <header className="space-y-2">
      {step && (
        <p className="text-xs font-medium text-muted-foreground">{step}</p>
      )}
      <h1 id="auth-heading" className="text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </header>
  );
}

export function useFormMessage() {
  const [message, setMessage] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const report = useCallback((error: unknown) => {
    setMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
    );
    requestAnimationFrame(() => ref.current?.focus());
  }, []);

  const alert = message ? <AuthAlert ref={ref}>{message}</AuthAlert> : null;
  return { report, clear: () => setMessage(""), alert };
}

export function PasswordField({
  id,
  label,
  registration,
  error,
  busy,
}: Readonly<IPasswordField>) {
  const [visible, setVisible] = useState(false);
  return (
    <Field className="gap-2" data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          {...registration}
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          disabled={busy}
          aria-invalid={!!error}
          aria-describedby={["password-requirements", error && `${id}-error`]
            .filter(Boolean)
            .join(" ")}
          className="h-11 pr-12 text-base sm:text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="absolute top-0 right-0 size-11"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          disabled={busy}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}
export function SubmitButton({
  busy,
  children,
  disabled,
}: Readonly<ISubmitButton>) {
  return (
    <Button
      type="submit"
      className="h-11 w-full text-sm transition-colors duration-150"
      disabled={busy || disabled}
    >
      {busy && (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      )}
      {busy ? "Please wait…" : children}
    </Button>
  );
}
export function CodeField({
  registration,
  error,
  busy,
  recovery,
}: Readonly<ICodeField>) {
  return (
    <Field className="gap-2" data-invalid={!!error}>
      <FieldLabel htmlFor="code">
        {recovery ? "Recovery code" : "Authenticator code"}
      </FieldLabel>
      <Input
        {...registration}
        id="code"
        type="text"
        inputMode={recovery ? "text" : "numeric"}
        autoComplete="one-time-code"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={recovery ? 64 : 6}
        placeholder={recovery ? "Enter a saved recovery code" : "000000"}
        disabled={busy}
        aria-invalid={!!error}
        aria-describedby={`code-help${error ? " code-error" : ""}`}
        className={`h-11 text-base ${recovery ? "font-mono" : "text-center font-mono tracking-[0.5em]"}`}
      />
      <p id="code-help" className="text-xs leading-5 text-muted-foreground">
        {recovery
          ? "Each recovery code can be used once."
          : "Enter or paste the six-digit code shown in Google Authenticator."}
      </p>
      {error && <FieldError id="code-error">{error}</FieldError>}
    </Field>
  );
}
export function useCopy() {
  const [feedback, setFeedback] = useState("");
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback("Copied to clipboard.");
    } catch {
      setFeedback("Unable to copy. Select and copy the text manually.");
    }
  }
  return { copy, feedback, setFeedback };
}
