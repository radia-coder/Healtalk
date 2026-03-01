"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { NewSidebar } from "@/components/dashboard/NewSidebar";
import { NewHeader } from "@/components/dashboard/NewHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="dashboard-theme flex min-h-screen">
        <AdminSidebar className="hidden lg:flex" />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <AdminHeader onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden font-sans">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 z-50 overflow-y-auto">
              <AdminSidebar className="flex h-full" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-theme min-h-screen font-sans">
      <div className="flex">
        <NewSidebar className="hidden lg:flex fixed left-0 top-0" />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
          <NewHeader onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden font-sans">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 z-50 overflow-y-auto">
            <NewSidebar className="flex h-full" />
          </div>
        </div>
      )}
    </div>
  );
}
