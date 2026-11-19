import Image from "next/image";

export function Brand() {
  return (
    <div className="flex items-center gap-3 text-foreground">
      <Image src="/icon.png" alt="" width={32} height={32} />
      <span className="text-sm font-medium tracking-tight">
        FastMet{" "}
        <span className="font-normal text-muted-foreground">/ Fleet</span>
      </span>
    </div>
  );
}
