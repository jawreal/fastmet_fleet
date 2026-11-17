import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid work email address.").trim(),
  password: z.string().min(8, "Password must contain at least 8 characters."),
  keepSignedIn: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

// Replace this adapter with API calls. Never grant access from this UI stub.
export async function submitLogin(values: LoginValues): Promise<void> {
  loginSchema.parse(values);
  throw new Error(
    "Sign-in is not connected yet. Contact your administrator for access.",
  );
}
