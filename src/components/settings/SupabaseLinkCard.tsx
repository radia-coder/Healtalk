"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchCsrfToken } from "@/lib/client-security";
import { signInWithSupabasePassword } from "@/lib/supabase-browser";

type LinkStatus = {
  migrationEnabled: boolean;
  linked: boolean;
  user: {
    email: string;
    authProvider: "NEXTAUTH" | "SUPABASE" | "HYBRID";
    supabaseLinkedAt?: string | null;
  };
};

type Props = {
  compact?: boolean;
};

export default function SupabaseLinkCard({ compact = false }: Props) {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/migration/supabase/status", {
        credentials: "include",
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = (await response.json().catch(() => null)) as LinkStatus | null;
      setStatus(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleLink = async () => {
    if (!status?.user?.email || !password.trim() || linking) return;

    setLinking(true);
    setMessage(null);

    try {
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        setMessage({ type: "error", text: "Could not prepare secure request." });
        setLinking(false);
        return;
      }

      const supabaseSignIn = await signInWithSupabasePassword(
        status.user.email,
        password
      );

      if (!supabaseSignIn.accessToken) {
        setMessage({
          type: "error",
          text: supabaseSignIn.error || "Supabase sign-in failed.",
        });
        setLinking(false);
        return;
      }

      const response = await fetch("/api/auth/migration/supabase/link", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ accessToken: supabaseSignIn.accessToken }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setMessage({
          type: "error",
          text: payload?.error || "Failed to link Supabase account.",
        });
        setLinking(false);
        return;
      }

      setPassword("");
      setMessage({
        type: "success",
        text: payload?.message || "Supabase account linked successfully.",
      });
      await loadStatus();
    } catch {
      setMessage({ type: "error", text: "Failed to link Supabase account." });
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 border border-[#E6EAF2] rounded-xl bg-[#F8FAFF] text-sm text-gray-500">
        Loading Supabase migration status...
      </div>
    );
  }

  if (!status?.migrationEnabled) {
    return (
      <div className="p-4 border border-[#E6EAF2] rounded-xl bg-[#F8FAFF] text-sm text-gray-600">
        Supabase migration is disabled for this environment.
      </div>
    );
  }

  if (status.linked) {
    return (
      <div className="p-4 border border-green-200 rounded-xl bg-green-50">
        <p className="text-sm font-medium text-green-800">
          Supabase is linked to this account.
        </p>
        <p className="text-xs text-green-700 mt-1">
          Provider mode: {status.user.authProvider}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-[#E6EAF2] rounded-xl bg-[#F8FAFF] space-y-3">
      <p className="text-sm font-medium text-gray-900">Link your Supabase account</p>
      <p className="text-xs text-gray-500">
        Email: {status.user.email}. Enter your Supabase password to link safely.
      </p>

      <Input
        type="password"
        placeholder="Supabase password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <div className={compact ? "" : "flex justify-end"}>
        <Button
          type="button"
          onClick={handleLink}
          disabled={linking || !password.trim()}
          className="bg-[#5B6CFF] hover:bg-[#4a5ae0]"
        >
          {linking ? "Linking..." : "Link Supabase"}
        </Button>
      </div>

      {message && (
        <div
          className={`text-xs p-3 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
