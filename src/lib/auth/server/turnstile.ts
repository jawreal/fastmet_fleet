import "server-only";
import { MongoServerError } from "mongodb";
import { z } from "zod";
import { turnstileLoginAction } from "../login";
import { AuthError } from "../types";
import { digest } from "./crypto";
import { fleetDb } from "./db";

const siteverifyUrl =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const maxAgeMs = 5 * 60_000;
const clockSkewMs = 30_000;
const testSecrets = new Set([
  "1x0000000000000000000000000000000AA",
  "2x0000000000000000000000000000000AA",
  "3x0000000000000000000000000000000AA",
]);
const siteverifyResult = z.object({
  success: z.boolean(),
  hostname: z.string().optional(),
  action: z.string().optional(),
  challenge_ts: z.string().optional(),
  "error-codes": z.array(z.string()).default([]),
});

function unavailable() {
  return new AuthError(
    "UNAVAILABLE",
    "Security verification is temporarily unavailable. Please try again.",
  );
}

function alreadyUsed() {
  return new AuthError(
    "INVALID_INPUT",
    "Security verification expired or was already used. Please try signing in again.",
  );
}

function invalid() {
  return new AuthError(
    "INVALID_INPUT",
    "Security verification failed. Please try signing in again.",
  );
}

async function siteverify(token: string, secret: string) {
  const result = await fetch(siteverifyUrl, {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  })
    .then(async (response) =>
      response.ok ? siteverifyResult.safeParse(await response.json()) : null,
    )
    .catch(() => null);
  if (!result?.success) throw unavailable();

  const verification = result.data;
  if (verification.success) return verification;

  const errors = verification["error-codes"];
  if (errors.includes("timeout-or-duplicate")) throw alreadyUsed();
  if (
    errors.some((code) =>
      [
        "missing-input-secret",
        "invalid-input-secret",
        "internal-error",
        "bad-request",
      ].includes(code),
    )
  ) {
    throw unavailable();
  }
  throw invalid();
}

export async function verifyLoginTurnstile(token: string) {
  const secret = process.env.FLEET_TURNSTILE_SECRET_KEY?.trim();
  const hostname = process.env.FLEET_TURNSTILE_HOSTNAME?.trim().toLowerCase();
  if (!secret || !hostname) throw unavailable();

  const testing = testSecrets.has(secret);
  if (
    testing &&
    (process.env.NODE_ENV !== "development" ||
      !["localhost", "127.0.0.1"].includes(hostname))
  ) {
    throw unavailable();
  }

  const result = await siteverify(token, secret);

  if (testing) {
    // Cloudflare returns a fixed dummy token, example.com, and no action for local test keys.
    if (result.hostname !== "example.com" || result.action !== undefined)
      throw invalid();
    return;
  }
  if (result.hostname !== hostname || result.action !== turnstileLoginAction) {
    throw invalid();
  }
  const now = Date.now();
  const solvedAt = Date.parse(result.challenge_ts ?? "");
  if (!Number.isFinite(solvedAt) || solvedAt > now + clockSkewMs)
    throw invalid();
  if (now - solvedAt >= maxAgeMs) throw alreadyUsed();

  // Siteverify's redemption state can lag. Only one request may claim the digest.
  const { turnstileUses } = await fleetDb();
  try {
    await turnstileUses.insertOne(
      { _id: digest(token), expiresAt: new Date(now + maxAgeMs + clockSkewMs) },
      { writeConcern: { w: "majority" } },
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000)
      throw alreadyUsed();
    throw error;
  }
}
