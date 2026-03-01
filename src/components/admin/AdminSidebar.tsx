"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  FileText,
  Building,
  Users,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Psychologists", href: "/admin/dashboard/psychologists", icon: ShieldCheck },
      { name: "Users", href: "/admin/dashboard/patients", icon: Users },
      { name: "Hospitals", href: "/admin/dashboard/hospitals", icon: Building },
    ],
  },
  {
    label: "Activity",
    items: [
      { name: "Appointments", href: "/admin/dashboard/appointments", icon: CalendarDays },
      { name: "Payments", href: "/admin/dashboard/payments", icon: CreditCard },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Blog", href: "/admin/dashboard/blog", icon: FileText },
      { name: "Moderation", href: "/admin/dashboard/reviews", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Reports", href: "/admin/dashboard/reports", icon: BarChart2 },
      { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "w-60 bg-[var(--dash-surface)] text-[var(--dash-text)] min-h-screen flex flex-col border-r border-[var(--dash-border)]",
        className
      )}
    >
      <div className="p-5 border-b border-[var(--dash-border)]">
        <h1 className="text-lg font-bold dash-heading">Admin Panel</h1>
        <p className="text-xs dash-muted mt-0.5">HealTalk</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold dash-muted uppercase tracking-wider px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] font-medium border border-[var(--dash-border)]"
                        : "dash-muted hover:bg-[var(--dash-surface-elev)] hover:text-[var(--dash-text)]"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${active ? "text-[var(--dash-primary)]" : ""}`}
                    />
                    {item.name}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--dash-primary)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--dash-border)]">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login", redirect: true })}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[var(--dash-danger)] hover:bg-[var(--dash-danger-soft)] rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
