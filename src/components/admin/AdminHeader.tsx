"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ExternalLink, LogOut, Menu } from "lucide-react";

interface AdminHeaderProps {
  onMobileMenuClick?: () => void;
}

export default function AdminHeader({ onMobileMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const email = session?.user?.email ?? null;
  const name = session?.user?.name ?? null;
  const role = (session?.user as { role?: string } | undefined)?.role ?? null;
  const initial = (name || email || "A")[0].toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        {onMobileMenuClick && (
          <button
            type="button"
            onClick={onMobileMenuClick}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-elev)]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-sm dash-muted hover:text-[var(--dash-text)] bg-[var(--dash-surface-elev)] hover:bg-[var(--dash-chip)] border border-[var(--dash-border)] px-3 py-1.5 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View on site</span>
          <span className="sm:hidden">Site</span>
        </Link>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 rounded-full bg-[var(--dash-primary)] flex items-center justify-center text-white text-xs font-bold hover:bg-[var(--dash-primary-hover)] transition-colors"
        >
          {initial}
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-56 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <p className="text-xs dash-muted">Signed in as</p>
              <p className="text-sm dash-heading font-medium truncate mt-0.5">{name || email || "Admin"}</p>
              {email && name && (
                <p className="text-xs dash-muted truncate mt-0.5">{email}</p>
              )}
              {role && (
                <p className="text-xs dash-muted mt-1 uppercase tracking-wide">Role: {role}</p>
              )}
            </div>
            <div className="p-1">
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login", redirect: true })}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--dash-danger)] hover:bg-[var(--dash-danger-soft)] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
