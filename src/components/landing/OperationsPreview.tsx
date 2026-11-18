import Image from "next/image";

// Optional: add a screenshot under public/images and set its URL here.
// Suggested asset: /images/fleet-operations.webp
const operationsScreenshot = "";

export function OperationsPreview() {
  return (
    <figure className="min-w-0">
      <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-lg border bg-muted">
        {operationsScreenshot ? (
          <Image
            src={operationsScreenshot}
            alt="FastMet Fleet bookings workspace with trip statuses and crew assignments"
            fill
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-contain"
          />
        ) : (
          <Image
            src="/images/driver-pic.png"
            alt="FastMet delivery riders and their motorcycles illustrated inside a phone"
            width={1263}
            height={1246}
            sizes="(min-width: 640px) 288px, 50vw"
            className="h-auto w-[56%] max-w-72 object-contain"
          />
        )}
      </div>
      <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
        {operationsScreenshot
          ? "The FastMet Fleet bookings workspace."
          : "FastMet delivery team illustration."}
      </figcaption>
    </figure>
  );
}
