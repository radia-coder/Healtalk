"use client";

import { Calendar, MessageCircle, Heart, ArrowRight, Video, Brain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Book Appointment",
    icon: Calendar,
    href: "/find-psychologists",
    color: "text-[var(--dash-primary)]",
    bg: "bg-[var(--dash-primary-soft)] border border-[var(--dash-primary)]",
    desc: "Find a specialist"
  },
  {
    label: "Join Session",
    icon: Video,
    href: "/patient/dashboard/sessions",
    color: "text-[var(--dash-accent)]",
    bg: "bg-[var(--dash-accent-soft)] border border-[var(--dash-accent)]",
    desc: "Group therapy",
    badge: "New"
  },
  {
    label: "Mental Health Check",
    icon: Brain,
    href: "/patient/dashboard/screening",
    color: "text-[var(--dash-success)]",
    bg: "bg-[var(--dash-success-soft)] border border-[var(--dash-success)]",
    desc: "AI screening",
    badge: "New"
  },
  {
    label: "Send Message",
    icon: MessageCircle,
    href: "/patient/dashboard/messages",
    color: "text-[var(--dash-warning)]",
    bg: "bg-[var(--dash-warning-soft)] border border-[var(--dash-warning)]",
    desc: "Chat with doctor"
  },
  {
    label: "View Favorites",
    icon: Heart,
    href: "/patient/dashboard/favorites",
    color: "text-[var(--dash-danger)]",
    bg: "bg-[var(--dash-danger-soft)] border border-[var(--dash-danger)]",
    desc: "Saved doctors"
  },
];

export function PatientQuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-fr">
      {actions.map((action, i) => (
        <Link
          key={i}
          href={action.href}
          className="dash-card p-5 transition-colors group flex flex-col justify-between h-full min-h-[200px] relative hover:border-[var(--dash-border-strong)]"
        >
          {action.badge && (
            <div className="absolute top-3 right-3 bg-[var(--dash-primary-soft)] border border-[var(--dash-primary)] text-[var(--dash-primary)] text-[10px] font-semibold px-2 py-1 rounded-full">
              {action.badge}
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center", action.bg)}>
              <action.icon size={20} className={action.color} />
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--dash-surface-elev)] flex items-center justify-center group-hover:bg-[var(--dash-chip)] transition-colors">
              <ArrowRight size={14} className="text-[var(--dash-text-muted)] group-hover:text-[var(--dash-text)]" />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="dash-heading text-lg font-bold mb-1">{action.label}</h3>
            <p className="dash-muted text-xs leading-relaxed">{action.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
