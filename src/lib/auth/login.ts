import { z } from "zod";
import { passwordInput } from "./password-input";

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

// Retained entry point for callers of the original login adapter.
export async function submitLogin(values: LoginValues) {
  loginSchema.parse(values);
  const { getAuthAdapter } = await import("./adapter");
  return (await getAuthAdapter()).login(values);
}
