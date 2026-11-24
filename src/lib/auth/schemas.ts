import { z } from "zod";

export const passwordInput = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72)
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Use at most 72 UTF-8 bytes.",
  );

export const passwordSchema = z
  .strictObject({
    newPassword: passwordInput,
    confirmPassword: z.string().min(1, "Confirm your new password.").max(72),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const settingsPasswordSchema = passwordSchema.safeExtend({
  currentPassword: passwordInput,
  newPassword: passwordInput.refine(
    (value) =>
      value.length >= 12 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value),
    "Use at least 12 characters with uppercase and lowercase letters and a number.",
  ),
});

export const codeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "Enter the six-digit code from Google Authenticator."),
});

export const recoverySchema = z.strictObject({
  code: z
    .string()
    .trim()
    .regex(
      /^(?:[a-f0-9]{16}|[a-f0-9]{4}(?:-[a-f0-9]{4}){3})$/i,
      "Enter a valid recovery code.",
    ),
});

export type PasswordValues = z.infer<typeof passwordSchema>;
export type CodeValues = z.infer<typeof codeSchema>;
