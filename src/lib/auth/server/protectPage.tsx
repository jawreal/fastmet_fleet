import "server-only";
import { redirect } from "next/navigation";
import { Suspense, type ComponentType, type ReactNode } from "react";
import { RefreshGuestPageOnRestore } from "@/components/auth/RefreshGuestPageOnRestore";
import {
  authenticatedState,
  readFleetSession,
  requireFleetCompany,
} from "./dal";

async function AuthorizedPage({ children }: Readonly<{ children: ReactNode }>) {
  await requireFleetCompany();
  return children;
}

export function protectFleetPage(Page: ComponentType) {
  return function ProtectedFleetPage() {
    return (
      <Suspense fallback={null}>
        <AuthorizedPage>
          <Page />
        </AuthorizedPage>
      </Suspense>
    );
  };
}

async function GuestContent({ children }: Readonly<{ children: ReactNode }>) {
  const context = await readFleetSession();
  if (context?.session.status === "AUTHENTICATED") {
    redirect(authenticatedState(context.session, context.account).destination);
  }

  return (
    <>
      <RefreshGuestPageOnRestore />
      {children}
    </>
  );
}

export function GuestOnly({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={null}>
      <GuestContent>{children}</GuestContent>
    </Suspense>
  );
}
