"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { minPasswordLength } from "@/lib/auth/password-input";
import { assessPassword } from "@/lib/auth/password-policy";

interface StrengthInput {
  value: string;
  passwordTerms: readonly string[];
}

interface PasswordFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  busy: boolean;
  autoComplete?: "current-password" | "new-password";
  strength?: StrengthInput;
}

const levels = [
  { label: "Weak", color: "bg-destructive", bars: 1 },
  { label: "Weak", color: "bg-destructive", bars: 1 },
  { label: "Weak", color: "bg-destructive", bars: 2 },
  { label: "Good", color: "bg-emerald-600 dark:bg-emerald-400", bars: 3 },
  { label: "Strong", color: "bg-emerald-600 dark:bg-emerald-400", bars: 4 },
];

function PasswordStrength({
  id,
  value,
  passwordTerms,
  showAdvice,
}: Readonly<StrengthInput & { id: string; showAdvice: boolean }>) {
  const deferredValue = useDeferredValue(value);
  const result = useMemo(
    () => deferredValue && assessPassword(deferredValue, passwordTerms),
    [deferredValue, passwordTerms],
  );
  const level = result ? levels[result.score] : null;
  return (
    <output id={id} className="block space-y-1.5">
      {value && level && (
        <>
          <span aria-hidden="true" className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={`h-1 rounded-full ${bar <= level.bars ? level.color : "bg-border"}`}
              />
            ))}
          </span>
          <span className="block text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{level.label}</span>
            {showAdvice && result && result.issue && " — " + result.issue}
          </span>
        </>
      )}
    </output>
  );
}

export function PasswordField({
  id,
  label,
  registration,
  error,
  busy,
  autoComplete = "new-password",
  strength,
}: Readonly<PasswordFieldProps>) {
  const [visible, setVisible] = useState(false);
  const hintId = strength && id + "-hint";
  const strengthId = id + "-strength";
  const errorId = id + "-error";
  const describedBy = [hintId, strength?.value && strengthId, error && errorId]
    .filter(Boolean)
    .join(" ");
  return (
    <Field className="gap-2" data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {strength && (
        <p id={hintId} className="text-xs text-muted-foreground">
          Use at least {minPasswordLength} characters. Try several unrelated
          words.
        </p>
      )}
      <div className="relative">
        <Input
          {...registration}
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          disabled={busy}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
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
      {strength && (
        <PasswordStrength id={strengthId} {...strength} showAdvice={!error} />
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
}
