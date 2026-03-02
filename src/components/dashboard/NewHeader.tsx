"use client";

import { Bell, Menu, LogOut, Settings, User, MessageSquare, Calendar, ChevronRight, Sun, Moon, Monitor } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTheme } from "next-themes";

interface NewHeaderProps {
  onMobileMenuClick: () => void;
}

const roleLabels = {
  PATIENT: "Patient",
  PSYCHOLOGIST: "Psychologist",
  ADMIN: "Administrator",
};

const roleLinks = {
  PATIENT: {
    profile: "/patient/dashboard/settings",
    settings: "/patient/dashboard/settings",
    messages: "/patient/dashboard/messages",
  },
  PSYCHOLOGIST: {
    profile: "/psychologist/dashboard/profile",
    settings: "/psychologist/dashboard/settings",
    messages: "/psychologist/dashboard/messages",
  },
  ADMIN: {
    profile: "/admin/dashboard/settings",
    settings: "/admin/dashboard/settings",
    messages: "/admin/dashboard",
  },
};

const splitName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const lastName = parts.pop() || "";
  return { firstName: parts.join(" "), lastName };
};

const getInitials = (firstName: string, lastName: string) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();
  return initials ? initials.toUpperCase() : "U";
};

interface Notification {
  id: string;
  icon: "message" | "calendar" | "bell";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

function buildNotifications(unreadMessages: number): Notification[] {
  const list: Notification[] = [];

  if (unreadMessages > 0) {
    list.push({
      id: "msg-unread",
      icon: "message",
      title: "New messages",
      body: `You have ${unreadMessages} unread message${unreadMessages > 1 ? "s" : ""}.`,
      time: "Just now",
      unread: true,
    });
  }

  if (list.length === 0) {
    list.push({
      id: "tip-1",
      icon: "calendar",
      title: "No new notifications",
      body: "You're all caught up! Check back later.",
      time: "",
      unread: false,
    });
  }

  return list;
}

export function NewHeader({ onMobileMenuClick }: NewHeaderProps) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, setTheme } = useTheme();

  const userName = session?.user?.name || session?.user?.email || "User";
  const { firstName, lastName } = splitName(userName);
  const userRole = (session?.user?.role || "PATIENT") as keyof typeof roleLabels;
  const roleLabel = roleLabels[userRole] || "User";
  const links = roleLinks[userRole] || roleLinks.PATIENT;

  const notifications = buildNotifications(unreadCount);
  const totalUnread = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread");
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(Number(data?.count || 0));
      } catch {
        setUnreadCount(0);
      }
    };

    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const notifIconMap = {
    message: <MessageSquare size={14} className="text-[var(--dash-primary)]" />,
    calendar: <Calendar size={14} className="text-[var(--dash-accent)]" />,
    bell: <Bell size={14} className="text-[var(--dash-warning)]" />,
  };

  const themeMode = theme === "light" || theme === "dark" ? theme : "system";
  const themeIcon = themeMode === "system"
    ? <Monitor size={16} />
    : themeMode === "dark"
      ? <Moon size={16} />
      : <Sun size={16} />;

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 bg-[var(--dash-surface)] border-[var(--dash-border)]">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden dash-muted hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elev)]"
          onClick={onMobileMenuClick}
        >
          <Menu size={24} />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full w-9 h-9 bg-[var(--dash-surface-elev)] hover:bg-[var(--dash-chip)] text-[var(--dash-text)] border border-[var(--dash-border)]"
              aria-label="Theme mode"
            >
              {themeIcon}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="w-[170px] rounded-xl border shadow-xl z-50 overflow-hidden bg-[var(--dash-surface)] border-[var(--dash-border)]"
            >
              <DropdownMenu.Item className="outline-none" onSelect={() => setTheme("light")}>
                <div className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-[var(--dash-surface-elev)] text-[var(--dash-text)]">
                  <Sun size={14} />
                  Light
                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="outline-none" onSelect={() => setTheme("dark")}>
                <div className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-[var(--dash-surface-elev)] text-[var(--dash-text)]">
                  <Moon size={14} />
                  Dark
                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="outline-none" onSelect={() => setTheme("system")}>
                <div className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-[var(--dash-surface-elev)] text-[var(--dash-text)]">
                  <Monitor size={14} />
                  System
                </div>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full w-9 h-9 bg-[var(--dash-surface-elev)] hover:bg-[var(--dash-chip)] text-[var(--dash-text)] border border-[var(--dash-border)] relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--dash-danger)] text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-[var(--dash-surface)]">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="w-[min(320px,calc(100vw-1rem))] rounded-2xl border shadow-xl z-50 overflow-hidden bg-[var(--dash-surface)] border-[var(--dash-border)]"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--dash-border)]">
                <span className="text-sm font-bold text-[var(--dash-text)]">Notifications</span>
                {totalUnread > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-[var(--dash-danger)] border-[var(--dash-danger)] bg-[var(--dash-danger-soft)]">
                    {totalUnread} new
                  </span>
                )}
              </div>

              <div className="divide-y max-h-[320px] overflow-y-auto divide-[var(--dash-border)]">
                {notifications.map((n) => (
                  <DropdownMenu.Item key={n.id} asChild className="outline-none">
                    <Link
                      href={links.messages}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-[var(--dash-surface-elev)] ${n.unread ? "bg-[var(--dash-primary-soft)]" : ""}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--dash-surface-elev)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {notifIconMap[n.icon]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight text-[var(--dash-text)]">{n.title}</p>
                        <p className="text-xs mt-0.5 leading-snug text-[var(--dash-text-muted)]">{n.body}</p>
                        {n.time && <p className="text-[11px] mt-1 text-[var(--dash-text-muted)] opacity-80">{n.time}</p>}
                      </div>
                      {n.unread && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 bg-[var(--dash-primary)]" />
                      )}
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </div>

              <div className="px-4 py-2.5 border-t border-[var(--dash-border)]">
                <Link
                  href={links.messages}
                  className="flex items-center justify-between text-xs font-semibold transition-colors text-[var(--dash-primary)] hover:opacity-80"
                >
                  <span>View all messages</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="hidden md:flex items-center gap-3 pl-3 border-l hover:opacity-80 transition-opacity cursor-pointer focus:outline-none border-[var(--dash-border)]"
              aria-label="User menu"
            >
              <Avatar className="w-10 h-10 border border-[var(--dash-border)]">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="text-white text-sm font-semibold bg-[var(--dash-primary)]">
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold leading-none text-[var(--dash-text)]">{firstName || userName}</span>
                <span className="text-xs mt-1 text-[var(--dash-text-muted)]">{roleLabel}</span>
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="w-[220px] rounded-2xl border shadow-xl z-50 overflow-hidden bg-[var(--dash-surface)] border-[var(--dash-border)]"
            >
              <div className="px-4 py-3 border-b border-[var(--dash-border)]">
                <p className="text-sm font-bold truncate text-[var(--dash-text)]">{userName}</p>
                <p className="text-xs text-[var(--dash-text-muted)]">{roleLabel}</p>
              </div>

              <div className="py-1.5">
                <DropdownMenu.Item asChild className="outline-none">
                  <Link
                    href={links.profile}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-[var(--dash-text)] hover:bg-[var(--dash-surface-elev)]"
                  >
                    <User size={15} className="text-[var(--dash-text-muted)]" />
                    Profile
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild className="outline-none">
                  <Link
                    href={links.settings}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-[var(--dash-text)] hover:bg-[var(--dash-surface-elev)]"
                  >
                    <Settings size={15} className="text-[var(--dash-text-muted)]" />
                    Settings
                  </Link>
                </DropdownMenu.Item>
              </div>

              <DropdownMenu.Separator className="h-px mx-0 bg-[var(--dash-border)]" />

              <div className="py-1.5">
                <DropdownMenu.Item
                  className="outline-none"
                  onSelect={() => signOut({ callbackUrl: "/login" })}
                >
                  <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--dash-danger)] hover:bg-[var(--dash-danger-soft)] transition-colors cursor-pointer">
                    <LogOut size={15} className="text-[var(--dash-danger)]" />
                    Log out
                  </div>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="md:hidden focus:outline-none" aria-label="User menu">
              <Avatar className="w-9 h-9 border border-[var(--dash-border)]">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="text-white text-xs font-semibold bg-[var(--dash-primary)]">
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="w-[200px] rounded-2xl border shadow-xl z-50 overflow-hidden bg-[var(--dash-surface)] border-[var(--dash-border)]"
            >
              <div className="px-4 py-3 border-b border-[var(--dash-border)]">
                <p className="text-sm font-bold truncate text-[var(--dash-text)]">{userName}</p>
                <p className="text-xs text-[var(--dash-text-muted)]">{roleLabel}</p>
              </div>

              <div className="py-1.5">
                <DropdownMenu.Item asChild className="outline-none">
                  <Link
                    href={links.settings}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer text-[var(--dash-text)] hover:bg-[var(--dash-surface-elev)]"
                  >
                    <Settings size={15} className="text-[var(--dash-text-muted)]" />
                    Settings
                  </Link>
                </DropdownMenu.Item>
              </div>

              <DropdownMenu.Separator className="h-px bg-[var(--dash-border)]" />

              <div className="py-1.5">
                <DropdownMenu.Item
                  className="outline-none"
                  onSelect={() => signOut({ callbackUrl: "/login" })}
                >
                  <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--dash-danger)] hover:bg-[var(--dash-danger-soft)] cursor-pointer">
                    <LogOut size={15} className="text-[var(--dash-danger)]" />
                    Log out
                  </div>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
