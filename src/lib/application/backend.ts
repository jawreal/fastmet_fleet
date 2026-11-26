import "server-only";
import { readFleetSessionToken } from "@/lib/auth/server/dal";
import { requirementsSchema } from "./requirements";

type UploadRequest = RequestInit & { duplex?: "half" };

export async function fetchFleetRequirements(
  path: "/me" | "/me/resubmit",
  init: UploadRequest = {},
) {
  const origin = process.env.FLEET_BACKEND_URL;
  if (!origin) throw new Error("Fleet backend URL is missing.");
  const url = new URL("/api/fleet/applications" + path, origin);
  if (
    url.protocol !== "https:" &&
    (process.env.NODE_ENV === "production" || url.protocol !== "http:")
  ) {
    throw new Error("Invalid Fleet backend URL.");
  }
  const token = await readFleetSessionToken();
  if (!token) throw new Error("Fleet session is missing.");

  // The backend derives application ownership from the Fleet session.
  const headers = new Headers(init.headers);
  headers.set("Authorization", "Bearer " + token);
  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
    redirect: "error",
    signal: init.signal ?? AbortSignal.timeout(15_000),
  });
}

export async function loadFleetRequirements() {
  try {
    const response = await fetchFleetRequirements("/me");
    if (!response.ok) return null;
    return requirementsSchema.parse(await response.json());
  } catch {
    return null;
  }
}
