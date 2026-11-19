"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
import { codeSchema, type CodeValues } from "@/lib/auth/schemas";
import type { TwoFactorSetup } from "@/lib/auth/types";
import { AuthStep, type RunAuthAction } from "./AuthStep";
import { StepHeader, useCopy, useFormMessage } from "./FormParts";
import SetupRenderContent from "./SetupRenderContent";

interface ISetupForm {
  run: RunAuthAction;
}

function SetupForm({ run }: Readonly<ISetupForm>) {
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const message = useFormMessage();
  const report = message.report;
  const clipboard = useCopy();

  const form = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  // Generate the QR locally without sending secrets to an external QR service.
  const load = useCallback(async () => {
    let result!: TwoFactorSetup;

    await run(async (adapter) => {
      result = await adapter.getTwoFactorSetup();
      return result.state;
    });

    const image = await QRCode.toDataURL(result.provisioningUri, {
      width: 208,
      margin: 4,
      errorCorrectionLevel: "M",
    });

    return { result, image };
  }, [run]);

  useEffect(() => {
    let active = true;

    load()
      .then(({ result, image }) => {
        if (active) {
          setSetup(result);
          setQr(image);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          report(error);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [load, attempt, report]);

  const busy = form.formState.isSubmitting;

  const handleRetry = () => {
    message.clear();
    setSetup(null);
    setQr("");
    setLoading(true);
    setAttempt((value) => value + 1);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        step="Account setup · 2 of 3"
        title="Set up Google Authenticator"
        description="Add your fleet account to Google Authenticator, then enter a code to confirm it's ready."
      />

      {message.alert}

      <SetupRenderContent
        loading={loading}
        setup={setup}
        qr={qr}
        busy={busy}
        onRetry={handleRetry}
        run={run}
        form={form}
        message={message}
        clipboard={clipboard}
      />
    </div>
  );
}

export function TwoFactorSetupStep() {
  return (
    <AuthStep expected="TWO_FACTOR_SETUP_REQUIRED">
      {(_, run) => <SetupForm run={run} />}
    </AuthStep>
  );
}
