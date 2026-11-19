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
    ? "max-w-240 border-white/65 bg-card shadow-lg shadow-black/10 dark:border-white/20"
    : "fleet-preview-glass w-full";
  return (
    <figure
      aria-hidden={decorative || undefined}
      className={`mx-auto rounded-xl border p-1.5 sm:rounded-2xl sm:p-2 ${surface}`}
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
