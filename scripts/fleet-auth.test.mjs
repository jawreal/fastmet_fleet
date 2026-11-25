import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { TOTP, URI } from "otpauth";
import {
  createDevelopmentAccount,
  developmentSeedUri,
} from "./seed-fleet-auth.mjs";

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function startApp(t, uri) {
  const port = await freePort();
  const origin = "http://127.0.0.1:" + port;
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      env: {
        ...process.env,
        NODE_ENV: "development",
        NEXT_TELEMETRY_DISABLED: "1",
        FLEET_MONGODB_URI: uri,
        FLEET_AUTH_ORIGIN: origin,
        FLEET_AUTH_ENCRYPTION_KEY: randomBytes(32).toString("hex"),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => {
      output = (output + chunk.toString()).slice(-12000);
    });
  }
  let stopped = false;
  const exit = once(child, "exit").then(() => {
    stopped = true;
  });
  t.after(async () => {
    if (!stopped) child.kill();
    await exit;
  });
  const deadline = Date.now() + 45000;
  while (!stopped && Date.now() < deadline) {
    try {
      const response = await fetch(origin + "/api/fleet/auth/state", {
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) return origin;
    } catch {
      // Next may still be starting or compiling the auth route.
    }
    await delay(200);
  }
  throw new Error("Fleet test server did not start.\n" + output);
}

function client(origin) {
  let cookie = "";
  return {
    sessionCookie: () => cookie,
    async request(path, body, requestOrigin = origin) {
      const headers = { Cookie: cookie };
      const options = { headers, redirect: "manual" };
      if (body !== undefined) {
        options.method = "POST";
        options.body = JSON.stringify(body);
        headers.Origin = requestOrigin;
        headers["Content-Type"] = "application/json";
      }
      const response = await fetch(origin + path, options);
      const issued = response.headers.get("set-cookie");
      if (issued) cookie = issued.split(";")[0];
      return response;
    },
  };
}

const api = "/api/fleet/auth/";
async function requestState(browser, action, input, status = 200) {
  const response = await browser.request(api + action, input);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.status, status);
  return { body: await response.json(), headers: response.headers };
}

async function assertRedirect(browser, destination) {
  const result = await browser.request("/operations/overview");
  // Next may issue a streamed redirect when request-time validation suspends.
  const location = result.headers.get("location");
  if (location) {
    assert.equal(
      new URL(location, "http://fleet.example").pathname,
      destination,
    );
    return;
  }
  const html = await result.text();
  assert.ok(
    html.includes("NEXT_REDIRECT") && html.includes(destination),
    "Expected redirect to " + destination,
  );
  assert.ok(
    !html.includes('class="fleet-dashboard"'),
    "The dashboard shell was emitted before authorization.",
  );
}

test("development seeding rejects production and unapproved MongoDB hosts", () => {
  const env = {
    FLEET_ALLOW_DEV_SEED: "1",
    FLEET_MONGODB_URI: "mongodb://127.0.0.1/fleet",
  };
  assert.throws(() => developmentSeedUri({ ...env, NODE_ENV: "production" }));
  assert.throws(() =>
    developmentSeedUri({
      ...env,
      NODE_ENV: "development",
      FLEET_MONGODB_URI: "mongodb://production.example/fleet",
    }),
  );
});

