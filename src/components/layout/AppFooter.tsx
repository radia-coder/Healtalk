"use client";

import { usePathname } from "next/navigation";
import CTAFooterShell from "@/components/layout/CTAFooterShell";
import Footer from "@/components/layout/Footer";

export default function AppFooter() {
  const pathname = usePathname();
  const isDashboard = pathname?.includes("/dashboard") ?? false;
  const isHome = pathname === "/";

  if (isDashboard) {
    return null;
  }

  return isHome ? <CTAFooterShell /> : <Footer />;
}
