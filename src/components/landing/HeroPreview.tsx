import Image from "next/image";
import darkDashboard from "../../../public/images/dashboard_dark.png";
import lightDashboard from "../../../public/images/dashboard_light.png";

const dashboardAlt = "FastMet Fleet dashboard showing the fleet workspace";

const dashboardImageProps = {
  sizes:
    "(min-width: 1056px) 942px, (min-width: 640px) calc(100vw - 82px), calc(100vw - 54px)",
  fetchPriority: "high",
} as const;

export function HeroPreview() {
  return (
    <figure className="mx-auto max-w-240 rounded-xl border border-white/65 bg-white/30 p-1.5 shadow-lg shadow-black/10 backdrop-blur-md sm:rounded-2xl sm:p-2 dark:border-white/20 dark:bg-white/10">
      <Image
        {...dashboardImageProps}
        alt={dashboardAlt}
        src={lightDashboard}
        className="block h-auto w-full rounded-lg dark:hidden"
      />
      <Image
        {...dashboardImageProps}
        alt={dashboardAlt}
        src={darkDashboard}
        className="hidden h-auto w-full rounded-lg dark:block"
      />
    </figure>
  );
}