test(
  "Fleet requires password replacement, real 2FA and recovery acknowledgment",
  { timeout: 90000 },
  async (t) => {
    const mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri("fleet_auth_tests");
    const connection = await MongoClient.connect(uri);
    t.after(async () => {
      await connection.close();
      await mongo.stop();
    });
    const db = connection.db();
    const { id, companyEmail } = await createDevelopmentAccount(db);
    const accounts = db.collection("fleetapplications");
    const initialPassword = "qwerty";
    const initialHash = await bcrypt.hash(initialPassword, 12);
    await accounts.updateOne({ _id: id }, { $set: { password: initialHash } });
    const origin = await startApp(t, uri);
    const browser = client(origin);
    const email = companyEmail;
    const newPassword =
      "  🧭 café lantern 🐙 otoño basket 🎨 café orchard 🌱 mellow river 🐋 ";
    assert.equal(Array.from(newPassword).length, 64);
    assert.ok(Buffer.byteLength(newPassword) > 72);
    const change = { newPassword, confirmPassword: newPassword };

    await assertRedirect(browser, "/login");
    assert.equal(
      (
        await browser.request(
          api + "login",
          { email, password: initialPassword },
          "https://other.example",
        )
      ).status,
      403,
    );
    await requestState(browser, "change-password", change, 401);
    const initial = await requestState(browser, "login", {
      email,
      password: initialPassword,
      keepSignedIn: true,
    });
    assert.equal(initial.body.status, "PASSWORD_CHANGE_REQUIRED");
    assert.match(initial.headers.get("set-cookie"), /HttpOnly/i);
    assert.match(initial.headers.get("set-cookie"), /SameSite=Lax/i);
    assert.doesNotMatch(initial.headers.get("set-cookie"), /Expires=/i);
    const initialCookie = browser.sessionCookie();
    await assertRedirect(browser, "/change-password");
    await requestState(browser, "two-factor/setup", {}, 409);
    await requestState(
      browser,
      "account-password",
      { currentPassword: initialPassword, ...change },
      409,
    );
    const weakPasswords = [
      ["Zq!8mX#3tV+5Na", /at least 15 characters/i],
      ["qwerty123456789!", /common passwords/i],
      ["P@ssw0rd1234567!", /common/i],
      ["Admin123Admin123", /repeated|common/i],
      ["abcdEFghijklmnOP", /sequence/i],
      ["!!!!!!!!!!!!!!!", /repeat/i],
      ["FleetQARepresentative2026!", /name, company, or email/i],
      ["x".repeat(129), /at most 128 characters/i],
    ];
    for (const [password, advice] of weakPasswords) {
      const { body } = await requestState(
        browser,
        "change-password",
        { newPassword: password, confirmPassword: password },
        400,
      );
      assert.equal(body.error.code, "INVALID_INPUT");
      assert.match(body.error.message, advice);
    }
    const beforeChange = await accounts.findOne({ _id: id });
    assert.equal(beforeChange.password, initialHash);
    assert.equal(beforeChange.mustChangePassword, true);

    const changed = await requestState(browser, "change-password", change);
    assert.equal(changed.body.status, "TWO_FACTOR_SETUP_REQUIRED");
    assert.equal(changed.body.passwordChanged, true);
    assert.match(changed.body.setupAttemptId, /^[a-f\d]{64}$/);
    assert.notEqual(browser.sessionCookie(), initialCookie);
    assert.equal(
      (await db.collection("fleetapplications").findOne({ _id: id }))
        .mustChangePassword,
      false,
    );
    await assertRedirect(browser, "/two-factor/setup");

    const setupState = (await requestState(browser, "state")).body;
    assert.equal(setupState.setupAttemptId, changed.body.setupAttemptId);
    assert.equal(setupState.passwordChanged, undefined);

    const freshSignIn = (
      await requestState(client(origin), "login", {
        email,
        password: newPassword,
        keepSignedIn: false,
      })
    ).body;
    assert.equal(freshSignIn.status, "TWO_FACTOR_SETUP_REQUIRED");
    assert.notEqual(freshSignIn.setupAttemptId, changed.body.setupAttemptId);
    assert.equal(freshSignIn.passwordChanged, undefined);

    const setup = (await requestState(browser, "two-factor/setup", {})).body;
    const resumedSetup = (await requestState(browser, "two-factor/setup", {}))
      .body;
    assert.equal(setup.manualKey, resumedSetup.manualKey);
    assert.equal(setup.state.setupAttemptId, changed.body.setupAttemptId);
    assert.equal(
      resumedSetup.state.setupAttemptId,
      changed.body.setupAttemptId,
    );
    const authenticator = URI.parse(setup.provisioningUri);
    assert.ok(authenticator instanceof TOTP);
    assert.equal(authenticator.secret.base32, setup.manualKey);
    const code = authenticator.generate({ timestamp: Date.now() - 30_000 });
    const enrolled = (
      await requestState(browser, "two-factor/confirm", { code })
    ).body;
    assert.equal(enrolled.status, "RECOVERY_CODES_REQUIRED");
    assert.equal(enrolled.recoveryCodes.length, 8);
    await assertRedirect(browser, "/two-factor/recovery-codes");

    const complete = await requestState(
      browser,
      "recovery-codes/acknowledge",
      {},
    );
    assert.equal(complete.body.status, "AUTHENTICATED");
    assert.equal(complete.body.sessionMode, "seven_days");
    assert.match(complete.headers.get("set-cookie"), /Expires=/i);
    const dashboard = await browser.request("/operations/overview");
    assert.match(await dashboard.text(), /fleet-dashboard/);

    const revoked = browser.sessionCookie();
    await requestState(browser, "logout", {});
    const stale = await fetch(origin + "/api/fleet/auth/state", {
      headers: { Cookie: revoked },
    });
    assert.equal((await stale.json()).status, "SIGNED_OUT");
    await requestState(
      browser,
      "login",
      { email, password: initialPassword, keepSignedIn: false },
      401,
    );
    const differentEnding = newPassword.slice(0, -1) + "!";
    assert.ok(Buffer.byteLength(newPassword.slice(0, -1)) > 72);
    await requestState(
      browser,
      "login",
      { email, password: differentEnding, keepSignedIn: false },
      401,
    );

    const returning = (
      await requestState(browser, "login", {
        email,
        password: newPassword.normalize("NFD"),
        keepSignedIn: false,
      })
    ).body;
    assert.equal(returning.status, "TWO_FACTOR_REQUIRED");
    await assertRedirect(browser, "/two-factor/verify");
    await requestState(browser, "two-factor/verify", { code }, 401);
    const current = authenticator.generate();
    assert.equal(
      (await requestState(browser, "two-factor/verify", { code: current })).body
        .status,
      "AUTHENTICATED",
    );
    const authenticatedCookie = browser.sessionCookie();
    const emailPassword = email + "2026!";
    const weakUpdate = await requestState(
      browser,
      "account-password",
      {
        currentPassword: newPassword,
        newPassword: emailPassword,
        confirmPassword: emailPassword,
      },
      400,
    );
    assert.equal(weakUpdate.body.error.code, "INVALID_INPUT");
    assert.match(weakUpdate.body.error.message, /name, company, or email/i);
    assert.equal(browser.sessionCookie(), authenticatedCookie);

    const anotherPassword = "m+UP89t,N;#xJ2s";
    assert.equal(anotherPassword.length, 15);
    const updated = await requestState(browser, "account-password", {
      currentPassword: newPassword,
      newPassword: anotherPassword,
      confirmPassword: anotherPassword,
    });
    assert.equal(updated.body.status, "SIGNED_OUT");
    const previousSession = await fetch(origin + "/api/fleet/auth/state", {
      headers: { Cookie: authenticatedCookie },
    });
    assert.equal((await previousSession.json()).status, "SIGNED_OUT");
    await requestState(
      browser,
      "login",
      { email, password: newPassword, keepSignedIn: false },
      401,
    );
    await requestState(browser, "login", {
      email,
      password: anotherPassword,
      keepSignedIn: false,
    });
    const recoveryCode = enrolled.recoveryCodes[0];
    assert.equal(
      (
        await requestState(browser, "two-factor/recovery", {
          code: recoveryCode,
        })
      ).body.status,
      "AUTHENTICATED",
    );
    await requestState(browser, "logout", {});
    await requestState(browser, "login", {
      email,
      password: anotherPassword,
      keepSignedIn: false,
    });
    await requestState(
      browser,
      "two-factor/recovery",
      { code: recoveryCode },
      401,
    );

    const stored = await accounts.findOne({ _id: id });
    assert.match(stored.password, /^scrypt-v1\$/);
    assert.equal(Object.hasOwn(stored, "confirmPassword"), false);
    const profile = await db
      .collection("fleetwebauthenticators")
      .findOne({ _id: id });
    assert.notEqual(profile.secret, setup.manualKey);
    assert.equal(Object.hasOwn(profile, "pendingRecovery"), false);
    assert.ok(!profile.recoveryHashes.includes(recoveryCode));
  },
);
