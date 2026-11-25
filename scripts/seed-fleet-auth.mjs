import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

export function developmentSeedUri(env = process.env) {
  if (env.NODE_ENV !== "development" || env.FLEET_ALLOW_DEV_SEED !== "1") {
    throw new Error(
      "Set NODE_ENV=development and FLEET_ALLOW_DEV_SEED=1 to seed a development account.",
    );
  }

  const uri = env.FLEET_MONGODB_URI;
  if (!uri)
    throw new Error(
      "Set FLEET_MONGODB_URI for the approved development database.",
    );
  const host = new URL(uri).hostname;
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(host);
  if (!local && host !== "fastmet-dev.cztvsqu.mongodb.net") {
    throw new Error(
      "Fleet seed requires the FastMet development cluster or loopback MongoDB.",
    );
  }
  return uri;
}

export async function createDevelopmentAccount(db) {
  const suffix = randomBytes(6).toString("hex");
  const initialPassword = randomBytes(24).toString("base64url");
  const companyEmail = "fleet-auth-qa-" + suffix + "@example.com";
  const companyName = "Fleet Auth QA " + suffix;
  const result = await db.collection("fleetapplications").insertOne({
    companyName,
    registeredBusinessName: companyName,
    companyEmail,
    businessType: "Corporation",
    garageAddress: "Development QA",
    dispatchPhone: "09175550101",
    repFullName: "Fleet QA Representative",
    repPosition: "Dispatcher",
    repMobile: "09175550102",
    tin: "999000001",
    acceptTerms: true,
    documents: [],
    status: "approved",
    reviewedBy: null,
    reviewedAt: null,
    submittedAt: new Date(),
    developmentOnly: true,
    password: await bcrypt.hash(initialPassword, 12),
    mustChangePassword: true,
  });
  return { id: result.insertedId, companyEmail, initialPassword };
}

if (import.meta.main) {
  try {
    const connection = new MongoClient(developmentSeedUri(), {
      serverSelectionTimeoutMS: 5000,
    });
    try {
      await connection.connect();
      const { companyEmail, initialPassword } = await createDevelopmentAccount(
        connection.db(),
      );
      console.log(JSON.stringify({ companyEmail, initialPassword }));
    } finally {
      await connection.close();
    }
  } catch (error) {
    // Only emit our own configuration messages, never MongoDB connection errors.
    const message =
      error instanceof Error && error.message.startsWith("Set ")
        ? error.message
        : "Unable to create the Fleet development account.";
    console.error(message);
    process.exitCode = 1;
  }
}
