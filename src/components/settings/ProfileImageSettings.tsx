"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readVehicleFile } from "@/lib/vehicleFileData";
import { useCompanyImage } from "@/hooks/use-company-image";

export function ProfileImageSettings() {
  const input = useRef<HTMLInputElement>(null);
  /*TAKE_NOTE: MOCK UP */
  const { image, setCompanyImage: setImage } = useCompanyImage();
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-4 border-b pb-4">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
        {image ? (
          <Image
            unoptimized
            src={image.url}
            alt="Company logo"
            width={64}
            height={64}
            className="size-full object-cover"
          />
        ) : (
          <Building2
            aria-hidden="true"
            className="size-6 text-muted-foreground"
          />
        )}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium">Company logo</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={reading}
            onClick={() => input.current?.click()}
          >
            <Camera />
            {image ? "Replace image" : "Upload image"}
          </Button>
          {image && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setImage(undefined)}
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          JPG or PNG, up to 10 MB. Preview only; refreshing clears it.
        </p>
      </div>
      <input
        ref={input}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png"
        aria-label="Company profile image"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (!["image/jpeg", "image/png"].includes(file.type)) {
            setError("Choose a JPG or PNG image.");
            return;
          }
          setReading(true);
          setError("");
          try {
            setImage(await readVehicleFile(file));
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Unable to read image.",
            );
          } finally {
            setReading(false);
          }
        }}
      />
      {error && (
        <p role="alert" className="w-full text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
