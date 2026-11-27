import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { TwoFactorVerifyStep } from "@/components/auth/TwoFactorVerify";
import { ChallengeOnly } from "@/lib/auth/server/protectPage";
export const metadata: Metadata = { title: "Verify sign-in | FastMet Fleet" };
export default function Page() {
  return (
    <ChallengeOnly expected="TWO_FACTOR_REQUIRED">
      <AuthShell>
        <TwoFactorVerifyStep />
      </AuthShell>
    </ChallengeOnly>
  );
}
