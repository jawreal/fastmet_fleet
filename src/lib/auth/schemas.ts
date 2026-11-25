import { z } from "zod";
import {
  newPasswordInput,
  normalizePassword,
  passwordInput,
} from "./password-input";

export const passwordSchema = z
  .strictObject({
    newPassword: newPasswordInput,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine(
    (values) =>
      normalizePassword(values.newPassword) ===
      normalizePassword(values.confirmPassword),
    { message: "Passwords do not match.", path: ["confirmPassword"] },
  );

export const settingsPasswordSchema = passwordSchema.safeExtend({
  currentPassword: passwordInput,
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
export type SettingsPasswordValues = z.infer<typeof settingsPasswordSchema>;
export type CodeValues = z.infer<typeof codeSchema>;
