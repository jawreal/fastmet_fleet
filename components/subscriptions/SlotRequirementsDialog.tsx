"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { VehicleFileUpload } from "@/components/vehicle-files/VehicleFileUpload";
import {
  vehicleFileDefinitions,
  type VehicleFile,
  type VehicleFiles,
} from "@/lib/VehicleFileData";
import type { VehicleSlot } from "../../lib/SubscriptionData";

interface SlotRequirementsDialogProps {
  slot: VehicleSlot;
  files: VehicleFiles;
  onFileChange: (documentId: string, file: VehicleFile) => void;
  onClose: () => void;
}

export function SlotRequirementsDialog({
  slot,
  files,
  onFileChange,
  onClose,
}: Readonly<SlotRequirementsDialogProps>) {
  const requiredFiles = vehicleFileDefinitions.filter((file) => file.required);
  const selectedRequiredCount = requiredFiles.filter(
    (file) => files[file.id]?.url,
  ).length;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-5 pb-4 pt-5">
          <DialogTitle className="pr-6 text-lg">Vehicle files</DialogTitle>
          <DialogDescription>
            Upload the documents FastMet needs to approve this vehicle.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-5 overflow-y-auto px-5 pb-5">
          <section
            aria-label="Vehicle details"
            className="space-y-3 rounded-lg border bg-muted/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-sm font-mono">
                  {slot.plate}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {slot.vehicleType} · {slot.plan}
                </span>
              </div>
              <Badge variant="secondary">Waiting for approval</Badge>
            </div>
            <p className="text-xs/relaxed text-muted-foreground">
              Vehicle approval and an active subscription slot are needed to
              send offers and receive trips.
            </p>
          </section>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium">Required files</span>
              <span className="text-muted-foreground">
                {selectedRequiredCount} of {requiredFiles.length} selected
              </span>
            </div>
            <progress
              value={selectedRequiredCount}
              max={requiredFiles.length}
              aria-label="Required files selected"
              className="h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
            />
          </div>

          {/* Required and optional documents share the same upload/replace/view control. */}
          {[true, false].map((required) => {
            const definitions = vehicleFileDefinitions.filter(
              (file) => file.required === required,
            );
            const headingId = required
              ? "requiredVehicleFiles"
              : "optionalVehicleFiles";

            return (
              <section
                key={headingId}
                aria-labelledby={headingId}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 id={headingId} className="text-sm font-medium">
                    {required ? "Required" : "Optional"}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {definitions.length} files
                  </span>
                </div>
                <div className="divide-y overflow-hidden rounded-lg border">
                  {definitions.map((definition) => (
                    <VehicleFileUpload
                      key={definition.id}
                      definition={definition}
                      file={files[definition.id]}
                      onChange={(file) => onFileChange(definition.id, file)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
          <p className="text-xs/relaxed text-muted-foreground">
            JPG, PNG or PDF, up to 10 MB each. Files stay in this page session
            only; refreshing the page clears them. Nothing is sent for approval
            yet.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t bg-muted/20 px-5 py-3">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Close
          </DialogClose>
          <DialogClose render={<Button type="button" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
