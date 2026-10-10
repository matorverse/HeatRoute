import { useState, useEffect } from "react";

/**
 * Hook to distinguish between Desktop and Mobile Phone viewports.
 * Uses matchMedia for zero-overhead, jank-free layout updates.
 */
export function useDeviceLayout() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return { isMobile, isDesktop: !isMobile };
}
