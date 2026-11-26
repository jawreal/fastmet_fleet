import { type NextRequest, NextResponse } from "next/server";
import { fetchFleetRequirements } from "@/lib/application/backend";
import {
  maxRequirementBytes,
  requirementFields,
} from "@/lib/application/requirements";
import { readFleetSession } from "@/lib/auth/server/dal";

// Include room for multipart boundaries and review metadata on top of the files.
const maxBodyBytes = requirementFields.length * maxRequirementBytes + 64 * 1024;
const noStore = { "Cache-Control": "no-store" };

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: noStore });
}

export async function POST(request: NextRequest) {
  const origin = process.env.FLEET_AUTH_ORIGIN ?? request.nextUrl.origin;
  if (request.headers.get("origin") !== origin)
    return error("This request origin is not allowed.", 403);

  const context = await readFleetSession();
  const isAuthenticated = context?.session.status === "AUTHENTICATED";

  if (!isAuthenticated) {
    return error("Sign in to continue.", 401);
  }

  if (context.account.status !== "needs_update")
    return error("The application is unavailable for resubmission.", 403);

  const contentType = request.headers.get("Content-Type");
  if (
    !request.body ||
    !contentType?.toLowerCase().startsWith("multipart/form-data;")
  ) {
    return error("Choose replacement files to submit.", 400);
  }
  if (Number(request.headers.get("Content-Length")) > maxBodyBytes)
    return error("The upload exceeds the size limit.", 413);
  // Count bytes as they arrive so uploads without Content-Length have the same cap.
  let bytes = 0;
  let tooLarge = false;
  const body = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        if (bytes > maxBodyBytes) {
          tooLarge = true;
          controller.error(new Error("Upload too large."));
          return;
        }
        controller.enqueue(chunk);
      },
    }),
  );

  try {
    // Stream the original body with its multipart boundary and cancel it if the client disconnects.
    const response = await fetchFleetRequirements("/me/resubmit", {
      method: "POST",
      body,
      duplex: "half",
      headers: { "Content-Type": contentType },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(120_000)]),
    });
    if (!response.headers.get("Content-Type")?.startsWith("application/json")) {
      return error(
        "Unable to submit your replacements. Please try again.",
        503,
      );
    }
    return new NextResponse(response.body, {
      status: response.status,
      headers: { ...noStore, "Content-Type": "application/json" },
    });
  } catch {
    if (tooLarge) return error("The upload exceeds the size limit.", 413);
    // The backend may have saved the upload before the response was lost.
    return error(
      "Unable to confirm your submission. Refresh the application to check its status.",
      503,
    );
  }
}
