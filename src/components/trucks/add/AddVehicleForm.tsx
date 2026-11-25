"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleFileUpload } from "@/components/vehicle-files/VehicleFileUpload";
import {
  vehicleFileDefinitions,
  type VehicleFiles,
} from "@/lib/vehicleFileData";
import { sampleCrew } from "@/lib/crewData";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
type ChoiceProps = { label: string; options: string[] };

function Choice({ label, options }: Readonly<ChoiceProps>) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        defaultValue={options[0]}
        name={label}
        items={options.map((value) => ({ value, label: value }))}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const identity = [
  ["Plate number", "ABC 1234"],
  ["Make and model", "e.g. Isuzu Forward"],
  ["Year model", "2022"],
  ["Chassis number", "As shown on the CR"],
  ["Engine number", "As shown on the CR"],
];

type AddVehicleFormProps = { onCancel?: () => void };

export function AddVehicleForm({ onCancel }: Readonly<AddVehicleFormProps>) {
  const [files, setFiles] = useState<VehicleFiles>({});
  const [notice, setNotice] = useState("");
  const required = vehicleFileDefinitions.filter((file) => file.required);
  const count = required.filter((file) => files[file.id]).length;
  /*TAKE_NOTE: MOCK UP */
  function save(submit: boolean) {
    if (submit && count !== required.length) {
      setNotice("Upload all five required files before submitting.");
      return;
    }
    setNotice(
      submit
        ? "Vehicle prepared for approval in this preview. Nothing has been sent."
        : "Draft kept on this page. Refreshing clears it.",
    );
  }
  return (
    <form
      className={
        onCancel ? "flex min-h-0 flex-1 flex-col" : "flex flex-col gap-5"
      }
      onSubmit={(event) => {
        event.preventDefault();
        save(true);
      }}
    >
      <div
        className={
          onCancel
            ? "min-h-0 flex-1 overflow-y-auto p-5 space-y-5"
            : "space-y-5"
        }
      >
        {!onCancel && (
          <header className="space-y-2">
            <Link
              href="/fleet/trucks"
              className="text-xs text-muted-foreground hover:underline"
            >
              ← Back to trucks
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add vehicle
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter vehicle details and upload the files needed for review.
            </p>
          </header>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle details</CardTitle>
            <CardDescription>
              Use the details on the certificate of registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {identity.map(([label, placeholder]) => (
              <div key={label} className="grid gap-2">
                <Label htmlFor={label}>
                  {label}
                  {label !== "Year model" ? " *" : ""}
                </Label>
                <Input
                  id={label}
                  name={label}
                  placeholder={placeholder}
                  required={label !== "Year model"}
                  type={label === "Year model" ? "number" : "text"}
                />
              </div>
            ))}
            <Choice
              label="Vehicle type"
              options={[
                "6W Forward",
                "10W Wing Van",
                "4W Closed Van",
                "L300 FB Van",
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle files</CardTitle>
            <CardDescription>
              JPG, PNG or PDF, up to 10 MB per file. {count} of{" "}
              {required.length} required files uploaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[true, false].map((required) => (
              <section key={String(required)} className="space-y-2">
                <h2 className="text-xs font-medium">
                  {required ? "Required files" : "Optional files"}
                </h2>
                <div className="divide-y rounded-lg border">
                  {vehicleFileDefinitions
                    .filter((item) => item.required === required)
                    .map((definition) => (
                      <VehicleFileUpload
                        key={definition.id}
                        definition={definition}
                        file={files[definition.id]}
                        onChange={(file) =>
                          setFiles((current) => ({
                            ...current,
                            [definition.id]: file,
                          }))
                        }
                      />
                    ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operations</CardTitle>
            <CardDescription>
              Validity dates, crew and maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              "OR/CR registration valid until",
              "Insurance valid until",
              "LTFRB franchise valid until",
              "Odometer (km)",
              "PMS interval (km)",
              "Odometer at last PMS",
            ].map((label) => (
              <div key={label} className="grid gap-2">
                <Label htmlFor={label}>{label}</Label>
                <Input
                  id={label}
                  name={label}
                  type={label.includes("until") ? "date" : "number"}
                  min={0}
                  placeholder={
                    label === "PMS interval (km)" ? "5000" : "Enter mileage"
                  }
                  required={label === "Odometer (km)"}
                />
              </div>
            ))}
            <Choice
              label="Status"
              options={["Active", "In maintenance", "Inactive"]}
            />
            <Choice
              label="Driver"
              options={[
                "No driver",
                ...sampleCrew
                  .filter((item) => item.role === "Driver")
                  .map((item) => item.name),
              ]}
            />
            <Choice
              label="Helper"
              options={[
                "No helper",
                ...sampleCrew
                  .filter((item) => item.role === "Helper")
                  .map((item) => item.name),
              ]}
            />
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Additional vehicle information"
              />
            </div>
          </CardContent>
        </Card>
        {notice && <p className="rounded-md border p-3 text-xs">{notice}</p>}
      </div>
      <footer className="sticky bottom-0 shrink-0 flex flex-wrap justify-end gap-2 border-t bg-background dark:bg-stone-900 p-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/fleet/trucks" />}
          >
            Cancel
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => save(false)}>
          Save draft
        </Button>
        <Button type="submit">Submit for approval</Button>
      </footer>
    </form>
  );
}
