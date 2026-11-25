import { z } from "zod";

export const minPasswordLength = 15;
export const maxPasswordLength = 128;

export function normalizePassword(password: string) {
  return password.normalize("NFC");
}

const length = (password: string) =>
  Array.from(normalizePassword(password)).length;
const tooLong = `Use at most ${maxPasswordLength} characters.`;

// Existing credentials are verified according to the format of their stored hash.
export const passwordInput = z
  .string()
  .min(1, "Enter your password.")
  .refine((password) => password.isWellFormed(), "Enter a valid password.")
  .refine((password) => length(password) <= maxPasswordLength, tooLong);

export const newPasswordInput = z
  .string()
  .refine(
    (password) => password.isWellFormed() && !/[\r\n]/.test(password),
    "Use a password without line breaks or invalid characters.",
  )
  .refine(
    (password) => length(password) >= minPasswordLength,
    `Use at least ${minPasswordLength} characters.`,
  )
  .refine((password) => length(password) <= maxPasswordLength, tooLong);
