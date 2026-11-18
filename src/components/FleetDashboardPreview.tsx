import Image from "next/image";
import darkDashboard from "../../public/images/dashboard_dark.png";
import lightDashboard from "../../public/images/dashboard_light.png";

const dashboardAlt = "FastMet Fleet dashboard showing the fleet workspace";

const dashboardImageProps = {
  fetchPriority: "high",
} as const;

export function FleetDashboardPreview({
  decorative = false,
  sizes = "(min-width: 1056px) 942px, (min-width: 640px) calc(100vw - 82px), calc(100vw - 54px)",
}: Readonly<{ decorative?: boolean; sizes?: string }>) {
  const alt = decorative ? "" : dashboardAlt;
  const surface = decorative
    ? "bg-card"
    : "bg-white/30 backdrop-blur-md dark:bg-white/10";
  return (
    <figure
      aria-hidden={decorative || undefined}
      className={`mx-auto max-w-240 rounded-xl border border-white/65 p-1.5 shadow-lg shadow-black/10 sm:rounded-2xl sm:p-2 dark:border-white/20 ${surface}`}
    >
      <Image
        {...dashboardImageProps}
        alt={alt}
        sizes={sizes}
        src={lightDashboard}
        className="block h-auto w-full rounded-lg dark:hidden"
      />
      <Image
        {...dashboardImageProps}
        alt={alt}
        sizes={sizes}
        src={darkDashboard}
        className="hidden h-auto w-full rounded-lg dark:block"
      />
    </figure>
  );
}
