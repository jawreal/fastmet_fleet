import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { requireFleetCompany } from "@/lib/auth/server/dal";
import { DashboardShell } from "@/components/DashboardShell";
import { REQUESTS_COOKIE, readRequestsState } from "@/lib/request-ui";

interface ChildrenProps {
  children: ReactNode;
}

// One route-group layout survives navigation across Operations, Fleet, and Business.
export default function DashboardLayout({ children }: Readonly<ChildrenProps>) {
  // Cache Components requires request-time cookie reads inside a Suspense boundary.
  // A blank fallback avoids ever displaying a shell at the wrong saved width.
  return (
    <Suspense fallback={null}>
      <CookieDashboard>{children}</CookieDashboard>
    </Suspense>
  );
}

async function CookieDashboard({ children }: Readonly<ChildrenProps>) {
  // Read both preferences before emitting shell HTML; hydration starts with these values.
  const company = await requireFleetCompany();
  const cookieStore = await cookies();
  return (
    <DashboardShell
      company={company}
      initialRequestsState={readRequestsState(
        cookieStore.get(REQUESTS_COOKIE)?.value,
      )}
      initialLeftOpen={cookieStore.get("sidebar_state")?.value !== "false"}
    >
      {children}
    </DashboardShell>
  );
}
