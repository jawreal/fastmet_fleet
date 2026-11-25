import type { PropsWithChildren } from "react";

// Preserve existing page props while the persistent dashboard owns the surrounding shell.
interface AppShellProps extends PropsWithChildren {
  title?: string;
}

export function AppShell({ children }: Readonly<AppShellProps>) {
  // Pages supply only content: navigation and request state no longer remount with them.
  return (
    <main className="flex flex-1 flex-col p-4 lg:p-6">
      <div className="w-full self-center max-w-5xl">{children}</div>
    </main>
  );
}
