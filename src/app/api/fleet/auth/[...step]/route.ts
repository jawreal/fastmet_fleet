import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginRequestSchema } from "@/lib/auth/login";
import {
  codeSchema,
  passwordSchema,
  recoverySchema,
  settingsPasswordSchema,
} from "@/lib/auth/schemas";
import { AuthError } from "@/lib/auth/types";
import {
  readFleetSession,
  revokeFleetSession,
  signedOut,
} from "@/lib/auth/server/dal";
import {
  changeAccountPassword,
  changeInitialPassword,
  signIn,
  stateFor,
} from "@/lib/auth/server/flow";
import {
  acknowledgeRecoveryCodes,
  confirmTwoFactorSetup,
  getTwoFactorSetup,
  submitSecondFactor,
} from "@/lib/auth/server/mfa";

const headers = { "Cache-Control": "no-store" };
const errorStatus = {
  INVALID_CODE: 401,
  INVALID_CREDENTIALS: 401,
  APPLICATION_REJECTED: 403,
  CODE_EXPIRED: 410,
  CHALLENGE_EXPIRED: 401,
  STEP_UNAVAILABLE: 409,
  INVALID_INPUT: 400,
  RATE_LIMITED: 429,
  UNAVAILABLE: 503,
} satisfies Record<AuthError["code"], number>;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers });
}

async function handle(operation: () => Promise<unknown>) {
  try {
    return json(await operation());
  } catch (error) {
    if (error instanceof AuthError) {
      return json(
        {
          error: {
            code: error.code,
            message: error.message,
            rejectionReason: error.rejectionReason,
          },
        },
        errorStatus[error.code],
      );
    }
    console.error("Fleet authentication request failed.");
    return json(
      {
        error: {
          code: "UNAVAILABLE",
          message: "Sign-in is temporarily unavailable.",
        },
      },
      503,
    );
  }
}

async function readBody(request: NextRequest) {
  if (
    request.headers.get("content-type")?.split(";")[0] !== "application/json" ||
    !request.body
  ) {
    throw new AuthError("INVALID_INPUT", "Send a JSON request.");
  }
  let size = 0;
  const bounded = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        size += chunk.byteLength;
        if (size > 8192) {
          controller.error(
            new AuthError("INVALID_INPUT", "This request is too large."),
          );
        } else {
          controller.enqueue(chunk);
        }
      },
    }),
  );
  const input = await new Response(bounded).text();
  try {
    return JSON.parse(input) as unknown;
  } catch {
    throw new AuthError("INVALID_INPUT", "Send a valid JSON request.");
  }
}

function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new AuthError(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "Check the submitted fields.",
    );
  }
  return parsed.data;
}

type Params = { params: Promise<{ step: string[] }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { step } = await params;
  if (step.join("/") !== "state")
    return json({ error: { code: "NOT_FOUND" } }, 404);
  return handle(async () => {
    const context = await readFleetSession();
    return context ? stateFor(context.session, context.account) : signedOut;
  });
}

const mutations = {
  login: (input: unknown) => signIn(validate(loginRequestSchema, input)),
  "change-password": (input: unknown) =>
    changeInitialPassword(validate(passwordSchema, input).newPassword),
  "account-password": (input: unknown) => {
    const { currentPassword, newPassword } = validate(
      settingsPasswordSchema,
      input,
    );
    return changeAccountPassword(currentPassword, newPassword);
  },
  "two-factor/setup": () => getTwoFactorSetup(),
  "two-factor/confirm": (input: unknown) =>
    confirmTwoFactorSetup(validate(codeSchema, input).code),
  "two-factor/verify": (input: unknown) =>
    submitSecondFactor(validate(codeSchema, input).code, "totp"),
  "two-factor/recovery": (input: unknown) =>
    submitSecondFactor(validate(recoverySchema, input).code, "recovery"),
  "recovery-codes/acknowledge": () => acknowledgeRecoveryCodes(),
  logout: async () => {
    await revokeFleetSession();
    return signedOut;
  },
} satisfies Record<string, (input: unknown) => Promise<unknown>>;

export async function POST(request: NextRequest, { params }: Params) {
  const origin = process.env.FLEET_AUTH_ORIGIN ?? request.nextUrl.origin;
  if (request.headers.get("origin") !== origin) {
    return json(
      {
        error: {
          code: "INVALID_INPUT",
          message: "This request origin is not allowed.",
        },
      },
      403,
    );
  }
  const path = (await params).step.join("/");
  if (!Object.hasOwn(mutations, path))
    return json({ error: { code: "NOT_FOUND" } }, 404);
  const mutation = mutations[path as keyof typeof mutations];
  return handle(async () => mutation(await readBody(request)));
}
