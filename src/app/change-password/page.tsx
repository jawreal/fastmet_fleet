import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ChangePasswordStep } from "@/components/auth/ChangePasswordForm";
import { ChallengeOnly } from "@/lib/auth/server/protectPage";
export const metadata: Metadata = { title: "Change password | FastMet Fleet" };
export default function Page() {
  return (
    <ChallengeOnly expected="PASSWORD_CHANGE_REQUIRED">
      <AuthShell>
        <ChangePasswordStep />
      </AuthShell>
    </ChallengeOnly>
  );
}
