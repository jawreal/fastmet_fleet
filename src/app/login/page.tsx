import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginStep } from "@/components/auth/LoginStep";
import { GuestOnly } from "@/lib/auth/server/protectPage";
export const metadata: Metadata = { title: "Sign in | FastMet Fleet" };
export default function LoginPage() {
  return (
    <GuestOnly>
      <AuthShell>
        <LoginStep />
      </AuthShell>
    </GuestOnly>
  );
}
