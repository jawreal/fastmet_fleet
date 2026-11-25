import "server-only";
import { AuthError, type AuthState, type TwoFactorSetupState } from "../types";
import type { LoginRequest } from "../login";
import { verifyLoginTurnstile } from "./turnstile";
import { assessPassword } from "../password-policy";
import { fleetDb, type FleetAccount, type FleetSession } from "./db";
import { digest, unseal } from "./crypto";
import { hashPassword, verifyPassword } from "./password";
import { throttle } from "./rateLimit";
import {
  authenticatedState,
  companyPasswordTerms,
  findApprovedAccount,
  issueFleetSession,
  readFleetSession,
  revokeFleetSession,
  signedOut,
} from "./dal";

export type StepContext = NonNullable<
  Awaited<ReturnType<typeof readFleetSession>>
>;

function requireTransition(session: FleetSession | null) {
  if (!session)
    throw new AuthError(
      "STEP_UNAVAILABLE",
      "This sign-in step has already changed.",
    );
  return session;
}

export async function requireStep(status: FleetSession["status"]) {
  const context = await readFleetSession();
  if (!context)
    throw new AuthError("CHALLENGE_EXPIRED", "Sign in again to continue.");
  if (context.session.status !== status) {
    throw new AuthError(
      "STEP_UNAVAILABLE",
      "Complete the current sign-in step first.",
    );
  }
  return context;
}

export function twoFactorSetupState(
  session: FleetSession,
  nextAction: TwoFactorSetupState["nextAction"],
): TwoFactorSetupState {
  return {
    status: "TWO_FACTOR_SETUP_REQUIRED",
    nextAction,
    expiresAt: session.expiresAt.getTime(),
    setupAttemptId: digest("fleet:setup-notice:" + session._id),
  };
}

export async function stateFor(
  session: FleetSession,
  account: FleetAccount,
): Promise<AuthState> {
  const expiresAt = session.expiresAt.getTime();
  switch (session.status) {
    case "PASSWORD_CHANGE_REQUIRED":
      return {
        status: session.status,
        nextAction: "changePassword",
        expiresAt,
        passwordTerms: companyPasswordTerms(account),
      };
    case "TWO_FACTOR_SETUP_REQUIRED":
      return twoFactorSetupState(session, "getTwoFactorSetup");
    case "TWO_FACTOR_REQUIRED":
      return {
        status: session.status,
        nextAction: "verifyTwoFactor",
        expiresAt,
      };
    case "RECOVERY_CODES_REQUIRED": {
      const profile = await (
        await fleetDb()
      ).authenticators.findOne({
        _id: session.accountId,
        version: session.mfaVersion,
      });
      if (!profile?.pendingRecovery) return signedOut;
      const recoveryCodes = unseal(
        profile.pendingRecovery,
        "recovery:" + session.accountId.toHexString(),
      ).split(",");
      return {
        status: session.status,
        nextAction: "acknowledgeRecoveryCodes",
        expiresAt,
        recoveryCodes,
      };
    }
    case "AUTHENTICATED":
      return authenticatedState(session);
  }
}

export async function advance(
  context: StepContext,
  status: FleetSession["status"],
  mfaVersion?: string,
) {
  const { account, session: previous } = context;
  return stateFor(
    requireTransition(
      await issueFleetSession(
        account,
        status,
        previous.keepSignedIn,
        previous,
        mfaVersion,
      ),
    ),
    account,
  );
}

async function nextSecondFactor(accountId: StepContext["account"]["_id"]) {
  const profile = await (
    await fleetDb()
  ).authenticators.findOne({ _id: accountId }, { projection: { _id: 1 } });
  return profile ? "TWO_FACTOR_REQUIRED" : "TWO_FACTOR_SETUP_REQUIRED";
}

export async function signIn(values: LoginRequest) {
  await throttle("login:global", 600, 60_000);
  await throttle("login:" + values.email, 10, 15 * 60_000);
  await verifyLoginTurnstile(values.turnstileToken);
  const account = await findApprovedAccount({ companyEmail: values.email });
  const valid = await verifyPassword(values.password, account?.password);
  if (!valid || !account)
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password.");

  const status =
    account.mustChangePassword !== false
      ? "PASSWORD_CHANGE_REQUIRED"
      : await nextSecondFactor(account._id);
  await revokeFleetSession();
  return stateFor(
    requireTransition(
      await issueFleetSession(account, status, values.keepSignedIn),
    ),
    account,
  );
}

async function replacePassword(context: StepContext, nextPassword: string) {
  const { account } = context;
  await throttle("password:" + account._id.toHexString(), 10, 15 * 60_000);
  const { issue } = assessPassword(nextPassword, [
    ...companyPasswordTerms(account),
    account.companyEmail,
    account.registeredBusinessName ?? "",
    account.repFullName ?? "",
  ]);
  if (issue) throw new AuthError("INVALID_INPUT", issue);
  if (await verifyPassword(nextPassword, account.password)) {
    throw new AuthError("INVALID_INPUT", "Choose a different password.");
  }

  const password = await hashPassword(nextPassword);
  const result = await (
    await fleetDb()
  ).accounts.updateOne(
    {
      _id: account._id,
      status: "approved",
      password: account.password,
      mustChangePassword:
        context.session.status === "PASSWORD_CHANGE_REQUIRED"
          ? { $ne: false }
          : false,
    },
    { $set: { password, mustChangePassword: false } },
  );
  if (!result.modifiedCount)
    throw new AuthError("STEP_UNAVAILABLE", "Sign in again to continue.");

  return { ...account, password, mustChangePassword: false };
}

export async function changeInitialPassword(
  newPassword: string,
): Promise<AuthState> {
  const context = await requireStep("PASSWORD_CHANGE_REQUIRED");
  const account = await replacePassword(context, newPassword);
  const next = await advance(
    { ...context, account },
    await nextSecondFactor(account._id),
  );
  if (
    context.account.mustChangePassword === true &&
    account.mustChangePassword === false &&
    next.status === "TWO_FACTOR_SETUP_REQUIRED"
  ) {
    return { ...next, passwordChanged: true };
  }
  return next;
}

export async function changeAccountPassword(
  currentPassword: string,
  newPassword: string,
) {
  const context = await requireStep("AUTHENTICATED");
  await throttle(
    "verify-password:" + context.account._id.toHexString(),
    5,
    15 * 60_000,
  );
  if (!(await verifyPassword(currentPassword, context.account.password))) {
    throw new AuthError(
      "INVALID_CREDENTIALS",
      "The current password is incorrect.",
    );
  }
  await replacePassword(context, newPassword);
  await revokeFleetSession();
  return signedOut;
}
