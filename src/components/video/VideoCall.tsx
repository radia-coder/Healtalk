"use client";

import { useEffect, useRef, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitingRoom } from "@/components/video/WaitingRoom";

// ─── Error code → human-readable message map ─────────────────────────────────

const AGORA_ERROR_MESSAGES: Record<string, string> = {
  UID_CONFLICT:
    "This session is already active in another tab or window. Please close other instances and try again.",
  INVALID_TOKEN:
    "Authentication failed. Please refresh the page and try again.",
  CAN_NOT_GET_GATEWAY_SERVER:
    "Authentication failed. Please refresh the page and try again.",
};

// ─── Types ────────────────────────────────────────────────────────────────────

const createClient = () =>
  AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

type VideoCallProps = {
  appointmentId: string;
  userAccount: string;
  userName: string;
};

type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed";

type RemoteParticipant = {
  uid: string | number;
  user: IAgoraRTCRemoteUser;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Renders a remote participant's video tile. */
const VideoTile = ({ user }: { user: IAgoraRTCRemoteUser }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || !user.videoTrack) return;
    user.videoTrack.play(ref.current);
    return () => {
      user.videoTrack?.stop();
    };
  }, [user.videoTrack]);

  return (
    <div className="relative bg-black/70 rounded-2xl overflow-hidden aspect-video">
      <div ref={ref} className="absolute inset-0" />
      <div className="absolute bottom-3 left-3 text-xs text-white/80 bg-black/40 px-2 py-1 rounded-md">
        Guest
      </div>
    </div>
  );
};

