import Image from "next/image";

export function FleetProductImage() {
  return (
    <Image
      src="/images/laptop_no_bg.png"
      alt="Laptop displaying FastMet Fleet subscriptions, vehicle plans, and renewal management"
      width={1679}
      height={937}
      sizes="(min-width: 1600px) 750px, (min-width: 1280px) 620px, (min-width: 1024px) 470px, 1px"
      className="h-auto w-full object-contain"
    />
  );
}
