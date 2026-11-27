import "server-only";
import { Redis } from "ioredis";
import { AuthError } from "../types";
import { digest } from "./crypto";

const keyPrefix = "fastmet:fleet:auth:rate-limit:" + process.env.NODE_ENV + ":";
const increment = `
  if redis.call("SET", KEYS[1], "1", "PX", ARGV[1], "NX") then
    return 1
  end
  return redis.call("INCR", KEYS[1])
`;

let connection: Redis | undefined;

function rateLimitRedis() {
  if (connection && connection.status !== "end") return connection;

  const host = process.env.REDIS_HOST?.trim();
  const port = Number(process.env.REDIS_PORT);
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Fleet Redis configuration is missing or invalid.");
  }

  connection = new Redis({
    host,
    port,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true" ? { servername: host } : undefined,
    lazyConnect: true,
    enableReadyCheck: false,
    connectTimeout: 2000,
    commandTimeout: 2000,
    socketTimeout: 4000,
    retryStrategy: () => null,
  });
  return connection;
}

export async function throttle(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const expiresAt = (Math.floor(now / windowMs) + 1) * windowMs;
  const redisKey = keyPrefix + digest(key + ":" + expiresAt);
  // The key selects the fixed window. Only its first increment sets the TTL.
  let count: unknown;
  try {
    count = await rateLimitRedis().eval(
      increment,
      1,
      redisKey,
      expiresAt - now,
    );
  } catch {
    // Fail closed so a Redis outage cannot disable sign-in throttling.
    throw new AuthError(
      "UNAVAILABLE",
      "Sign-in protection is temporarily unavailable. Please try again.",
    );
  }
  if (typeof count !== "number" || count > limit) {
    throw new AuthError(
      "RATE_LIMITED",
      "Too many attempts. Please try again later.",
    );
  }
}
