import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { TwoFactorVerifyStep } from "@/components/auth/TwoFactorVerify";
export const metadata: Metadata = { title: "Verify sign-in | FastMet Fleet" };
export default function Page() {
  return (
    <AuthShell>
      <TwoFactorVerifyStep />
    </AuthShell>
  );
}
