import Image from "next/image";
import operationsScreenshot from "../../../public/images/bookings_dark.png";

export function OperationsPreview() {
  return (
    <figure className="min-w-0">
      <div className="fleet-preview-glass overflow-hidden rounded-xl border p-1.5 sm:rounded-2xl sm:p-2">
        <Image
          src={operationsScreenshot}
          alt="FastMet Fleet bookings workspace with trip statuses and crew assignments"
          sizes="(min-width: 1152px) 704px, (min-width: 768px) 60vw, 90vw"
          className="block h-auto w-full rounded-lg"
        />
      </div>
      <figcaption className="fleet-copy fleet-muted mt-3">
        The FastMet Fleet bookings workspace.
      </figcaption>
    </figure>
  );
}
