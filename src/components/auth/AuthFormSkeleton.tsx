import { Skeleton } from "@/components/ui/skeleton";

interface AuthFormSkeletonProps {
  fields: 0 | 1 | 2;
  preparingSetup?: boolean;
}

export function AuthFormSkeleton({
  fields,
  preparingSetup = false,
}: Readonly<AuthFormSkeletonProps>) {
  return (
    <div className="w-full">
      <p id={preparingSetup ? undefined : "auth-heading"} className="sr-only">
        {preparingSetup
          ? "Preparing your setup code…"
          : "Restoring your sign-in step…"}
      </p>
      <div aria-hidden="true" className="space-y-5">
        {preparingSetup ? (
          <Skeleton className="mx-auto size-52 max-w-full motion-reduce:animate-none" />
        ) : (
          <div className="mb-7 space-y-3">
            <Skeleton className="h-8 w-2/3 motion-reduce:animate-none" />
            <Skeleton className="h-4 w-5/6 motion-reduce:animate-none" />
          </div>
        )}
        {fields === 0 && (
          <Skeleton className="h-32 w-full motion-reduce:animate-none" />
        )}
        {fields >= 1 && <AuthFieldSkeleton />}
        {fields === 2 && <AuthFieldSkeleton />}
        <Skeleton className="h-11 w-full motion-reduce:animate-none" />
      </div>
    </div>
  );
}

function AuthFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24 motion-reduce:animate-none" />
      <Skeleton className="h-11 w-full motion-reduce:animate-none" />
    </div>
  );
}
