"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import {
  CheckCircle2Icon,
  EyeIcon,
  FileTextIcon,
  UploadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  readVehicleFile,
  type VehicleFile,
  type VehicleFileDefinition,
} from "../../lib/VehicleFileData";

interface VehicleFileUploadProps {
  definition: VehicleFileDefinition;
  file?: VehicleFile;
  onChange: (file: VehicleFile) => void;
}

interface VehicleFilePreviewProps {
  file?: VehicleFile;
  title: string;
  isUnavailable: boolean;
  onImageError: (url: string) => void;
}

function VehicleFilePreview({
  file,
  title,
  isUnavailable,
  onImageError,
}: Readonly<VehicleFilePreviewProps>) {
  if (!file) return null;

  if (isUnavailable) {
    return (
      <p role="alert" className="text-xs text-destructive">
        This image is unavailable. Close the preview and replace it.
      </p>
    );
  }

  if (file.mimeType.startsWith("image/")) {
    return (
      // Local file previews bypass Next's image optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.url}
        alt={title}
        className="min-h-0 rounded-md object-contain"
        onError={() => onImageError(file.url)}
      />
    );
  }

  return (
    <object
      data={file.url}
      type="application/pdf"
      className="h-[60dvh] w-full"
      aria-label={title}
    >
      <p className="text-xs text-muted-foreground">
        Your browser cannot preview this PDF.
      </p>
    </object>
  );
}

export function VehicleFileUpload({
  definition,
  file,
  onChange,
}: Readonly<VehicleFileUploadProps>) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const hasFile = Boolean(file?.url);
  const isImage = Boolean(file?.mimeType.startsWith("image/"));
  const isUnavailable = hasFile && failedImageUrl === file?.url;
  const uploadAction = hasFile ? "Replace" : "Upload";
  const uploadButtonLabel = isReading ? "Reading…" : uploadAction;
  let fileStatus = "Not uploaded";

  if (isUnavailable) {
    fileStatus = "Image unavailable. Replace this file.";
  } else if (hasFile && file) {
    fileStatus = file.name;
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    // Reset so selecting the same file again still triggers an update.
    event.target.value = "";
    if (!selectedFile) return;

    setIsReading(true);
    setError("");
    try {
      const nextFile = await readVehicleFile(selectedFile);
      onChange(nextFile);
      setFailedImageUrl(null);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to read this file.",
      );
    } finally {
      setIsReading(false);
    }
  }

  return (
    <div className="space-y-2 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
          {hasFile && isImage && !isUnavailable ? (
            // Local file previews need a regular image element rather than Next's image optimizer.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file!.url}
              alt=""
              className="size-full object-cover"
              onError={() => setFailedImageUrl(file!.url)}
            />
          ) : (
            <FileTextIcon
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          )}
        </div>
        <div className="min-w-0 flex-1 basis-40 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <label htmlFor={inputId} className="text-xs font-medium">
              {definition.title}
            </label>
            {hasFile && !isUnavailable && (
              <CheckCircle2Icon
                aria-label="File selected"
                className="size-3.5 text-emerald-600 dark:text-emerald-400"
              />
            )}
          </div>
          <p className="text-xs/relaxed text-muted-foreground">
            {definition.description}
          </p>
          <p className="break-all text-xs text-muted-foreground">
            {fileStatus}
          </p>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="sr-only"
          disabled={isReading}
          onChange={handleFileChange}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <div className="ml-auto flex gap-2">
          {hasFile && !isUnavailable && (
            <Button
              type="button"
              variant="ghost"
              aria-label={`View ${definition.title}`}
              onClick={() => setIsPreviewOpen(true)}
            >
              <EyeIcon /> View
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={isReading}
            aria-label={`${uploadAction} ${definition.title}`}
            onClick={() => inputRef.current?.click()}
          >
            {!hasFile && <UploadIcon />}
            {uploadButtonLabel}
          </Button>
        </div>
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="pr-6">{definition.title}</DialogTitle>
            <DialogDescription className="break-all">
              {file?.name}
            </DialogDescription>
          </DialogHeader>
          <VehicleFilePreview
            file={file}
            title={definition.title}
            isUnavailable={isUnavailable}
            onImageError={setFailedImageUrl}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Close preview
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
