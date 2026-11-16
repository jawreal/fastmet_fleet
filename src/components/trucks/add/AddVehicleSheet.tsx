"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AddVehicleForm } from "./AddVehicleForm";
type AddVehicleSheetProps = { onClose: () => void };
export function AddVehicleSheet({ onClose }: Readonly<AddVehicleSheetProps>) {
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b p-5 pr-12">
          <SheetTitle>Add vehicle</SheetTitle>
          <SheetDescription>
            Enter vehicle details and upload the files needed for review.
          </SheetDescription>
        </SheetHeader>
        <AddVehicleForm onCancel={onClose} />
      </SheetContent>
    </Sheet>
  );
}
