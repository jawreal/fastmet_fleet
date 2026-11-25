import { z } from "zod";
import { passwordInput } from "./password-input";

export const turnstileLoginAction = "fleet_login";

export const loginSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid work email address.").max(254)),
  password: passwordInput,
  keepSignedIn: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

const verificationRequired = "Complete the security verification to sign in.";
export const loginRequestSchema = loginSchema.extend({
  turnstileToken: z
    .string(verificationRequired)
    .trim()
    .min(1, verificationRequired)
    .max(2048, "The security verification is invalid. Please try again."),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

// Retained entry point for callers of the original login adapter.
export async function submitLogin(values: LoginRequest) {
  const { getAuthAdapter } = await import("./adapter");
  return (await getAuthAdapter()).login(loginRequestSchema.parse(values));
}
