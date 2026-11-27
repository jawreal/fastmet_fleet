import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  maxRequirementBytes,
  type Requirement,
} from "@/lib/application/requirements";
import { ReplacementFigure, type StagedReplacement } from "./ReplacementFigure";
import { SubmittedRequirement } from "./SubmittedRequirement";

const imageTypes = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
]);

export function RequirementDocuments({
  document,
  replacement,
  editable,
  error,
  onReplacement,
}: Readonly<{
  document: Requirement;
  replacement?: StagedReplacement;
  editable: boolean;
  error?: string;
  onReplacement: (file?: File) => void;
}>) {
  const input = useRef<HTMLInputElement>(null);
  const [validation, setValidation] = useState("");
  const { field } = document;
  const inputId = `replacement-${field}`;
  const message = validation || error;

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
    <>
      <div className="flex flex-col gap-5">
        <SubmittedRequirement document={document} />
        {replacement && (
          <div className="min-w-0 border-t pt-5">
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
          </div>
        )}
        {editable && !replacement && (
          <figure className="flex min-w-0 flex-col gap-2 border-t pt-5">
            <figcaption className="flex min-h-7 items-center text-sm font-semibold">
              Replacement document
            </figcaption>
            <Label
              htmlFor={inputId}
              className="relative flex min-h-55 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-input bg-card p-3 text-center hover:bg-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
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
                Drop the corrected file here or{" "}
                <span className="underline underline-offset-2">
                  browse files
                </span>
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
    </>
  );
}
