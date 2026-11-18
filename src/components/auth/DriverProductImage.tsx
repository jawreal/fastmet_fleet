"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

const desktopQuery = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(desktopQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function DriverProductImage() {
  const isDesktop = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [failed, setFailed] = useState(false);

  if (!isDesktop || failed) return null;

  return (
    <Image
      src="/images/driver-pic.png"
      alt="FastMet delivery drivers and motorcycles displayed on a phone"
      width={1263}
      height={1246}
      unoptimized
      className="fleet-login-driver-image h-auto max-h-[min(70svh,720px)] w-auto max-w-full object-contain opacity-50"
      onError={() => setFailed(true)}
    />
  );
}
