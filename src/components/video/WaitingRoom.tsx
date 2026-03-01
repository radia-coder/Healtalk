"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ILocalVideoTrack } from "agora-rtc-sdk-ng";

type WaitingRoomProps = {
  userName: string;
  videoTrack: ILocalVideoTrack | null;
  isMicMuted: boolean;
  isCameraOff: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onJoin: () => void;
  isJoining: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

export function WaitingRoom({
  userName,
  videoTrack,
  isMicMuted,
  isCameraOff,
  onToggleMic,
  onToggleCamera,
  onJoin,
  isJoining,
  errorMessage,
  onRetry,
}: WaitingRoomProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!previewRef.current || !videoTrack || isCameraOff) return;
    videoTrack.play(previewRef.current);
    return () => {
      videoTrack.stop();
    };
  }, [videoTrack, isCameraOff]);

  return (
    <div className="h-full w-full bg-slate-950 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-white/60">Waiting room</p>
            <h1 className="text-3xl font-semibold">Hi {userName}</h1>
            <p className="text-white/70 mt-2">
              Check your camera and microphone before joining the session.
            </p>
          </div>

          {errorMessage && (
            <div className="space-y-3">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
              {onRetry && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={onRetry}
                >
                  Retry Permissions
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-full border-white/20 text-white hover:bg-white/10"
              onClick={onToggleMic}
              disabled={!videoTrack || !!errorMessage}
            >
              {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-full border-white/20 text-white hover:bg-white/10"
              onClick={onToggleCamera}
              disabled={!videoTrack || !!errorMessage}
            >
              {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
            </Button>
            <Button
              type="button"
              className="h-12 px-6 rounded-full bg-[#5B6CFF] hover:bg-[#4a5ae0]"
              onClick={onJoin}
              disabled={isJoining || !videoTrack || !!errorMessage}
            >
              {isJoining ? "Joining..." : "Join Session"}
            </Button>
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl p-4">
          <div className="text-xs uppercase tracking-wide text-white/50 mb-3">
            Camera preview
          </div>
          <div className="relative bg-black/70 rounded-2xl overflow-hidden aspect-video">
            {isCameraOff ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                Camera off
              </div>
            ) : (
              <div ref={previewRef} className="absolute inset-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
