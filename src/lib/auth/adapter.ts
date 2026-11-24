import { z } from "zod";
import {
  AuthError,
  type AuthAdapter,
  type AuthState,
  type TwoFactorSetup,
} from "./types";

const errorSchema = z.object({
  error: z.object({
    code: z.enum([
      "INVALID_CODE",
      "CODE_EXPIRED",
      "CHALLENGE_EXPIRED",
      "STEP_UNAVAILABLE",
      "INVALID_CREDENTIALS",
      "INVALID_INPUT",
      "RATE_LIMITED",
      "UNAVAILABLE",
    ]),
    message: z.string(),
  }),
});
const expiresAt = z.number();
const setupState = z.object({
  status: z.literal("TWO_FACTOR_SETUP_REQUIRED"),
  nextAction: z.enum(["getTwoFactorSetup", "confirmTwoFactorSetup"]),
  expiresAt,
});
const authStateSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("SIGNED_OUT"),
    nextAction: z.literal("login"),
    reason: z.enum(["CHALLENGE_EXPIRED", "SESSION_EXPIRED"]).optional(),
  }),
  z.object({
    status: z.literal("PASSWORD_CHANGE_REQUIRED"),
    nextAction: z.literal("changePassword"),
    expiresAt,
  }),
  setupState,
  z.object({
    status: z.literal("TWO_FACTOR_REQUIRED"),
    nextAction: z.enum(["verifyTwoFactor", "verifyRecoveryCode"]),
    expiresAt,
  }),
  z.object({
    status: z.literal("RECOVERY_CODES_REQUIRED"),
    nextAction: z.literal("acknowledgeRecoveryCodes"),
    expiresAt,
    recoveryCodes: z.array(z.string()),
  }),
  z.object({
    status: z.literal("AUTHENTICATED"),
    nextAction: z.literal("continue"),
    expiresAt,
    sessionMode: z.enum(["browser", "seven_days"]),
  }),
]) satisfies z.ZodType<AuthState>;
const setupSchema = z.object({
  state: setupState,
  manualKey: z.string(),
  provisioningUri: z.string().startsWith("otpauth://totp/"),
}) satisfies z.ZodType<TwoFactorSetup>;

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  body?: object,
): Promise<T> {
  const options: RequestInit = {
    cache: "no-store",
    credentials: "same-origin",
  };
  if (body) {
    options.method = "POST";
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  const response = await fetch("/api/fleet/auth/" + path, options);
  const data: unknown = await response.json().catch(() => null);
  if (response.ok) {
    const parsed = schema.safeParse(data);
    if (parsed.success) return parsed.data;
  } else {
    const parsed = errorSchema.safeParse(data);
    if (parsed.success)
      throw new AuthError(parsed.data.error.code, parsed.data.error.message);
  }
  throw new AuthError(
    "UNAVAILABLE",
    "Unable to complete sign-in. Please try again.",
  );
}

function state(path: string, body?: object) {
  return request(path, authStateSchema, body);
}

const adapter: AuthAdapter = {
  login: (values) => state("login", values),
  changePassword: (values) => state("change-password", values),
  changeAccountPassword: (values) => state("account-password", values),
  getTwoFactorSetup: () => request("two-factor/setup", setupSchema, {}),
  confirmTwoFactorSetup: (code) => state("two-factor/confirm", { code }),
  verifyTwoFactor: (code) => state("two-factor/verify", { code }),
  verifyRecoveryCode: (code) => state("two-factor/recovery", { code }),
  acknowledgeRecoveryCodes: () => state("recovery-codes/acknowledge", {}),
  getAuthState: () => state("state"),
  logout: () => state("logout", {}),
};

export function getAuthAdapter(): Promise<AuthAdapter> {
  return Promise.resolve(adapter);
}
