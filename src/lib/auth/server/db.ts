import "server-only";
import { MongoClient, type ObjectId } from "mongodb";
import type { AuthState } from "../types";

export type FleetAccount = {
  _id: ObjectId;
  companyEmail: string;
  companyName: string;
  registeredBusinessName?: string;
  repFullName?: string;
  garageAddress: string;
  status: string;
  password: string;
  mustChangePassword?: boolean;
  developmentOnly?: boolean;
};

export type FleetSession = {
  _id: string;
  accountId: ObjectId;
  passwordVersion: string;
  status: Exclude<AuthState["status"], "SIGNED_OUT">;
  expiresAt: Date;
  idleUntil: Date;
  keepSignedIn: boolean;
  setupSecret?: string;
  mfaVersion?: string;
};

export type FleetAuthenticator = {
  _id: ObjectId;
  version: string;
  secret: string;
  lastStep: number;
  recoveryHashes: string[];
  pendingRecovery?: string;
};

let connection: ReturnType<typeof connect> | undefined;

async function connect() {
  const uri = process.env.FLEET_MONGODB_URI;
  if (!uri) throw new Error("Missing Fleet database configuration.");
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  try {
    await client.connect();
    const db = client.db();
    const sessions = db.collection<FleetSession>("fleetwebsessions");
    const turnstileUses = db.collection<{ _id: string; expiresAt: Date }>(
      "fleetwebturnstileuses",
    );
    await Promise.all([
      sessions.createIndexes([
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      ]),
      turnstileUses.createIndexes([
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      ]),
    ]);
    return {
      accounts: db.collection<FleetAccount>("fleetapplications"),
      sessions,
      turnstileUses,
      authenticators: db.collection<FleetAuthenticator>(
        "fleetwebauthenticators",
      ),
    };
  } catch (error) {
    await client.close();
    throw error;
  }
}

export function fleetDb() {
  connection ??= connect().catch((error: unknown) => {
    connection = undefined;
    throw error;
  });
  return connection;
}
