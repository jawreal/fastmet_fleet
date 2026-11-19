import { z } from "zod";

export const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const codeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "Enter the six-digit code from Google Authenticator."),
});

export const recoverySchema = z.object({
  code: z.string().trim().min(1, "Enter a recovery code."),
});

export type PasswordValues = z.infer<typeof passwordSchema>;
export type CodeValues = z.infer<typeof codeSchema>;
