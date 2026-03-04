"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdminRoute = pathname?.startsWith("/admin");
  const isPsychologistRoute = pathname?.startsWith("/psychologist");
  const isPatientRoute = pathname?.startsWith("/patient");

  const expectedRole = isAdminRoute
    ? "ADMIN"
    : isPsychologistRoute
    ? "PSYCHOLOGIST"
    : isPatientRoute
    ? "PATIENT"
    : null;

  const getRoleHome = (currentRole?: string) => {
    if (currentRole === "ADMIN") return "/admin/dashboard";
    if (currentRole === "PSYCHOLOGIST") return "/psychologist/dashboard";
    if (currentRole === "PATIENT") return "/patient/dashboard";
    return "/login";
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(isAdminRoute ? "/admin/login" : "/login");
      return;
    }

    if (expectedRole && role !== expectedRole) {
      if (expectedRole === "ADMIN") {
        router.push("/admin/login");
        return;
      }
      router.push(getRoleHome(role));
    }
  }, [expectedRole, isAdminRoute, role, router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (expectedRole && role !== expectedRole) {
    return null;
  }

  return <div className="min-h-full">{children}</div>;
}
