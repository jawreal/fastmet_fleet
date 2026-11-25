import type { LoginValues } from "./login";

export type TwoFactorSetupState = {
  status: "TWO_FACTOR_SETUP_REQUIRED";
  nextAction: "getTwoFactorSetup" | "confirmTwoFactorSetup";
  expiresAt: number;
  setupAttemptId: string;
  passwordChanged?: true;
};

export type AuthState =
  | {
      status: "SIGNED_OUT";
      nextAction: "login";
      reason?: "CHALLENGE_EXPIRED" | "SESSION_EXPIRED";
    }
  | {
      status: "PASSWORD_CHANGE_REQUIRED";
      nextAction: "changePassword";
      expiresAt: number;
      passwordTerms: readonly string[];
    }
  | TwoFactorSetupState
  | {
      status: "TWO_FACTOR_REQUIRED";
      nextAction: "verifyTwoFactor" | "verifyRecoveryCode";
      expiresAt: number;
    }
  | {
      status: "RECOVERY_CODES_REQUIRED";
      nextAction: "acknowledgeRecoveryCodes";
      expiresAt: number;
      recoveryCodes: readonly string[];
    }
  | {
      status: "AUTHENTICATED";
      nextAction: "continue";
      expiresAt: number;
      sessionMode: "browser" | "seven_days";
    };

export interface TwoFactorSetup {
  state: TwoFactorSetupState;
  manualKey: string;
  provisioningUri: string;
}

export interface AuthAdapter {
  login(values: LoginValues): Promise<AuthState>;
  changePassword(values: {
    newPassword: string;
    confirmPassword: string;
  }): Promise<AuthState>;
  changeAccountPassword(values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<AuthState>;
  getTwoFactorSetup(): Promise<TwoFactorSetup>;
  confirmTwoFactorSetup(code: string): Promise<AuthState>;
  verifyTwoFactor(code: string): Promise<AuthState>;
  verifyRecoveryCode(code: string): Promise<AuthState>;
  acknowledgeRecoveryCodes(): Promise<AuthState>;
  getAuthState(): Promise<AuthState>;
  logout(): Promise<AuthState>;
}

export class AuthError extends Error {
  constructor(
    public readonly code:
      | "INVALID_CODE"
      | "CODE_EXPIRED"
      | "CHALLENGE_EXPIRED"
      | "STEP_UNAVAILABLE"
      | "INVALID_CREDENTIALS"
      | "INVALID_INPUT"
      | "RATE_LIMITED"
      | "UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const authRoutes: Record<AuthState["status"], string> = {
  SIGNED_OUT: "/login",
  PASSWORD_CHANGE_REQUIRED: "/change-password",
  TWO_FACTOR_SETUP_REQUIRED: "/two-factor/setup",
  TWO_FACTOR_REQUIRED: "/two-factor/verify",
  RECOVERY_CODES_REQUIRED: "/two-factor/recovery-codes",
  AUTHENTICATED: "/operations/overview",
};
