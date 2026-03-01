"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle, ShieldOff, Ban, Pencil, Trash2 } from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: "PATIENT" | "PSYCHOLOGIST" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  phone: string | null;
  emailVerified: string | null;
  createdAt: string;
}

const roleTabs = [
  { label: "All", value: "ALL" },
  { label: "Patients", value: "PATIENT" },
  { label: "Psychologists", value: "PSYCHOLOGIST" },
  { label: "Admins", value: "ADMIN" },
];

const statusTabs = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Banned", value: "BANNED" },
];

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-amber-100 text-amber-700",
  BANNED: "bg-red-100 text-red-700",
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const limit = 10;

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    const params = new URLSearchParams({
      role: roleFilter,
      status: statusFilter,
      search: search.trim(),
      page: String(page),
      limit: String(limit),
    });

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to load users.");
      }
      const payload = await res.json();
      setUsers(payload.users || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load users.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 250);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleStatusUpdate = async (id: string, status: AdminUser["status"]) => {
    if (currentUserId && id === currentUserId) {
      setMessage({ type: "error", text: "You cannot change your own status." });
      return;
    }

    setIsUpdating(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to update user.");
      }
      await loadUsers();
      setMessage({ type: "success", text: "User status updated." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update user.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleEdit = async (user: AdminUser) => {
    const name = window.prompt("Update name:", user.name || "") || "";
    const email = window.prompt("Update email:", user.email || "") || "";
    const phone = window.prompt("Update phone:", user.phone || "") || "";

    if (!name && !email && !phone) return;

    setIsUpdating(user.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to update user.");
      }
      await loadUsers();
      setMessage({ type: "success", text: "User updated." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update user.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (currentUserId && id === currentUserId) {
      setMessage({ type: "error", text: "You cannot delete your own account." });
      return;
    }

    if (!window.confirm("Delete this user? This cannot be undone.")) return;

    setIsUpdating(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to delete user.");
      }
      await loadUsers();
      setMessage({ type: "success", text: "User deleted." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete user.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const summary = useMemo(() => {
    if (users.length === 0) return "No users";
    return `${users.length} user${users.length === 1 ? "" : "s"}`;
  }, [users.length]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">User Management</h1>
          <p className="text-gray-500">Manage accounts, statuses, and roles.</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {roleTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setPage(1);
                  setRoleFilter(tab.value);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                  roleFilter === tab.value
                    ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                    : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(tab.value);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                  statusFilter === tab.value
                    ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                    : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="w-full lg:w-[320px]"
          />
          <span className="text-sm text-gray-500">{summary}</span>
        </div>

        {message && (
          <div
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm",
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-700 border-red-100"
            )}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-[#E6EAF2] rounded-[20px] p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-gray-900">
                      {user.name || "Unnamed User"}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">
                      Role: {user.role} · Joined {formatDate(user.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Email verified: {user.emailVerified ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold w-fit",
                        statusStyles[user.status]
                      )}
                    >
                      {user.status}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-2"
                        disabled={isUpdating === user.id}
                        onClick={() => handleStatusUpdate(user.id, "ACTIVE")}
                      >
                        <CheckCircle size={14} /> Activate
                      </Button>
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 gap-2"
                        disabled={isUpdating === user.id}
                        onClick={() => handleStatusUpdate(user.id, "SUSPENDED")}
                      >
                        <ShieldOff size={14} /> Suspend
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 gap-2"
                        disabled={isUpdating === user.id}
                        onClick={() => handleStatusUpdate(user.id, "BANNED")}
                      >
                        <Ban size={14} /> Ban
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        disabled={isUpdating === user.id}
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        disabled={isUpdating === user.id}
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
