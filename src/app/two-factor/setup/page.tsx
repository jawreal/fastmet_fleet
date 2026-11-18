import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { TwoFactorSetupStep } from "@/components/auth/TwoFactorSetup";
export const metadata: Metadata = {
  title: "Set up authenticator | FastMet Fleet",
};
export default function Page() {
  return (
    <AuthShell>
      <TwoFactorSetupStep />
    </AuthShell>
  );
}
