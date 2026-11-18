import Image from "next/image";

export function DriverProductImage() {
  return (
    <Image
      src="/images/driver-pic.png"
      alt="FastMet delivery riders in yellow uniforms with motorcycles and parcels, illustrated inside a phone"
      width={1263}
      height={1246}
      sizes="(min-width: 1280px) 290px, (min-width: 1024px) 230px, 1px"
      className="h-auto w-full max-w-90 object-contain xl:max-w-100"
    />
  );
}
