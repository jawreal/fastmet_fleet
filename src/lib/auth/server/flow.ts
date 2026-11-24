import "server-only";
import bcrypt from "bcryptjs";
import { MongoServerError } from "mongodb";
import { AuthError, type AuthState } from "../types";
import type { LoginValues } from "../login";
import { fleetDb, type FleetSession } from "./db";
import { digest, unseal } from "./crypto";
import {
  authenticatedState,
  findApprovedAccount,
  issueFleetSession,
  readFleetSession,
  revokeFleetSession,
  signedOut,
} from "./dal";

const dummyHash =
  "$2b$12$5xBpEK3zLIIPmnRGevu9L.TljUBaTLcsT/811FOxn635qN5JfMIw.";
const passwordRounds = 12;
export type StepContext = NonNullable<
  Awaited<ReturnType<typeof readFleetSession>>
>;

export async function throttle(key: string, limit: number, windowMs: number) {
  const { attempts } = await fleetDb();
  const expiresAt = new Date(
    (Math.floor(Date.now() / windowMs) + 1) * windowMs,
  );
  const _id = digest(key + ":" + expiresAt.toISOString());
  const counter = await attempts
    .findOneAndUpdate(
      { _id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: "after" },
    )
    .catch((error: unknown) => {
      if (error instanceof MongoServerError && error.code === 11000) {
        return attempts.findOneAndUpdate(
          { _id },
          { $inc: { count: 1 } },
          { returnDocument: "after" },
        );
      }
      throw error;
    });
  if (!counter || counter.count > limit) {
    throw new AuthError(
      "RATE_LIMITED",
      "Too many attempts. Please try again later.",
    );
  }
}

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

export async function stateFor(session: FleetSession): Promise<AuthState> {
  const expiresAt = session.expiresAt.getTime();
  switch (session.status) {
    case "PASSWORD_CHANGE_REQUIRED":
      return {
        status: session.status,
        nextAction: "changePassword",
        expiresAt,
      };
    case "TWO_FACTOR_SETUP_REQUIRED":
      return {
        status: session.status,
        nextAction: "getTwoFactorSetup",
        expiresAt,
      };
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
  );
}

async function nextSecondFactor(accountId: StepContext["account"]["_id"]) {
  const profile = await (
    await fleetDb()
  ).authenticators.findOne({ _id: accountId }, { projection: { _id: 1 } });
  return profile ? "TWO_FACTOR_REQUIRED" : "TWO_FACTOR_SETUP_REQUIRED";
}

export async function signIn(values: LoginValues) {
  await throttle("login:global", 600, 60_000);
  await throttle("login:" + values.email, 10, 15 * 60_000);
  const account = await findApprovedAccount({ companyEmail: values.email });
  const valid = await bcrypt.compare(
    values.password,
    account?.password ?? dummyHash,
  );
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
  );
}

async function replacePassword(context: StepContext, nextPassword: string) {
  const { account } = context;
  await throttle("password:" + account._id.toHexString(), 10, 15 * 60_000);
  if (await bcrypt.compare(nextPassword, account.password)) {
    throw new AuthError("INVALID_INPUT", "Choose a different password.");
  }

  const password = await bcrypt.hash(nextPassword, passwordRounds);
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

export async function changeInitialPassword(newPassword: string) {
  const context = await requireStep("PASSWORD_CHANGE_REQUIRED");
  const account = await replacePassword(context, newPassword);
  return advance({ ...context, account }, await nextSecondFactor(account._id));
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
  if (!(await bcrypt.compare(currentPassword, context.account.password))) {
    throw new AuthError(
      "INVALID_CREDENTIALS",
      "The current password is incorrect.",
    );
  }
  await replacePassword(context, newPassword);
  await revokeFleetSession();
  return signedOut;
}
