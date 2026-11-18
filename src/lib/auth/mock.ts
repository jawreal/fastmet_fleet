import { loginSchema } from "./login";
import { passwordSchema, codeSchema, recoverySchema } from "./schemas";
import { AuthError, type AuthAdapter, type AuthState } from "./types";

// Synthetic public fixtures only. Never use these values for real enrollment.
const DEMO_KEY = "JBSWY3DPEHPK3PXP";
const DEMO_CODES = [
  "DEMO-4821-7306",
  "DEMO-9517-2048",
  "DEMO-3602-8914",
  "DEMO-7149-5260",
  "DEMO-2086-4731",
  "DEMO-6390-1852",
  "DEMO-8453-0679",
  "DEMO-1724-9503",
];

const STORAGE_KEY = "fleet-auth-demo-v1";
type Step = AuthState["status"];
type Snapshot = {
  status: Step;
  expiresAt: number;
  used: number[];
  reason?: "CHALLENGE_EXPIRED";
};

const statuses: Step[] = [
  "SIGNED_OUT",
  "PASSWORD_CHANGE_REQUIRED",
  "TWO_FACTOR_SETUP_REQUIRED",
  "TWO_FACTOR_REQUIRED",
  "RECOVERY_CODES_REQUIRED",
  "AUTHENTICATED",
];
let queue = Promise.resolve();

function fresh(): Snapshot {
  return { status: "SIGNED_OUT", expiresAt: 0, used: [] };
}

function read(): Snapshot {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? "null",
    ) as Snapshot | null;
    if (
      value &&
      statuses.includes(value.status) &&
      Number.isFinite(value.expiresAt) &&
      Array.isArray(value.used) &&
      value.used.every(
        (i) => Number.isInteger(i) && i >= 0 && i < DEMO_CODES.length,
      )
    )
      return value;
  } catch {
    /* Missing or malformed demo state starts signed out. */
  }
  return fresh();
}

function save(value: Snapshot): void {
  // Only nonsecret demo navigation metadata and consumed fixture indices are saved.
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function current(): Snapshot {
  const value = read();
  if (
    value.status !== "SIGNED_OUT" &&
    value.status !== "AUTHENTICATED" &&
    value.expiresAt <= Date.now()
  ) {
    const expired = {
      ...fresh(),
      used: value.used,
      reason: "CHALLENGE_EXPIRED" as const,
    };
    save(expired);
    return expired;
  }
  return value;
}
function state(value: Snapshot): AuthState {
  switch (value.status) {
    case "SIGNED_OUT":
      return {
        status: value.status,
        nextAction: "login",
        reason: value.reason,
      };
    case "AUTHENTICATED":
      return { status: value.status, nextAction: "continue" };
    case "PASSWORD_CHANGE_REQUIRED":
      return {
        status: value.status,
        nextAction: "changePassword",
        expiresAt: value.expiresAt,
      };
    case "TWO_FACTOR_SETUP_REQUIRED":
      return {
        status: value.status,
        nextAction: "confirmTwoFactorSetup",
        expiresAt: value.expiresAt,
      };
    case "TWO_FACTOR_REQUIRED":
      return {
        status: value.status,
        nextAction: "verifyTwoFactor",
        expiresAt: value.expiresAt,
      };
    case "RECOVERY_CODES_REQUIRED":
      return {
        status: value.status,
        nextAction: "acknowledgeRecoveryCodes",
        expiresAt: value.expiresAt,
        recoveryCodes: DEMO_CODES.filter((_, i) => !value.used.includes(i)),
      };
  }
}
function requireStep(step: Step): Snapshot {
  const value = current();
  if (value.reason === "CHALLENGE_EXPIRED")
    throw new AuthError(
      "CHALLENGE_EXPIRED",
      "Your sign-in attempt expired. Sign in again to continue.",
    );
  if (value.status !== step)
    throw new AuthError(
      "STEP_UNAVAILABLE",
      "This step is unavailable. Restoring your current step.",
    );
  return value;
}
function advance(value: Snapshot, status: Step): AuthState {
  const next = { ...value, status };
  save(next);
  return state(next);
}
function verify(code: string): void {
  codeSchema.parse({ code });
  if (code === "000000")
    throw new AuthError(
      "CODE_EXPIRED",
      "That code has expired. Wait for a new code and try again.",
    );
  if (code !== "012345")
    throw new AuthError(
      "INVALID_CODE",
      "That code is incorrect. Check Google Authenticator and try again.",
    );
}
// Serialize mutations so repeated clicks cannot consume the same recovery fixture twice.
function request<T>(action: () => T): Promise<T> {
  const result = queue.then(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return action();
  });
  queue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
export const mockAuthAdapter: AuthAdapter = {
  login: (values) =>
    request(() => {
      loginSchema.parse(values);
      const account = values.email.toLowerCase();
      if (
        ![
          "first@demo.example",
          "returning@demo.example",
          "expiry@demo.example",
        ].includes(account)
      )
        throw new Error("Use one of the documented demo accounts.");
      const previous = current();
      const value: Snapshot = {
        status:
          account === "returning@demo.example"
            ? "TWO_FACTOR_REQUIRED"
            : "PASSWORD_CHANGE_REQUIRED",
        expiresAt:
          Date.now() +
          (account === "expiry@demo.example" ? 15000 : 15 * 60 * 1000),
        used: previous.used,
      };
      save(value);
      return state(value);
    }),
  changePassword: (values) =>
    request(() => {
      passwordSchema.parse(values);
      return advance(
        requireStep("PASSWORD_CHANGE_REQUIRED"),
        "TWO_FACTOR_SETUP_REQUIRED",
      );
    }),
  getTwoFactorSetup: () =>
    request(() => {
      const value = requireStep("TWO_FACTOR_SETUP_REQUIRED");
      return {
        state: {
          status: "TWO_FACTOR_SETUP_REQUIRED",
          nextAction: "confirmTwoFactorSetup",
          expiresAt: value.expiresAt,
        },
        manualKey: DEMO_KEY,
        provisioningUri: `otpauth://totp/FastMet%20DEMO:demo%40example.invalid?secret=${DEMO_KEY}&issuer=FastMet%20DEMO&algorithm=SHA1&digits=6&period=30`,
        demo: true,
      };
    }),
  confirmTwoFactorSetup: (code) =>
    request(() => {
      const value = requireStep("TWO_FACTOR_SETUP_REQUIRED");
      verify(code);
      return advance(value, "RECOVERY_CODES_REQUIRED");
    }),
  verifyTwoFactor: (code) =>
    request(() => {
      const value = requireStep("TWO_FACTOR_REQUIRED");
      verify(code);
      return advance(value, "AUTHENTICATED");
    }),
  verifyRecoveryCode: (code) =>
    request(() => {
      const value = requireStep("TWO_FACTOR_REQUIRED");
      recoverySchema.parse({ code });
      const index = DEMO_CODES.indexOf(code.trim().toUpperCase());
      if (index < 0 || value.used.includes(index))
        throw new AuthError(
          "INVALID_CODE",
          "That recovery code is invalid or has already been used.",
        );
      return advance(
        { ...value, used: [...value.used, index] },
        "AUTHENTICATED",
      );
    }),
  acknowledgeRecoveryCodes: () =>
    request(() =>
      advance(requireStep("RECOVERY_CODES_REQUIRED"), "AUTHENTICATED"),
    ),
  getAuthState: () => request(() => state(current())),
  logout: () =>
    request(() => {
      const value = { ...fresh(), used: read().used };
      save(value);
      return state(value);
    }),
};
