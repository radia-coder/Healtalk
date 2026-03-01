"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GroupVideoCall } from "@/components/video/GroupVideoCall";
import { Loader2 } from "lucide-react";

export default function SessionCallPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setSessionId(p.sessionId);
      verifyAccess(p.sessionId);
    });
  }, [params]);

  async function verifyAccess(id: string) {
    try {
      // Fetch session details
      const sessionRes = await fetch(`/api/sessions/${id}`);

      if (!sessionRes.ok) {
        setError("Session not found");
        setLoading(false);
        return;
      }

      const { session } = await sessionRes.json();

      if (session.status !== "SCHEDULED" && session.status !== "IN_PROGRESS") {
        setError("This session is not active");
        setLoading(false);
        return;
      }

      // Try to get Agora token to verify authorization
      const tokenRes = await fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });

      if (!tokenRes.ok) {
        setError("You are not authorized to join this session");
        setLoading(false);
        return;
      }

      const tokenData = await tokenRes.json();
      setIsHost(tokenData.isHost);
      setIsAuthorized(true);
    } catch (err) {
      console.error("Error verifying access:", err);
      setError("Failed to verify session access");
    } finally {
      setLoading(false);
    }
  }

  function handleLeave() {
    router.push("/patient/dashboard/sessions");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (error || !isAuthorized || !sessionId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error || "Unable to join session"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-white text-gray-900 rounded-full hover:bg-gray-100"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <GroupVideoCall sessionId={sessionId} isHost={isHost} onLeave={handleLeave} />;
}
