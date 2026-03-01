import { ReactNode } from "react";

import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardRoutesLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
