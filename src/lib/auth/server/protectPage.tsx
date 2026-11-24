import "server-only";
import { Suspense, type ComponentType, type ReactNode } from "react";
import { requireFleetCompany } from "./dal";

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
