"use client";

import { Download, ImageOff, Maximize2, Minus, Plus, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

export const requirementPreviewTile =
  "flex h-55 w-full items-center justify-center overflow-hidden rounded-[12px] border border-border bg-muted/50";

export function FileFallback({ children }: Readonly<{ children: string }>) {
  return (
    <span className="flex flex-col items-center gap-2 px-3 text-center text-xs text-muted-foreground">
      <ImageOff aria-hidden="true" className="size-7" />
      {children}
    </span>
  );
}

function LoadingImage() {
  return (
    <span className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
      <progress className="sr-only" aria-label="Loading image" />
      <span
        className="size-5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span aria-hidden="true">Loading image…</span>
    </span>
  );
}

export function RequirementImage({
  src,
  name,
  details,
  download = false,
}: Readonly<{
  src: string;
  name: string;
  details: string;
  download?: boolean;
}>) {
  const [image, setImage] = useState<{ url: string; width: number } | null>(
    null,
  );
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(100);
  const viewport = useRef<HTMLDivElement>(null);
  const center = useRef<{ x: number; y: number } | null>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;

    async function load() {
      try {
        // Share one download between the thumbnail and viewer. Replacements already have a local URL.
        let url = src;
        if (!src.startsWith("blob:")) {
          const response = await fetch(src, { signal: controller.signal });
          if (!response.ok) throw new Error("Image unavailable");
          const blob = await response.blob();
          if (controller.signal.aborted) return;
          objectUrl = URL.createObjectURL(blob);
          url = objectUrl;
        }

        const preview = new window.Image();
        preview.src = url;
        await preview.decode();
        if (!controller.signal.aborted) {
          setImage({ url, width: preview.naturalWidth });
        }
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }

    void load();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, attempt]);

  useLayoutEffect(() => {
    const element = viewport.current;
    const point = center.current;
    if (!element || !point) return;
    element.scrollTo(
      point.x * element.scrollWidth - element.clientWidth / 2,
      point.y * element.scrollHeight - element.clientHeight / 2,
    );
    center.current = null;
  }, [zoom]);

  function changeZoom(value: number) {
    const next = Math.min(400, Math.max(100, value));
    const element = viewport.current;
    if (!element || next === zoom) return;

    // Keep the part the user is reading centered as the preview gets larger.
    center.current = {
      x: (element.scrollLeft + element.clientWidth / 2) / element.scrollWidth,
      y: (element.scrollTop + element.clientHeight / 2) / element.scrollHeight,
    };
    setZoom(next);
  }

  let previewContent = <LoadingImage />;
  if (image) {
    previewContent = (
      // oxlint-disable-next-line nextjs/no-img-element -- Reuse the authenticated, decoded image.
      <img
        src={image.url}
        alt={`Preview of ${name}`}
        className="h-auto max-h-full w-auto max-w-full object-contain"
      />
    );
  } else if (failed) {
    previewContent = (
      <div className="flex flex-col items-center gap-2">
        <FileFallback>Couldn’t load the image</FileFallback>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => {
            setFailed(false);
            setAttempt((current) => current + 1);
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setZoom(100);
      }}
    >
      <div className={requirementPreviewTile}>{previewContent}</div>
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-24">
          <p className="wrap-anywhere text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{details}</p>
        </div>
        <DialogTrigger
          disabled={!image}
          render={
            <Button
              type="button"
              variant="outline"
              aria-label={`View image: ${name}`}
            />
          }
        >
          <Maximize2 aria-hidden="true" />
          View image
        </DialogTrigger>
      </div>

      {image && (
        <DialogContent
          initialFocus={close}
          showCloseButton={false}
          className="requirements-viewer flex max-h-[calc(100dvh-2rem)] w-[800px] max-w-[calc(100%-2rem)] flex-col gap-3 overflow-auto rounded-[16px] border border-border bg-card p-4 text-foreground shadow-none ring-0 sm:max-w-[calc(100%-2rem)]"
        >
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="wrap-anywhere text-sm font-semibold">
                {name}
              </DialogTitle>
              <DialogDescription>{details}</DialogDescription>
            </div>
            <DialogClose
              render={
                <Button
                  ref={close}
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Close image viewer"
                />
              }
            >
              <X aria-hidden="true" />
            </DialogClose>
          </header>
          <section
            ref={viewport}
            aria-label="Document image"
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to scroll the zoomed image.
            tabIndex={zoom > 100 ? 0 : undefined}
            className="h-[min(55dvh,480px)] shrink-0 overflow-auto overscroll-contain rounded-xl border bg-muted"
          >
            <div
              className="grid place-items-center"
              style={{ width: `${zoom}%`, height: `${zoom}%` }}
            >
              {/* oxlint-disable-next-line nextjs/no-img-element -- Zoom uses the full-resolution local preview. */}
              <img
                src={image.url}
                alt={`Preview of ${name}`}
                draggable={false}
                className="block h-auto max-h-full max-w-full object-contain"
                style={{ width: (image.width * zoom) / 100 }}
              />
            </div>
          </section>
          <footer className="flex flex-wrap items-center justify-between gap-2">
            <fieldset className="flex min-w-0 items-center gap-2">
              <legend className="sr-only">Image zoom</legend>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Zoom out"
                disabled={zoom === 100}
                onClick={() => changeZoom(zoom - 50)}
              >
                <Minus aria-hidden="true" />
              </Button>
              <output className="min-w-10 text-center text-xs tabular-nums">
                {zoom}%
              </output>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Zoom in"
                disabled={zoom === 400}
                onClick={() => changeZoom(zoom + 50)}
              >
                <Plus aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={zoom === 100}
                onClick={() => changeZoom(100)}
              >
                Reset
              </Button>
            </fieldset>
            {download && (
              <a
                href={src}
                download={name}
                className={buttonVariants({ variant: "outline" })}
              >
                <Download aria-hidden="true" />
                Download
              </a>
            )}
          </footer>
        </DialogContent>
      )}
    </Dialog>
  );
}
