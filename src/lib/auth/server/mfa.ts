import "server-only";
import { randomBytes } from "node:crypto";
import { MongoServerError } from "mongodb";
import { Secret, TOTP } from "otpauth";
import { AuthError } from "../types";
import { fleetDb } from "./db";
import { digest, seal, unseal } from "./crypto";
import { throttle } from "./rateLimit";
import {
  advance,
  requireStep,
  twoFactorSetupState,
  type StepContext,
} from "./flow";

function totpFor(secret: string, label: string) {
  return new TOTP({
    issuer: "FastMet Fleet",
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
}

function acceptedCounter(totp: TOTP, code: string) {
  const timestamp = Date.now();
  const delta = totp.validate({ token: code, timestamp, window: 1 });
  if (delta === null) throw invalidCode();
  return totp.counter({ timestamp }) + delta;
}

function invalidCode() {
  return new AuthError(
    "INVALID_CODE",
    "Enter a fresh authenticator or recovery code.",
  );
}

async function throttleSecondFactor(context: StepContext) {
  await throttle("mfa:" + context.account._id.toHexString(), 6, 5 * 60_000);
}

export async function getTwoFactorSetup() {
  const { account, session } = await requireStep("TWO_FACTOR_SETUP_REQUIRED");
  const { sessions, authenticators } = await fleetDb();
  if (
    await authenticators.findOne(
      { _id: account._id },
      { projection: { _id: 1 } },
    )
  ) {
    throw new AuthError(
      "STEP_UNAVAILABLE",
      "An authenticator is already enrolled. Sign in again.",
    );
  }
  const context = "setup:" + session._id;
  let encrypted = session.setupSecret;
  if (!encrypted) {
    const saved = await sessions.findOneAndUpdate(
      {
        _id: session._id,
        status: session.status,
        setupSecret: { $exists: false },
        expiresAt: { $gt: new Date() },
      },
      { $set: { setupSecret: seal(new Secret({ size: 20 }).base32, context) } },
      { returnDocument: "after" },
    );
    encrypted =
      saved?.setupSecret ??
      (await sessions.findOne({ _id: session._id }))?.setupSecret;
  }
  if (!encrypted)
    throw new AuthError("CHALLENGE_EXPIRED", "Sign in again to continue.");
  const manualKey = unseal(encrypted, context);

  return {
    state: twoFactorSetupState(session, "confirmTwoFactorSetup"),
    manualKey,
    provisioningUri: totpFor(manualKey, account.companyEmail).toString(),
  } as const;
}

export async function confirmTwoFactorSetup(code: string) {
  const context = await requireStep("TWO_FACTOR_SETUP_REQUIRED");
  const { account, session } = context;
  if (!session.setupSecret)
    throw new AuthError("STEP_UNAVAILABLE", "Open authenticator setup first.");
  await throttleSecondFactor(context);
  const id = account._id.toHexString();
  const secret = unseal(session.setupSecret, "setup:" + session._id);
  const lastStep = acceptedCounter(totpFor(secret, account.companyEmail), code);
  const codes = Array.from({ length: 8 }, () =>
    randomBytes(8).toString("hex").toUpperCase(),
  );
  const version = randomBytes(16).toString("hex");
  try {
    await (
      await fleetDb()
    ).authenticators.insertOne({
      _id: account._id,
      version,
      secret: seal(secret, "totp:" + id),
      lastStep,
      recoveryHashes: codes.map(digest),
      pendingRecovery: seal(codes.join(","), "recovery:" + id),
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new AuthError(
        "STEP_UNAVAILABLE",
        "An authenticator is already enrolled. Sign in again.",
      );
    }
    throw error;
  }

  return advance(context, "RECOVERY_CODES_REQUIRED", version);
}

export async function submitSecondFactor(
  code: string,
  method: "totp" | "recovery",
) {
  const context = await requireStep("TWO_FACTOR_REQUIRED");
  await throttleSecondFactor(context);
  const { account } = context;
  const { authenticators } = await fleetDb();
  const profile = await authenticators.findOne({ _id: account._id });
  if (!profile)
    throw new AuthError(
      "STEP_UNAVAILABLE",
      "Sign in again to set up an authenticator.",
    );

  const filter = { _id: account._id, version: profile.version };
  if (method === "recovery") {
    const hash = digest(code.toUpperCase().replaceAll("-", ""));
    const consumed = await authenticators.updateOne(
      {
        ...filter,
        recoveryHashes: hash,
        pendingRecovery: { $exists: false },
      },
      { $pull: { recoveryHashes: hash } },
    );
    if (!consumed.modifiedCount) throw invalidCode();
  } else {
    const secret = unseal(profile.secret, "totp:" + account._id.toHexString());
    const lastStep = acceptedCounter(
      totpFor(secret, account.companyEmail),
      code,
    );
    const consumed = await authenticators.updateOne(
      { ...filter, lastStep: { $lt: lastStep } },
      { $set: { lastStep } },
    );
    if (!consumed.modifiedCount) throw invalidCode();
  }
  return advance(
    context,
    profile.pendingRecovery ? "RECOVERY_CODES_REQUIRED" : "AUTHENTICATED",
    profile.version,
  );
}

export async function acknowledgeRecoveryCodes() {
  const context = await requireStep("RECOVERY_CODES_REQUIRED");
  const { account, session } = context;
  if (!session.mfaVersion)
    throw new AuthError("STEP_UNAVAILABLE", "Sign in again to continue.");
  const result = await (
    await fleetDb()
  ).authenticators.updateOne(
    {
      _id: account._id,
      version: session.mfaVersion,
      pendingRecovery: { $exists: true },
    },
    { $unset: { pendingRecovery: "" } },
  );
  if (!result.modifiedCount)
    throw new AuthError("STEP_UNAVAILABLE", "Sign in again to continue.");
  return advance(context, "AUTHENTICATED", session.mfaVersion);
}
