"use client";

import {
  Download,
  ImageOff,
  Maximize2,
  MoreHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  maxRequirementBytes,
  requirementLabels,
  requirementsApi,
  type Requirement,
} from "@/lib/application/requirements";

export const requirementStatuses = {
  approved: {
    label: "Approved",
    text: "text-muted-foreground",
    badge: "border-input bg-background dark:bg-[#0f0f0f]",
  },
  pending: {
    label: "Awaiting review",
    text: "text-muted-foreground",
    badge: "border-input bg-background dark:bg-[#0f0f0f]",
  },
  needs_update: {
    label: "Needs correction",
    text: "text-destructive",
    badge: "border-destructive/35 bg-destructive/10",
  },
  staged: {
    label: "Ready to submit",
    text: "text-primary-foreground dark:text-primary",
    badge: "border-primary/35 bg-primary/10",
  },
};

export type RequirementDisplayStatus = keyof typeof requirementStatuses;
export type StagedReplacement = { file: File; previewUrl: string };

const imageTypes = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
]);

const outlineControl =
  "requirements-control h-8 gap-1.5 rounded-[8px] px-3 text-xs font-semibold";
const menuItem = "h-8 gap-2 px-2 text-xs font-medium focus:bg-muted";
const previewTile =
  "flex w-full items-center justify-center overflow-hidden rounded-[12px] border border-border bg-muted dark:bg-[#161616]";

function FileFallback({ children }: Readonly<{ children: string }>) {
  return (
    <div className="flex flex-col items-center gap-2 px-3 text-center text-xs text-muted-foreground">
      <ImageOff aria-hidden="true" strokeWidth={2} className="size-7" />
      {children}
    </div>
  );
}

