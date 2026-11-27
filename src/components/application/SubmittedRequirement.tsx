import {
  requirementsApi,
  type Requirement,
} from "@/lib/application/requirements";
import {
  FileFallback,
  RequirementImage,
  requirementPreviewTile,
} from "./RequirementImage";

const imageLabels = new Map([
  ["png", "PNG image"],
  ["jpg", "JPEG image"],
  ["jpeg", "JPEG image"],
]);

export function SubmittedRequirement({
  document,
}: Readonly<{ document: Requirement }>) {
  const { canPreview, field, originalName, revision, status } = document;

  const extension = originalName?.split(".").pop()?.toLowerCase() ?? "";

  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="flex min-h-7 items-baseline justify-between gap-3 text-sm font-semibold">
        <span className="self-center">
          {status === "needs_update"
            ? "Previously submitted"
            : "Submitted document"}
        </span>
        {originalName && (
          <span className="self-center text-xs font-normal whitespace-nowrap text-muted-foreground">
            Revision {revision}
          </span>
        )}
      </figcaption>
      {canPreview && originalName ? (
        <RequirementImage
          key={revision}
          name={originalName}
          src={`${requirementsApi}?field=${field}&revision=${revision}`}
          details={imageLabels.get(extension) ?? "Image"}
        />
      ) : (
        <div className={requirementPreviewTile}>
          <FileFallback>
            {originalName
              ? "Preview unavailable for this file"
              : "No file submitted"}
          </FileFallback>
        </div>
      )}
      {!canPreview && originalName && (
        <p className="wrap-anywhere text-sm font-medium">{originalName}</p>
      )}
    </figure>
  );
}
