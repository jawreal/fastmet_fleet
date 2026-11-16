import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatFuelPesos, type FillUp } from "@/lib/fuelData";

interface DeleteFillUpDialogProps {
  entry: FillUp;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteFillUpDialog({
  entry,
  onConfirm,
  onClose,
}: Readonly<DeleteFillUpDialogProps>) {
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete fill-up?</AlertDialogTitle>
          <AlertDialogDescription>
            Remove the {entry.liters.toFixed(1)} L fill-up for {entry.plate} on{" "}
            {entry.date}, totaling {formatFuelPesos(entry.liters * entry.price)}
            ? This updates your fuel totals and economy calculations. This
            action cannot be undone within this session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete fill-up
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
