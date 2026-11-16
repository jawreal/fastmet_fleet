import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/*TAKE_NOTE: MOCK UP */
export function FleetDataSettings() {
  return (
    <Card aria-labelledby="fleetDataHeading" className="ring-destructive/30">
      <CardHeader>
        <CardTitle id="fleetDataHeading">Fleet data</CardTitle>
        <CardDescription>
          Your fleet is saved online and shared with anyone you give access to
          this page. Changes sync to every open device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-medium">Reset fleet data</h3>
            <p className="text-xs/relaxed text-muted-foreground">
              Remove existing fleet records and start with a clean workspace.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            className="self-start border-destructive/30 sm:self-auto px-3"
            size="lg"
          >
            <Trash2Icon data-icon="inline-start" />
            Clear all data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
