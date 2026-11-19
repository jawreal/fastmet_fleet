import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label="FastMet Fleet home"
      className="flex w-fit items-center gap-3 rounded-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <Image src="/icon.png" alt="" width={32} height={32} />
      <span className="text-sm font-medium tracking-tight">
        FastMet{" "}
        <span className="font-normal text-muted-foreground">/ Fleet</span>
      </span>
    </Link>
  );
}
