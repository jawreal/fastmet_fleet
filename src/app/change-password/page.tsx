import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ChangePasswordStep } from "@/components/auth/ChangePasswordForm";
export const metadata: Metadata = { title: "Change password | FastMet Fleet" };
export default function Page() {
  return (
    <AuthShell>
      <ChangePasswordStep />
    </AuthShell>
  );
}
