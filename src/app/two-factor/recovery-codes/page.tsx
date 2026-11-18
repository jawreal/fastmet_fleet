import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RecoveryCodesStep } from "@/components/auth/RecoveryCodes";
export const metadata: Metadata = {
  title: "Save recovery codes | FastMet Fleet",
};
export default function Page() {
  return (
    <AuthShell>
      <RecoveryCodesStep />
    </AuthShell>
  );
}
