import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RecoveryCodesStep } from "@/components/auth/RecoveryCodes";
import { ChallengeOnly } from "@/lib/auth/server/protectPage";
export const metadata: Metadata = {
  title: "Save recovery codes | FastMet Fleet",
};
export default function Page() {
  return (
    <ChallengeOnly expected="RECOVERY_CODES_REQUIRED">
      <AuthShell>
        <RecoveryCodesStep />
      </AuthShell>
    </ChallengeOnly>
  );
}