function PreviewImage({ name, src }: Readonly<{ name: string; src: string }>) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return <FileFallback>Preview unavailable for this file</FileFallback>;
  return (
    // oxlint-disable-next-line nextjs/no-img-element -- Fetch private previews with the browser's Fleet session.
    <img
      src={src}
      alt={`Preview of ${name}`}
      className="max-h-full max-w-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function ReplacementFigure({
  replacement: { file, previewUrl },
  onChangeFile,
  onRemove,
}: Readonly<{
  replacement: StagedReplacement;
  onChangeFile?: () => void;
  onRemove?: () => void;
}>) {
  const size =
    file.size >= 1024 ** 2
      ? `${(file.size / 1024 ** 2).toFixed(1)} MB`
      : `${Math.ceil(file.size / 1024)} KB`;
  const facts = `${size} · Not yet submitted`;

  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="flex min-h-7 items-center justify-between gap-2 text-xs font-semibold">
        <span>Replacement document</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-[8px] hover:bg-muted dark:hover:bg-muted"
                aria-label={`More actions for ${file.name}`}
              />
            }
          >
            <MoreHorizontal
              aria-hidden="true"
              strokeWidth={2}
              className="size-4"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            className="requirements-menu w-48 rounded-[10px] border border-input bg-popover p-1 shadow-none ring-0"
          >
            {onChangeFile && (
              <DropdownMenuItem className={menuItem} onClick={onChangeFile}>
                <Upload
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-3.5 text-muted-foreground"
                />
                Change file
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className={menuItem}
              render={
                <a
                  href={previewUrl}
                  download={file.name}
                  aria-label="Download"
                />
              }
            >
              <Download
                aria-hidden="true"
                strokeWidth={2}
                className="size-3.5 text-muted-foreground"
              />
              Download
            </DropdownMenuItem>
            {onRemove && (
              <>
                <DropdownMenuSeparator className="-mx-1 my-1" />
                <DropdownMenuItem
                  className={`${menuItem} data-[variant=destructive]:focus:bg-muted dark:data-[variant=destructive]:focus:bg-muted`}
                  variant="destructive"
                  onClick={onRemove}
                >
                  <Trash2
                    aria-hidden="true"
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  Remove replacement
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </figcaption>
      <Dialog>
        <DialogTrigger
          render={
            <button
              type="button"
              aria-label={`View ${file.name} full size`}
              className={`h-[220px] cursor-zoom-in! p-0 hover:border-input dark:hover:border-[#3a3a3a] ${previewTile}`}
            />
          }
        >
          <PreviewImage key={previewUrl} name={file.name} src={previewUrl} />
        </DialogTrigger>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs" title={file.name}>
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{facts}</p>
          </div>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className={`${outlineControl} shrink-0`}
              />
            }
          >
            <Maximize2
              aria-hidden="true"
              strokeWidth={2}
              className="size-3.5"
            />
            View full size
          </DialogTrigger>
        </div>
        <DialogContent
          showCloseButton={false}
          className="requirements-viewer flex w-[640px] max-w-[calc(100%-2rem)] flex-col gap-3 rounded-[16px] border border-border bg-card p-4 text-foreground shadow-none ring-0 sm:max-w-[calc(100%-2rem)] dark:border-[#2a2a2a]"
        >
          <header className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle
                className="truncate text-sm font-semibold"
                title={file.name}
              >
                {file.name}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground dark:text-[#8f8f8f]">
                {facts}
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Close viewer"
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="requirements-control size-7 rounded-[8px]"
                />
              }
            >
              <X aria-hidden="true" strokeWidth={2} className="size-3.5" />
            </DialogClose>
          </header>
          <div className={`h-[380px] max-h-[60vh] ${previewTile}`}>
            <PreviewImage key={previewUrl} name={file.name} src={previewUrl} />
          </div>
          <footer className="flex justify-end gap-2">
            <a
              href={previewUrl}
              download={file.name}
              aria-label={`Download ${file.name}`}
              className={buttonVariants({
                variant: "outline",
                className: outlineControl,
              })}
            >
              <Download
                aria-hidden="true"
                strokeWidth={2}
                className="size-3.5"
              />
              Download
            </a>
            <DialogClose
              render={
                <Button
                  type="button"
                  className="h-8 rounded-[8px] px-3.5 text-xs font-semibold"
                />
              }
            >
              Close
            </DialogClose>
          </footer>
        </DialogContent>
      </Dialog>
    </figure>
  );
}

export function RequirementDetails({
  document,
  status,
  replacement,
  editable,
  error,
  onReplacement,
  children,
}: Readonly<{
  document: Requirement;
  status: RequirementDisplayStatus;
  replacement?: StagedReplacement;
  editable: boolean;
  error?: string;
  onReplacement: (file?: File) => void;
  children?: ReactNode;
}>) {
  const input = useRef<HTMLInputElement>(null);
  const [validation, setValidation] = useState("");
  const { canPreview, field, originalName, reason, revision } = document;
  const inputId = `replacement-${field}`;
  const message = validation || error;
  const statusStyle = requirementStatuses[status];

  function selectFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const extension = /\.([a-z]+)$/i.exec(file.name)?.[1]?.toLowerCase() ?? "";
    const type = imageTypes.get(extension);
    if (files.length !== 1) {
      setValidation("Choose one replacement for this document.");
    } else if (!type || file.type !== type) {
      setValidation("Choose a JPG or PNG image.");
    } else if (file.size === 0 || file.size > maxRequirementBytes) {
      setValidation("Choose an image between 1 byte and 10 MB.");
    } else {
      setValidation("");
      onReplacement(file);
    }
  }

  const fileInput = editable ? (
    <input
      ref={input}
      id={inputId}
      name={field}
      type="file"
      className={
        replacement
          ? "sr-only"
          : "absolute inset-0 size-full cursor-pointer opacity-0"
      }
      tabIndex={replacement ? -1 : undefined}
      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
      aria-invalid={!!message}
      aria-label={replacement ? "Change replacement document" : undefined}
      aria-labelledby={replacement ? undefined : `${inputId}-label`}
      aria-describedby={
        [!replacement && `${inputId}-hint`, message && `${inputId}-error`]
          .filter(Boolean)
          .join(" ") || undefined
      }
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) event.preventDefault();
      }}
      onDrop={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        selectFiles(event.dataTransfer.files);
      }}
      onChange={(event) => {
        selectFiles(event.currentTarget.files);
        event.currentTarget.value = "";
      }}
    />
  ) : null;

  return (
    <section
      id="requirement-details"
      aria-labelledby="requirement-details-title"
      className="flex min-w-0 flex-[999_1_460px] flex-col gap-4 rounded-[16px] border bg-card p-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="requirement-details-title"
          className="text-base font-semibold tracking-tight"
        >
          {requirementLabels[field]}
        </h2>
        <span
          className={`inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold whitespace-nowrap ${statusStyle.text} ${statusStyle.badge}`}
        >
          {statusStyle.label}
        </span>
      </header>

      {document.status === "needs_update" && reason && (
        <Alert
          variant="destructive"
          className="gap-0.5 rounded-[8px] border-destructive/30 bg-destructive/7 px-3 py-2.5"
        >
          <AlertTitle className="text-xs font-medium text-destructive">
            Reviewer feedback
          </AlertTitle>
          <AlertDescription className="wrap-anywhere whitespace-pre-wrap text-xs text-destructive! dark:text-[#fca5a5]!">
            {reason}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-5">
        <figure className="flex min-w-0 flex-col gap-2">
          <figcaption className="flex min-h-7 items-center text-xs font-semibold">
            {document.status === "needs_update"
              ? "Previously submitted"
              : "Submitted document"}
          </figcaption>
          <div className={`h-[220px] ${previewTile}`}>
            {canPreview && originalName ? (
              <PreviewImage
                key={revision}
                name={originalName}
                src={`${requirementsApi}?field=${field}&revision=${revision}`}
              />
            ) : (
              <FileFallback>
                {originalName
                  ? "Preview unavailable for this file"
                  : "No file submitted"}
              </FileFallback>
            )}
          </div>
          {originalName && (
            <div className="space-y-0.5">
              <p className="truncate text-xs" title={originalName}>
                {originalName}
              </p>
              <p className="text-xs text-muted-foreground">
                Revision {revision}
              </p>
            </div>
          )}
        </figure>

        {replacement && (
          <ReplacementFigure
            replacement={replacement}
            onChangeFile={editable ? () => input.current?.click() : undefined}
            onRemove={
              editable
                ? () => {
                    setValidation("");
                    onReplacement();
                    requestAnimationFrame(() => input.current?.focus());
                  }
                : undefined
            }
          />
        )}
        {editable && !replacement && (
          <figure className="flex min-w-0 flex-col gap-2">
            <figcaption className="flex min-h-7 items-center text-xs font-semibold">
              Replacement document
            </figcaption>
            <Label
              htmlFor={inputId}
              className="relative flex h-[220px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-input bg-card p-3 text-center hover:bg-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary dark:border-[#3a3a3a] dark:bg-[#131313] dark:hover:bg-[#161616]"
            >
              {fileInput}
              <Upload
                aria-hidden="true"
                strokeWidth={2}
                className="size-[18px] text-muted-foreground"
              />
              <span
                id={`${inputId}-label`}
                className="text-[13px] font-semibold"
              >
                Drop the corrected file here, or browse
              </span>
              <span
                id={`${inputId}-hint`}
                className="text-xs text-muted-foreground"
              >
                JPG or PNG, up to 10 MB.
              </span>
            </Label>
          </figure>
        )}
      </div>

      {replacement && fileInput}
      {message && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-destructive"
        >
          {message}
        </p>
      )}
      {children}
    </section>
  );
}
