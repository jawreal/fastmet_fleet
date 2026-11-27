import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import bcrypt from "bcryptjs";
import { Redis } from "ioredis";
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

async function startRedis(t) {
  const port = await freePort();
  const password = randomBytes(24).toString("hex");
  const child = spawn(
    "redis-server",
    [
      "--bind",
      "127.0.0.1",
      "--port",
      String(port),
      "--requirepass",
      password,
      "--save",
      "",
      "--appendonly",
      "no",
    ],
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  const exited = once(child, "close").catch(() => {});
  const ready = new Promise((resolve, reject) => {
    child.once("error", (error) =>
      reject(
        new Error("Fleet auth tests require redis-server on PATH.", {
          cause: error,
        }),
      ),
    );
    child.once("exit", () =>
      reject(new Error("The Fleet test Redis server exited.")),
    );
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.includes("Ready to accept connections")) resolve();
    });
  });
  const client = new Redis({
    host: "127.0.0.1",
    port,
    password,
    lazyConnect: true,
    retryStrategy: () => null,
  });
  async function stop() {
    client.disconnect();
    child.kill();
    await exited;
  }
  t.after(stop);
  await Promise.race([
    ready,
    delay(5000, null, { ref: false }).then(() => {
      throw new Error("The Fleet test Redis server did not start.");
    }),
  ]);
  return { port, password, client, stop };
}

