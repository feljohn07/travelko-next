"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to top of the page on every route change.
 * Replaces the old ScrollToTop that used react-router-dom's useLocation().
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
