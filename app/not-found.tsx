"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-6 py-16 text-foreground">
      <section
        aria-labelledby="not-found-title"
        className="w-full max-w-136 relative"
      >
        <div aria-hidden="true" className="mb-9 flex gap-x-3 items-center">
          <Image src="/icon.png" alt="FastMet icon" width={33} height={33} />
          <div>
            <span className="text-base font-semibold">FastMet</span>
            <p className="text-muted-foreground uppercase text-xs font-mono">
              fleet management
            </p>
          </div>
        </div>

        <h1
          id="not-found-title"
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Page not found
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          The page you’re looking for doesn’t exist, or you don’t have access to
          it.
        </p>
        <Button
          type="button"
          onClick={goBack}
          className="mt-9 inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          Go back
        </Button>
        <p className="mt-8 border-t pt-6 text-sm leading-relaxed text-muted-foreground">
          If you think this is a mistake, contact your administrator.
        </p>
      </section>
    </main>
  );
}
