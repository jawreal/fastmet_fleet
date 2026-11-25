import assert from "node:assert/strict";

const fetchFromNetwork = globalThis.fetch;
const siteverify = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

globalThis.fetch = async (input, options) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url !== siteverify) return fetchFromNetwork(input, options);

  assert.equal(options.method, "POST");
  assert.ok(options.body instanceof URLSearchParams);
  assert.equal(options.body.get("secret"), "mock-siteverify-secret");
  const token = options.body.get("response");
  if (token === "service-unavailable")
    return new Response(null, { status: 503 });
  if (token === "siteverify-timeout")
    throw new DOMException("Timed out", "TimeoutError");
  if (token === "invalid-token" || token === "consumed-token") {
    return Response.json({
      success: false,
      "error-codes": [
        token === "invalid-token"
          ? "invalid-input-response"
          : "timeout-or-duplicate",
      ],
    });
  }

  return Response.json({
    success: true,
    hostname: token === "wrong-host" ? "other.example" : "127.0.0.1",
    action: token === "wrong-action" ? "other_action" : "fleet_login",
    challenge_ts: new Date(
      Date.now() - (token === "stale-token" ? 300_000 : 0),
    ).toISOString(),
    "error-codes": [],
  });
};
