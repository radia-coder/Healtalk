"use client";

import { PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VideoCallPanelProps {
  /** The appointment ID that maps to an Agora channel. */
  roomName: string;
  onEndCall: () => void;
}

/**
 * VideoCallPanel — shown inside the messages sidebar when a call is active.
 *
 * How video calls work in HealTalk:
 * The actual call UI lives at /call/[appointmentId] (Agora WebRTC).
 * This panel is a lightweight wrapper that navigates the user to that page.
 * We don't embed the call inline here to keep the messaging layout clean and
 * to avoid managing Agora lifecycle inside the messages route.
 */
export function VideoCallPanel({ roomName, onEndCall }: VideoCallPanelProps) {
  const router = useRouter();

  const handleJoinCall = () => {
    router.push(`/call/${roomName}`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[16px] border border-[#E6EAF2] shadow-[0_8px_24px_rgba(17,24,39,0.02)] overflow-hidden">
      {/* Panel Header */}
      <div className="h-[64px] border-b border-[#E6EAF2] px-6 flex items-center justify-between flex-shrink-0">
        <h3 className="font-bold text-gray-900 text-lg">Video Call</h3>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-700">Ready</span>
        </div>
      </div>

      {/* Call prompt */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-gray-50">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Video size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 text-lg mb-1">Join Video Session</p>
          <p className="text-sm text-gray-500">
            Click below to open the secure video call in full screen.
          </p>
        </div>
        <Button
          onClick={handleJoinCall}
          className="px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          <Video size={18} className="mr-2" />
          Join Call
        </Button>
      </div>

      {/* End call button */}
      <div className="h-[80px] border-t border-[#E6EAF2] bg-white flex items-center justify-center flex-shrink-0">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
          onClick={onEndCall}
        >
          <PhoneOff size={24} className="text-white" />
        </Button>
      </div>
    </div>
  );
}
