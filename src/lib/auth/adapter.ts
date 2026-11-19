import { AuthError, type AuthAdapter } from "./types";

export const mockAuthEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_FLEET_AUTH_MOCK === "true";

const unavailable = async (): Promise<never> => {
  throw new AuthError(
    "UNCONNECTED",
    "Sign-in is not connected yet. Contact your administrator for access.",
  );
};

const disconnectedAdapter: AuthAdapter = {
  login: unavailable,
  changePassword: unavailable,
  getTwoFactorSetup: unavailable,
  confirmTwoFactorSetup: unavailable,
  verifyTwoFactor: unavailable,
  verifyRecoveryCode: unavailable,
  acknowledgeRecoveryCodes: unavailable,
  getAuthState: async () => ({ status: "SIGNED_OUT", nextAction: "login" }),
  logout: async () => ({ status: "SIGNED_OUT", nextAction: "login" }),
};

export async function getAuthAdapter(): Promise<AuthAdapter> {
  if (mockAuthEnabled) return (await import("./mock")).mockAuthAdapter;
  return disconnectedAdapter;
}
