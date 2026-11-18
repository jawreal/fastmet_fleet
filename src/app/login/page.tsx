import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginStep } from "@/components/auth/LoginStep";
export const metadata: Metadata = { title: "Sign in | FastMet Fleet" };
export default function LoginPage() {
  return (
    <AuthShell>
      <LoginStep />
    </AuthShell>
  );
}
