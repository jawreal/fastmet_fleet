import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { TwoFactorSetupStep } from "@/components/auth/TwoFactorSetup";
import { ChallengeOnly } from "@/lib/auth/server/protectPage";
export const metadata: Metadata = {
  title: "Set up authenticator | FastMet Fleet",
};
export default function Page() {
  return (
    <ChallengeOnly expected="TWO_FACTOR_SETUP_REQUIRED">
      <AuthShell>
        <TwoFactorSetupStep />
      </AuthShell>
    </ChallengeOnly>
  );
}
