"use client";

import { useId, useState, type SubmitEvent } from "react";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  crewVehicles,
  type CrewMember,
  type CrewRole,
} from "../../lib/crewData";

interface ICrewDialogProps {
  role: CrewRole;
  onAdd: (person: CrewMember) => void;
}

const roleOptions = ["Driver", "Helper"].map((value) => ({
  label: value,
  value,
}));

/*TAKE_NOTE: MOCK UP */
const vehicleOptions = [
  { label: "None (reliever)", value: "" },
  ...crewVehicles.map((value) => ({ label: value, value })),
];

const payOptions = [
  { label: "Daily rate", value: "daily" },
  { label: "% of fare per trip", value: "percentage" },
];

const statusOptions = ["On duty", "Off duty"].map((value) => ({
  label: value,
  value,
}));

function CrewDatePicker({ id, name }: Readonly<{ id: string; name: string }>) {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);

  return (
    <>
      <input type="hidden" name={name} value={date ? format(date, "yyyy-MM-dd") : ""} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              data-empty={!date}
              className="w-full justify-start font-normal data-[empty=true]:text-muted-foreground"
            />
          }
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? format(date, "PPP") : "Select date"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date(1950, 0)}
            endMonth={new Date(2100, 11)}
            selected={date}
            defaultMonth={date}
            onSelect={(selected) => {
              setDate(selected);
              setOpen(false);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

export function AddCrewDialog({ role, onAdd }: Readonly<ICrewDialogProps>) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role);
  const [payType, setPayType] = useState("daily");
  const id = useId();
  const fieldId = (name: string) => `${id}-${name}`;

  /*TAKE_NOTE: MOCK UP */
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => {
      const entry = data.get(name);
      return typeof entry === "string" ? entry.trim() : "";
    };

    onAdd({
      id: crypto.randomUUID(),
      name: value("name"),
      phone: value("phone"),
      role: selectedRole,
      status: value("status") as CrewMember["status"],
      vehicle: value("vehicle"),
      license: value("license"),
      codes: value("codes"),
      licenseExpiry: value("licenseExpiry"),
      joined: value("joined"),
      payType: payType as CrewMember["payType"],
      rate: Number(value("rate")),
      rating: null,
      trips: 0,
      pay: 0,
    });
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSelectedRole(role);
          setPayType("daily");
        }
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon data-icon="inline-start" />
        Add {role.toLowerCase()}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add {selectedRole.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Demo crew entries stay on this page until you refresh.
          </DialogDescription>
        </DialogHeader>
        <form id={id} onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={fieldId("name")}>Full name *</Label>
            <Input
              id={fieldId("name")}
              name="name"
              placeholder="e.g. Juan dela Cruz"
              required
              pattern=".*\S.*"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("role")}>Role</Label>
            <Select
              items={roleOptions}
              value={selectedRole}
              onValueChange={(value) => {
                if (value) setSelectedRole(value as CrewRole);
              }}
            >
              <SelectTrigger id={fieldId("role")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor={fieldId("phone")}>Mobile number *</Label>
            <Input
              id={fieldId("phone")}
              name="phone"
              type="tel"
              placeholder="0917 000 0000"
              required
              pattern=".*\S.*"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("license")}>
              Driver’s license no.{selectedRole === "Driver" ? " *" : ""}
            </Label>
            <Input
              id={fieldId("license")}
              name="license"
              placeholder="e.g. N01-09-284511"
              required={selectedRole === "Driver"}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("codes")}>DL codes</Label>
            <Input
              id={fieldId("codes")}
              name="codes"
              placeholder="e.g. B, B2, C"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("licenseExpiry")}>
              License valid until
            </Label>
            <CrewDatePicker
              id={fieldId("licenseExpiry")}
              name="licenseExpiry"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("vehicle")}>Assigned vehicle</Label>
            <Select name="vehicle" items={vehicleOptions} defaultValue="">
              <SelectTrigger
                id={fieldId("vehicle")}
                className="w-full"
                aria-describedby={fieldId("vehicle-hint")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vehicleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              id={fieldId("vehicle-hint")}
              className="text-xs text-muted-foreground"
            >
              Trips on this vehicle go to this person.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("payType")}>Pay scheme</Label>
            <Select
              items={payOptions}
              value={payType}
              onValueChange={(value) => {
                if (value) setPayType(value);
              }}
            >
              <SelectTrigger id={fieldId("payType")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {payOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("rate")}>
              {payType === "daily" ? "Rate (₱ per day)" : "Rate (%)"} *
            </Label>
            <Input
              key={payType}
              id={fieldId("rate")}
              name="rate"
              type="number"
              min={0}
              max={payType === "percentage" ? 100 : undefined}
              step="0.01"
              placeholder={payType === "daily" ? "e.g. 650" : "e.g. 15"}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("joined")}>Joined the fleet</Label>
            <CrewDatePicker id={fieldId("joined")} name="joined" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("status")}>Duty status</Label>
            <Select name="status" items={statusOptions} defaultValue="On duty">
              <SelectTrigger id={fieldId("status")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="submit" form={id}>
            Add {selectedRole.toLowerCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
