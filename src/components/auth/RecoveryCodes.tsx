"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { AuthStep, type RunAuthAction } from "./AuthStep";
import { StepHeader, SubmitButton, useCopy, useFormMessage } from "./FormParts";
function RecoveryCodes({
  codes,
  run,
}: {
  codes: readonly string[];
  run: RunAuthAction;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const clipboard = useCopy();
  const message = useFormMessage();
  function download() {
    try {
      const url = URL.createObjectURL(
        new Blob(
          [
            `FastMet Fleet recovery codes\nKeep these codes private. Each can be used once.\n\n${codes.join("\n")}\n`,
          ],
          { type: "text/plain" },
        ),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "fastmet-fleet-recovery-codes.txt";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      clipboard.setFeedback("Recovery codes downloaded.");
    } catch {
      message.report(
        new Error("Unable to download. Copy or save the codes manually."),
      );
    }
  }
  return (
    <div className="space-y-6">
      <StepHeader
        step="Account setup · 3 of 3"
        title="Save your recovery codes"
        description="Use these codes to sign in if you lose access to Google Authenticator. Each code can be used once."
      />
      {message.alert}
      <ul
        aria-label="Recovery codes"
        className="grid grid-cols-1 gap-2 rounded-md border bg-muted/30 p-3 min-[360px]:grid-cols-2"
      >
        {codes.map((code) => (
          <li
            key={code}
            className="py-1 text-center font-mono text-xs select-all"
          >
            {code}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void clipboard.copy(codes.join("\n"))}
        >
          Copy codes
        </Button>
        <Button variant="outline" disabled={busy} onClick={download}>
          Download
        </Button>
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {clipboard.feedback}
      </p>
      <p className="text-xs leading-5 text-muted-foreground">
        Store these somewhere private, such as a password manager. Anyone with
        these codes could use them to complete your sign-in.
      </p>
      <form
        aria-busy={busy}
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!saved || busy) return;
          setBusy(true);
          message.clear();
          try {
            await run((adapter) => adapter.acknowledgeRecoveryCodes());
          } catch (error) {
            message.report(error);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field orientation="horizontal" className="gap-2">
          <Checkbox
            id="saved-codes"
            checked={saved}
            onCheckedChange={(checked) => setSaved(checked === true)}
            disabled={busy}
          />
          <FieldLabel htmlFor="saved-codes" className="text-xs font-normal">
            I have saved my recovery codes in a safe place.
          </FieldLabel>
        </Field>
        <SubmitButton busy={busy} disabled={!saved}>
          Continue to overview
        </SubmitButton>
      </form>
    </div>
  );
}
export function RecoveryCodesStep() {
  return (
    <AuthStep expected="RECOVERY_CODES_REQUIRED">
      {(state, run) =>
        state.status === "RECOVERY_CODES_REQUIRED" && (
          <RecoveryCodes codes={state.recoveryCodes} run={run} />
        )
      }
    </AuthStep>
  );
}