/** Formats an elapsed-seconds counter as MM:SS. */
const formatElapsed = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remaining
    .toString()
    .padStart(2, "0")}`;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetches an Agora RTC token from our backend for the given appointment.
 * Returns the appId, token, and channelName from the server.
 */
async function fetchAgoraToken(
  appointmentId: string
): Promise<{ appId: string; token: string; channelName: string }> {
  const res = await fetch("/api/agora/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to get call token");
  }

  return res.json();
}

/**
 * Registers all Agora event listeners on the client.
 * Separated from joinCall() to keep that function readable.
 */
function setupAgoraEventListeners(
  client: IAgoraRTCClient,
  setRemoteUsers: React.Dispatch<React.SetStateAction<RemoteParticipant[]>>,
  setConnectionState: React.Dispatch<React.SetStateAction<ConnectionState>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setNetworkQuality: React.Dispatch<
    React.SetStateAction<{ uplink: number; downlink: number } | null>
  >
) {
  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "video") {
      setRemoteUsers((prev) => {
        if (prev.some((e) => e.uid === user.uid)) return prev;
        return [...prev, { uid: user.uid, user }];
      });
    }
    if (mediaType === "audio") {
      user.audioTrack?.play();
    }
  });

  client.on("user-unpublished", (user, mediaType) => {
    if (mediaType === "video") {
      setRemoteUsers((prev) => prev.filter((e) => e.uid !== user.uid));
    }
    if (mediaType === "audio") {
      user.audioTrack?.stop();
    }
  });

  client.on("user-left", (user) => {
    setRemoteUsers((prev) => prev.filter((e) => e.uid !== user.uid));
  });

  client.on("connection-state-change", (curState, _prevState, reason) => {
    if (curState === "RECONNECTING") { setConnectionState("reconnecting"); return; }
    if (curState === "CONNECTING")   { setConnectionState("connecting");   return; }
    if (curState === "CONNECTED")    {
      setConnectionState("connected");
      setErrorMessage(null);
      return;
    }
    if (curState === "DISCONNECTED") {
      setConnectionState("failed");
      if (reason) setErrorMessage(`Connection lost: ${reason}`);
    }
  });

  client.on("network-quality", (stats) => {
    setNetworkQuality({
      uplink: stats.uplinkNetworkQuality,
      downlink: stats.downlinkNetworkQuality,
    });
  });
}

/**
 * Publishes the local audio and video tracks to the channel.
 * Applies current mute state before publishing so the user's
 * initial mute preferences are respected.
 */
async function publishLocalTracks(
  client: IAgoraRTCClient,
  audioTrack: ILocalAudioTrack,
  videoTrack: ILocalVideoTrack,
  isMicMuted: boolean,
  isCameraOff: boolean
) {
  await audioTrack.setEnabled(!isMicMuted);
  await videoTrack.setEnabled(!isCameraOff);
  await client.publish([audioTrack, videoTrack]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VideoCall({ appointmentId, userAccount, userName }: VideoCallProps) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteParticipant[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [networkQuality, setNetworkQuality] = useState<{
    uplink: number;
    downlink: number;
  } | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Refs track the latest tracks for cleanup — avoids stale closure issues.
  const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Acquire camera + mic when the component mounts (or when the user retries).
  useEffect(() => {
    let isActive = true;

    const setupPreview = async () => {
      try {
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();

        if (!isActive) {
          audioTrack.close();
          videoTrack.close();
          return;
        }

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        setErrorMessage(null);
      } catch (error) {
        console.error("Preview setup error:", error);
        if (!isActive) return;

        const isPermissionError =
          error instanceof Error &&
          (error.name === "NotAllowedError" ||
            error.message.includes("Permission") ||
            error.message.includes("PERMISSION_DENIED"));

        setErrorMessage(
          isPermissionError
            ? "Camera and microphone access denied. Please click the camera icon in your browser's address bar and allow permissions, then refresh the page."
            : "Unable to access camera or microphone. Please check that they are connected and not being used by another application."
        );
      }
    };

    setupPreview();
    return () => { isActive = false; };
  }, [retryKey]);

  // Play the local video preview in the waiting room.
  useEffect(() => {
    if (!localVideoRef.current || !localVideoTrack || !hasJoined) return;
    localVideoTrack.play(localVideoRef.current);
    return () => { localVideoTrack.stop(); };
  }, [localVideoTrack, hasJoined]);

  // Keep refs in sync so cleanup effects always have the latest tracks.
  useEffect(() => { localAudioTrackRef.current = localAudioTrack; }, [localAudioTrack]);
  useEffect(() => { localVideoTrackRef.current = localVideoTrack; }, [localVideoTrack]);
  useEffect(() => { screenTrackRef.current = screenTrack; }, [screenTrack]);

  // Call duration timer — starts when the user joins.
  useEffect(() => {
    if (!hasJoined) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [hasJoined]);

  // Full cleanup when the component unmounts.
  useEffect(() => {
    return () => {
      const client = clientRef.current;
      if (client) {
        client.removeAllListeners();
        client.leave().catch(() => null);
      }
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      screenTrackRef.current?.close();
    };
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const retryPermissions = () => {
    localAudioTrack?.close();
    localVideoTrack?.close();
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setErrorMessage(null);
    setRetryKey((prev) => prev + 1);
  };

  const toggleMic = async () => {
    if (!localAudioTrack) return;
    const next = !isMicMuted;
    await localAudioTrack.setEnabled(!next);
    setIsMicMuted(next);
  };

  const toggleCamera = async () => {
    if (!localVideoTrack) return;
    const next = !isCameraOff;
    await localVideoTrack.setEnabled(!next);
    setIsCameraOff(next);
  };

  const stopScreenShare = async () => {
    const client = clientRef.current;
    if (!client || !screenTrack) return;
    await client.unpublish(screenTrack);
    screenTrack.close();
    if (localVideoTrack) await client.publish(localVideoTrack);
    setScreenTrack(null);
    setIsScreenSharing(false);
  };

  const startScreenShare = async () => {
    const client = clientRef.current;
    if (!client || !localVideoTrack) return;
    const track = await AgoraRTC.createScreenVideoTrack(
      { encoderConfig: "1080p_1" },
      "disable"
    );
    await client.unpublish(localVideoTrack);
    await client.publish(track);
    track.on("track-ended", () => { stopScreenShare().catch(() => null); });
    setScreenTrack(track);
    setIsScreenSharing(true);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) { await stopScreenShare(); return; }
    await startScreenShare();
  };

  /** Fetches the token, connects to Agora, and publishes local tracks. */
  const joinCall = async () => {
    if (hasJoined || isJoining) return;
    setIsJoining(true);
    setConnectionState("connecting");
    setErrorMessage(null);

    try {
      // Leave any previous session before starting a new one.
      const existingClient = clientRef.current;
      if (existingClient && existingClient.connectionState !== "DISCONNECTED") {
        try {
          await existingClient.leave();
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (e) {
          console.warn("Failed to leave previous session:", e);
        }
        clientRef.current = null;
      }

      // Ensure local tracks are ready before joining.
      if (!localAudioTrack || !localVideoTrack) {
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
      }

      const { appId, token, channelName } = await fetchAgoraToken(appointmentId);

      const newClient = createClient();
      clientRef.current = newClient;

      setupAgoraEventListeners(
        newClient,
        setRemoteUsers,
        setConnectionState,
        setErrorMessage,
        setNetworkQuality
      );

      await newClient.join(appId, channelName, token, userAccount);

      if (localAudioTrack && localVideoTrack) {
        await publishLocalTracks(
          newClient,
          localAudioTrack,
          localVideoTrack,
          isMicMuted,
          isCameraOff
        );
      }

      setHasJoined(true);
      setConnectionState("connected");
    } catch (error) {
      console.error("Agora call setup error:", error);
      setConnectionState("failed");

      if (error instanceof Error) {
        const knownMessage = Object.entries(AGORA_ERROR_MESSAGES).find(
          ([code]) => error.message.includes(code)
        )?.[1];
        setErrorMessage(knownMessage ?? error.message);
      } else {
        setErrorMessage("Unable to join call");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const leaveCall = async () => {
    const client = clientRef.current;
    if (client) {
      client.removeAllListeners();
      await client.leave();
    }
    clientRef.current = null;
    screenTrack?.close();
    localAudioTrack?.close();
    localVideoTrack?.close();
    setScreenTrack(null);
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setRemoteUsers([]);
    setHasJoined(false);
    setElapsedSeconds(0);
    setConnectionState("idle");
    setIsScreenSharing(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!hasJoined) {
    return (
      <WaitingRoom
        userName={userName}
        videoTrack={localVideoTrack}
        isMicMuted={isMicMuted}
        isCameraOff={isCameraOff}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onJoin={joinCall}
        isJoining={isJoining}
        errorMessage={errorMessage}
        onRetry={retryPermissions}
      />
    );
  }

  const qualityScore = networkQuality
    ? Math.max(networkQuality.uplink, networkQuality.downlink)
    : null;
  const qualityLabel =
    qualityScore === null ? "—"
    : qualityScore <= 2 ? "Good"
    : qualityScore <= 4 ? "Fair"
    : "Poor";

  const statusLabel =
    connectionState === "reconnecting" ? "Reconnecting..."
    : connectionState === "connecting"  ? "Connecting..."
    : connectionState === "failed"      ? "Connection issue"
    : "Live";

  return (
    <div className="h-full w-full bg-slate-950 text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <div className="text-sm text-white/60">HealTalk Session</div>
          <div className="text-lg font-semibold">{userName}</div>
        </div>
        <div className="text-xs text-white/70 flex items-center gap-4">
          <span className="rounded-full bg-emerald-500/20 text-emerald-200 px-2 py-1">
            {statusLabel}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-1">
            Quality: {qualityLabel}
          </span>
          <span>{formatElapsed(elapsedSeconds)}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {remoteUsers.length === 0 ? (
            <div className="bg-white/5 rounded-2xl flex items-center justify-center text-white/60">
              Waiting for participant to join...
            </div>
          ) : (
            remoteUsers.map((entry) => (
              <VideoTile key={entry.uid} user={entry.user} />
            ))
          )}
        </div>
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col">
          <div className="text-xs uppercase tracking-wide text-white/50 mb-2">
            Your camera
          </div>
          <div className="relative bg-black/70 rounded-2xl overflow-hidden aspect-video">
            <div ref={localVideoRef} className="absolute inset-0" />
          </div>
          {connectionState === "reconnecting" && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Connection interrupted. Attempting to reconnect...
            </div>
          )}
          {connectionState === "failed" && errorMessage && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 border-t border-white/10 flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-12 rounded-full border-white/20 text-white hover:bg-white/10"
          onClick={toggleMic}
          disabled={!localAudioTrack}
        >
          {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-12 rounded-full border-white/20 text-white hover:bg-white/10"
          onClick={toggleCamera}
          disabled={!localVideoTrack}
        >
          {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-12 rounded-full border-white/20 text-white hover:bg-white/10"
          onClick={toggleScreenShare}
          disabled={!localVideoTrack}
        >
          <Share2 size={18} />
        </Button>
        <Button
          type="button"
          className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600"
          onClick={leaveCall}
        >
          <PhoneOff size={18} />
        </Button>
      </div>
    </div>
  );
}
