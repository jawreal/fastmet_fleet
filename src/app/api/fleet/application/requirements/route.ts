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

export async function GET(request: NextRequest) {
  const headers = {
    ...noStore,
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
  };
  const { searchParams } = request.nextUrl;
  const field = requirementFields.find(
    (name) => name === searchParams.get("field"),
  );
  const revisionParam = searchParams.get("revision") ?? "";
  const revision = Number(revisionParam);
  if (
    !field ||
    !/^[1-9]\d*$/.test(revisionParam) ||
    !Number.isSafeInteger(revision)
  ) {
    return new NextResponse(null, { status: 404, headers });
  }

  try {
    const context = await readFleetSession();
    if (context?.session.status !== "AUTHENTICATED") {
      return new NextResponse(null, { status: 401, headers });
    }
    if (
      context.account.status !== "needs_update" &&
      context.account.status !== "under_review"
    ) {
      return new NextResponse(null, { status: 403, headers });
    }

    const response = await fetchFleetRequirements(
      `/me/documents/${field}?revision=${revision}`,
      {
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(35_000)]),
      },
    );
    if ([401, 403, 404].includes(response.status)) {
      return new NextResponse(null, { status: response.status, headers });
    }
    const contentType = response.headers.get("Content-Type");
    if (
      response.ok &&
      response.body &&
      (contentType === "image/png" || contentType === "image/jpeg")
    ) {
      return new NextResponse(response.body, {
        headers: { ...headers, "Content-Type": contentType },
      });
    }
  } catch {
    // Storage and backend failures are reported without exposing private URLs.
  }
  return new NextResponse(null, { status: 503, headers });
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