async function startApp(t, uri, redis, backendUrl) {
  const port = await freePort();
  const origin = "http://127.0.0.1:" + port;
  const siteverifyMock = new URL(
    "./fixtures/turnstile-siteverify.mjs",
    import.meta.url,
  );
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
        NODE_OPTIONS: (
          (process.env.NODE_OPTIONS ?? "") +
          " --import=" +
          siteverifyMock.href
        ).trim(),
        NEXT_TELEMETRY_DISABLED: "1",
        FLEET_MONGODB_URI: uri,
        FLEET_AUTH_ORIGIN: origin,
        FLEET_BACKEND_URL: backendUrl,
        FLEET_AUTH_ENCRYPTION_KEY: randomBytes(32).toString("hex"),
        REDIS_HOST: "127.0.0.1",
        REDIS_PORT: String(redis.port),
        REDIS_PASSWORD: redis.password,
        REDIS_TLS: "false",
        FLEET_TURNSTILE_SECRET_KEY: "mock-siteverify-secret",
        FLEET_TURNSTILE_HOSTNAME: "127.0.0.1",
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

async function startRequirementsFixture(t, db) {
  const submissions = [];
  const logo = await readFile(new URL("../public/icon.png", import.meta.url));
  const server = createHttpServer(async (request, response) => {
    try {
      const token = request.headers.authorization?.split(" ")[1] ?? "";
      const session = await db.collection("fleetwebsessions").findOne({
        _id: createHash("sha256").update(token).digest("hex"),
        status: "AUTHENTICATED",
      });
      const application = await db
        .collection("fleetapplications")
        .findOne({ _id: session?.accountId });
      if (!session || !application) {
        response.writeHead(401).end();
        return;
      }

      if (
        request.url === "/api/fleet/applications/me/documents/logo?revision=1"
      ) {
        response.writeHead(200, { "Content-Type": "image/png" }).end(logo);
        return;
      }

      if (
        request.url === "/api/fleet/applications/me/resubmit" &&
        request.method === "POST"
      ) {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        submissions.push({
          body: Buffer.concat(chunks).toString(),
          contentType: request.headers["content-type"],
        });
        await db
          .collection("fleetapplications")
          .updateOne(
            { _id: application._id },
            { $set: { status: "under_review" } },
          );
        response
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify({ status: "under_review" }));
        return;
      }

      const status = application.status;
      response.writeHead(200, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          companyName: application.companyName,
          status,
          round: status === "under_review" ? 2 : 1,
          documents: [
            {
              field: "repGovernmentId",
              originalName: "id.pdf",
              revision: status === "under_review" ? 2 : 1,
              status: status === "under_review" ? "pending" : "needs_update",
              reason:
                status === "needs_update"
                  ? "Upload a current government ID."
                  : undefined,
            },
            {
              field: "logo",
              originalName: "icon.png",
              revision: 1,
              status: "approved",
              canPreview: true,
            },
          ],
        }),
      );
    } catch {
      response.writeHead(500).end();
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return {
    url: "http://127.0.0.1:" + server.address().port,
    submissions,
    logo,
  };
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
        options.body = body instanceof FormData ? body : JSON.stringify(body);
        headers.Origin = requestOrigin;
        if (!(body instanceof FormData))
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
const dashboardMarkup = /class="[^"]*\bfleet-dashboard\b[^"]*"/;
const landingMarkup = /class="fleet-landing"/;
const loginMarkup = /id="auth-content"/;
async function requestState(browser, action, input, status = 200) {
  const body =
    action === "login"
      ? { turnstileToken: randomBytes(24).toString("hex"), ...input }
      : input;
  const response = await browser.request(api + action, body);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.status, status);
  return { body: await response.json(), headers: response.headers };
}

async function assertRedirect(
  browser,
  destination,
  path = "/operations/overview",
  blockedMarkup = dashboardMarkup,
) {
  const result = await browser.request(path);
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
  assert.doesNotMatch(
    html,
    blockedMarkup,
    "Unexpected page content at " + path,
  );
}

async function assertGuestPageRedirects(browser, destination) {
  await assertRedirect(browser, destination, "/", landingMarkup);
  await assertRedirect(browser, destination, "/login", loginMarkup);
}

async function assertTurnstileProtection(origin, db, redis) {
  const account = await createDevelopmentAccount(db);
  const credentials = {
    email: account.companyEmail,
    password: account.initialPassword,
    keepSignedIn: false,
  };
  const browser = client(origin);
  for (const [token, message] of [
    [undefined, /complete the security verification/i],
    ["invalid-token", /security verification failed/i],
    ["wrong-host", /security verification failed/i],
    ["wrong-action", /security verification failed/i],
    ["consumed-token", /expired or was already used/i],
    ["stale-token", /expired or was already used/i],
  ]) {
    const { body } = await requestState(
      browser,
      "login",
      { ...credentials, turnstileToken: token },
      400,
    );
    assert.match(body.error.message, message);
    assert.equal(browser.sessionCookie(), "");
  }
  for (const token of ["service-unavailable", "siteverify-timeout"]) {
    const failure = await requestState(
      browser,
      "login",
      { ...credentials, turnstileToken: token },
      503,
    );
    assert.equal(failure.body.error.code, "UNAVAILABLE");
    assert.equal(browser.sessionCookie(), "");
  }

  const sharedToken = randomBytes(24).toString("hex");
  const request = { ...credentials, turnstileToken: sharedToken };
  const responses = await Promise.all(
    [client(origin), client(origin)].map((connection) =>
      connection.request(api + "login", request),
    ),
  );
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [200, 400],
  );
  const hash = createHash("sha256").update(sharedToken).digest("hex");
  const uses = db.collection("fleetwebturnstileuses");
  assert.ok(await uses.findOne({ _id: hash }));
  assert.equal(await uses.findOne({ _id: sharedToken }), null);

  const limitedCredentials = {
    ...credentials,
    email: "rate-limit-test@example.com",
  };
  const windowMs = 15 * 60_000;
  const windowEnd = (Math.floor(Date.now() / windowMs) + 1) * windowMs;
  const rateKey =
    "fastmet:fleet:auth:rate-limit:development:" +
    createHash("sha256")
      .update("login:" + limitedCredentials.email + ":" + windowEnd)
      .digest("hex");
  const limitedInput = {
    ...limitedCredentials,
    turnstileToken: "invalid-token",
  };
  await requestState(browser, "login", limitedInput, 400);
  const initialTtl = await redis.pttl(rateKey);
  assert.ok(initialTtl > 0 && initialTtl <= windowMs);
  await Promise.all(
    Array.from({ length: 9 }, () =>
      requestState(browser, "login", limitedInput, 400),
    ),
  );
  const limited = await requestState(
    browser,
    "login",
    { ...limitedCredentials, turnstileToken: "service-unavailable" },
    429,
  );
  assert.equal(limited.body.error.code, "RATE_LIMITED");
  assert.equal(await redis.get(rateKey), "11");
  assert.ok((await redis.pttl(rateKey)) <= initialTtl);
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
    await accounts.updateOne(
      { _id: id },
      {
        $set: { password: initialHash, status: "needs_update", accountId: id },
      },
    );
    const redis = await startRedis(t);
    const backend = await startRequirementsFixture(t, db);
    const origin = await startApp(t, uri, redis, backend.url);
    await t.test(
      "Turnstile verifies sign-ins, prevents replay, and runs after rate limiting",
      () => assertTurnstileProtection(origin, db, redis.client),
    );
    const browser = client(origin);
    const logoPath =
      "/api/fleet/application/requirements?field=logo&revision=1";
    assert.equal((await browser.request(logoPath)).status, 401);
    const email = companyEmail;
    const newPassword =
      "  🧭 café lantern 🐙 otoño basket 🎨 café orchard 🌱 mellow river 🐋 ";
    assert.equal(Array.from(newPassword).length, 64);
    assert.ok(Buffer.byteLength(newPassword) > 72);
    const change = { newPassword, confirmPassword: newPassword };

    assert.match(await (await browser.request("/")).text(), landingMarkup);
    assert.match(await (await browser.request("/login")).text(), loginMarkup);
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
    assert.equal((await browser.request(logoPath)).status, 401);
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
    assert.equal(complete.body.destination, "/application/requirements");
    await assertGuestPageRedirects(browser, "/application/requirements");
    const logo = await browser.request(logoPath);
    assert.equal(logo.status, 200);
    assert.equal(logo.headers.get("content-type"), "image/png");
    assert.equal(logo.headers.get("cache-control"), "no-store");
    assert.equal(
      logo.headers.get("cross-origin-resource-policy"),
      "same-origin",
    );
    assert.deepEqual(Buffer.from(await logo.arrayBuffer()), backend.logo);
    await assertRedirect(browser, "/application/requirements");
    const blockedUpload = await browser.request(
      "/api/fleet/application/requirements",
      {},
    );
    assert.equal(blockedUpload.status, 400);
    const requirements = await browser.request("/application/requirements");
    const html = await requirements.text();
    assert.match(html, /Upload a current government ID/);
    assert.match(
      html,
      /<a\b[^>]*aria-label="FastMet Fleet application requirements"[^>]*href="\/application\/requirements"/,
    );
    assert.doesNotMatch(html, dashboardMarkup);
    const replacement = new FormData();
    replacement.set("round", "1");
    replacement.set("revisions", '{"repGovernmentId":1}');
    replacement.set(
      "repGovernmentId",
      new File(["%PDF-1.7\n%%EOF"], "new-id.pdf", { type: "application/pdf" }),
    );
    const upload = await browser.request(
      "/api/fleet/application/requirements",
      replacement,
    );
    assert.equal(upload.status, 200);
    assert.match(
      backend.submissions[0]?.contentType,
      /^multipart\/form-data; boundary=/,
    );
    assert.match(backend.submissions[0]?.body, /new-id\.pdf/);
    const waiting = await requestState(browser, "state");
    assert.equal(waiting.body.destination, "/application/requirements");
    assert.equal(
      (await browser.request("/api/fleet/application/requirements", {})).status,
      403,
    );
    await accounts.updateOne({ _id: id }, { $set: { status: "needs_update" } });

    const revoked = browser.sessionCookie();
    await requestState(browser, "logout", {});
    assert.match(await (await browser.request("/login")).text(), loginMarkup);
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
    assert.equal(
      (await requestState(browser, "state")).body.destination,
      "/application/requirements",
    );
    await assertRedirect(browser, "/application/requirements");
    await accounts.updateOne({ _id: id }, { $set: { status: "approved" } });
    assert.equal(
      (await requestState(browser, "state")).body.destination,
      "/operations/overview",
    );
    await assertGuestPageRedirects(browser, "/operations/overview");
    const dashboard = await browser.request("/operations/overview");
    assert.ok(
      dashboardMarkup.test(await dashboard.text()),
      "Expected rendered dashboard markup.",
    );
    // Approved credentials created before account linking remain eligible.
    await accounts.updateOne({ _id: id }, { $unset: { accountId: "" } });
    assert.equal(
      (await requestState(browser, "state")).body.destination,
      "/operations/overview",
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
    const replayBrowser = client(origin);
    await requestState(replayBrowser, "login", {
      email,
      password: anotherPassword,
      keepSignedIn: false,
    });
    await requestState(
      replayBrowser,
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
    const rejectionReason =
      "The business permit did not match the registered company.";
    await accounts.updateOne(
      { _id: id },
      { $set: { status: "rejected", rejectionReason } },
    );
    assert.equal(
      (await requestState(replayBrowser, "state")).body.status,
      "SIGNED_OUT",
    );
    await assertRedirect(
      replayBrowser,
      "/login",
      "/two-factor/verify",
      loginMarkup,
    );
    const staleRecovery = await requestState(
      replayBrowser,
      "two-factor/recovery",
      { code: enrolled.recoveryCodes[1] },
      401,
    );
    assert.equal(staleRecovery.body.error.code, "CHALLENGE_EXPIRED");
    assert.equal(
      (await requestState(browser, "state")).body.destination,
      "/application/requirements",
    );
    await assertRedirect(browser, "/application/requirements");
    assert.equal((await browser.request(logoPath)).status, 403);
    assert.equal(
      (await browser.request("/api/fleet/application/requirements", {})).status,
      403,
    );
    const decisionHtml = await (
      await browser.request("/application/requirements")
    ).text();
    assert.ok(decisionHtml.includes(rejectionReason));
    assert.match(decisionHtml, /href="mailto:support@fastmet\.com\.ph"/);
    assert.doesNotMatch(decisionHtml, /Upload a current government ID/);

    await requestState(browser, "logout", {});
    const expiredDecision = await browser.request("/application/requirements");
    assert.ok(!(await expiredDecision.text()).includes(rejectionReason));

    await t.test(
      "rejection blocks new and pending onboarding sessions",
      async () => {
        const fixture = await createDevelopmentAccount(db);
        const login = {
          email: fixture.companyEmail,
          password: fixture.initialPassword,
          keepSignedIn: true,
        };
        const rejectedBrowser = client(origin);
        const beforeRejection = await requestState(
          rejectedBrowser,
          "login",
          login,
        );
        assert.equal(beforeRejection.body.status, "PASSWORD_CHANGE_REQUIRED");
        await accounts.updateOne(
          { _id: fixture.id },
          { $set: { status: "rejected", rejectionReason } },
        );

        const checkPages = async () => {
          for (const path of [
            "/change-password",
            "/two-factor/setup",
            "/two-factor/verify",
            "/two-factor/recovery-codes",
          ]) {
            await assertRedirect(rejectedBrowser, "/login", path, loginMarkup);
          }
        };
        assert.equal(
          (await requestState(rejectedBrowser, "state")).body.status,
          "SIGNED_OUT",
        );
        await checkPages();
        for (const [action, input] of [
          ["change-password", change],
          ["two-factor/setup", {}],
          ["two-factor/confirm", { code: "123456" }],
          ["two-factor/verify", { code: "123456" }],
          ["two-factor/recovery", { code: enrolled.recoveryCodes[1] }],
          ["recovery-codes/acknowledge", {}],
        ]) {
          const { body } = await requestState(
            rejectedBrowser,
            action,
            input,
            401,
          );
          assert.equal(body.error.code, "CHALLENGE_EXPIRED");
        }
        const wrong = await requestState(
          rejectedBrowser,
          "login",
          { ...login, password: "incorrect-password" },
          401,
        );
        assert.equal(wrong.body.error.code, "INVALID_CREDENTIALS");
        assert.equal(wrong.body.error.rejectionReason, undefined);

        for (let attempt = 0; attempt < 2; attempt += 1) {
          const rejected = await requestState(
            rejectedBrowser,
            "login",
            login,
            403,
          );
          assert.equal(rejected.body.error.code, "APPLICATION_REJECTED");
          assert.equal(rejected.body.error.rejectionReason, rejectionReason);
          assert.match(rejected.headers.get("set-cookie"), /Max-Age=0/);
          assert.equal(
            (await requestState(rejectedBrowser, "state")).body.status,
            "SIGNED_OUT",
          );
          assert.match(
            await (await rejectedBrowser.request("/login")).text(),
            loginMarkup,
          );
        }
        await checkPages();
      },
    );

    await t.test(
      "Fleet sign-in fails closed while Redis is unavailable",
      async () => {
        await redis.stop();
        const result = await requestState(
          client(origin),
          "login",
          {
            email,
            password: anotherPassword,
            keepSignedIn: false,
            turnstileToken: "invalid-token",
          },
          503,
        );
        assert.equal(result.body.error.code, "UNAVAILABLE");
        assert.match(result.body.error.message, /sign-in protection/i);
      },
    );
  },
);
