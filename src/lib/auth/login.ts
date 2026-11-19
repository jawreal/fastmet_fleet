import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid work email address.").trim(),
  password: z.string().min(8, "Password must contain at least 8 characters."),
  keepSignedIn: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

// Retained entry point for callers of the original login adapter.
export async function submitLogin(values: LoginValues) {
  loginSchema.parse(values);
  const { getAuthAdapter } = await import("./adapter");
  return (await getAuthAdapter()).login(values);
}
