import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Filter, ObjectId } from "mongodb";
import { authRoutes, type AuthState } from "../types";
import { fleetDb, type FleetAccount, type FleetSession } from "./db";
import { digest } from "./crypto";

const cookieName =
  process.env.NODE_ENV === "production"
    ? "__Host-fleet_session"
    : "fleet_session";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;
const pendingMs = 10 * 60 * 1000;
const idleMs = 30 * 60 * 1000;
const browserMs = 8 * 60 * 60 * 1000;
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

export const signedOut = { status: "SIGNED_OUT", nextAction: "login" } as const;

export function companyPasswordTerms(
  account: Pick<FleetAccount, "companyName" | "companyEmail">,
) {
  return [account.companyName, account.companyEmail.split("@", 1)[0]];
}

export async function findApprovedAccount(
  lookup: { companyEmail: string } | { _id: ObjectId },
) {
  const filter: Filter<FleetAccount> = {
    ...lookup,
    status: "approved",
    password: { $type: "string" },
  };
  if (process.env.NODE_ENV !== "development")
    filter.developmentOnly = { $ne: true };
  return (await fleetDb()).accounts.findOne(filter, {
    projection: {
      companyEmail: 1,
      companyName: 1,
      registeredBusinessName: 1,
      repFullName: 1,
      garageAddress: 1,
      password: 1,
      mustChangePassword: 1,
    },
  });
}

export async function readFleetSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !tokenPattern.test(token)) return null;
  const { sessions, authenticators } = await fleetDb();
  const now = new Date();
  const session = await sessions.findOne({
    _id: digest(token),
    expiresAt: { $gt: now },
    idleUntil: { $gt: now },
  });
  if (!session) return null;
  const account = await findApprovedAccount({ _id: session.accountId });
  if (!account || digest(account.password) !== session.passwordVersion)
    return null;
  if (
    account.mustChangePassword !== false &&
    session.status !== "PASSWORD_CHANGE_REQUIRED"
  )
    return null;
  if (session.status !== "AUTHENTICATED") return { session, account };

  if (!session.mfaVersion) return null;
  const profile = await authenticators.findOne({
    _id: account._id,
    version: session.mfaVersion,
    pendingRecovery: { $exists: false },
  });
  if (!profile) return null;

  if (!session.keepSignedIn) {
    await sessions.updateOne(
      { _id: session._id, idleUntil: { $gt: now } },
      {
        $max: {
          idleUntil: new Date(
            Math.min(session.expiresAt.getTime(), now.getTime() + idleMs),
          ),
        },
      },
    );
  }
  return { session, account };
}

export async function revokeFleetSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token && tokenPattern.test(token)) {
    await (await fleetDb()).sessions.deleteOne({ _id: digest(token) });
  }
  store.set(cookieName, "", { ...cookieOptions, maxAge: 0 });
}

export async function issueFleetSession(
  account: FleetAccount,
  status: FleetSession["status"],
  keepSignedIn: boolean,
  previous?: FleetSession,
  mfaVersion?: string,
) {
  const { sessions } = await fleetDb();
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  let expiresAt = previous?.expiresAt ?? new Date(now + pendingMs);
  let idleUntil = expiresAt;
  if (status === "AUTHENTICATED") {
    expiresAt = new Date(now + (keepSignedIn ? sevenDaysMs : browserMs));
    idleUntil = keepSignedIn ? expiresAt : new Date(now + idleMs);
  }
  const session: FleetSession = {
    _id: digest(token),
    accountId: account._id,
    passwordVersion: digest(account.password),
    status,
    keepSignedIn,
    expiresAt,
    idleUntil,
    mfaVersion,
  };
  await sessions.insertOne(session);
  if (previous) {
    const removed = await sessions.deleteOne({
      _id: previous._id,
      status: previous.status,
      expiresAt: { $gt: new Date() },
    });
    if (!removed.deletedCount) {
      await sessions.deleteOne({ _id: session._id });
      return null;
    }
  }
  const options =
    keepSignedIn && status === "AUTHENTICATED"
      ? { ...cookieOptions, expires: expiresAt }
      : cookieOptions;
  (await cookies()).set(cookieName, token, options);
  return session;
}

// Memoize per render only. No session or company data is shared across requests.
const requireFleetContext = cache(async () => {
  const context = await readFleetSession();
  if (!context) redirect(authRoutes.SIGNED_OUT);
  if (context.session.status !== "AUTHENTICATED")
    redirect(authRoutes[context.session.status]);
  return context;
});

export async function requireFleetCompany() {
  const { account } = await requireFleetContext();
  return {
    name: account.companyName,
    location: account.garageAddress,
  };
}

export async function requireCompanyPasswordTerms() {
  const { account } = await requireFleetContext();
  return companyPasswordTerms(account);
}

export function authenticatedState(session: FleetSession): AuthState {
  return {
    status: "AUTHENTICATED",
    nextAction: "continue",
    expiresAt: session.expiresAt.getTime(),
    sessionMode: session.keepSignedIn ? "seven_days" : "browser",
  };
}
