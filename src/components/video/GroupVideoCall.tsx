"use client";

import { useEffect, useState, useRef } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GroupVideoCallProps {
  sessionId: string;
  isHost: boolean;
  onLeave: () => void;
}

export function GroupVideoCall({ sessionId, isHost, onLeave }: GroupVideoCallProps) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Map<string, IAgoraRTCRemoteUser>>(new Map());

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const screenShareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        // Fetch Agora token
        const res = await fetch("/api/agora/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          throw new Error("Failed to get Agora token");
        }

        const { appId, token, channelName } = await res.json();

        // Create Agora client
        const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = agoraClient;

        // Set up event listeners
        agoraClient.on("user-published", async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType);

          setRemoteUsers((prev) => {
            const updated = new Map(prev);
            updated.set(user.uid.toString(), user);
            return updated;
          });

          if (mediaType === "video") {
            const remoteVideoTrack = user.videoTrack;
            const playerContainer = document.getElementById(`remote-${user.uid}`);
            if (playerContainer) {
              remoteVideoTrack?.play(playerContainer);
            }
          }

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        agoraClient.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video") {
            const playerContainer = document.getElementById(`remote-${user.uid}`);
            if (playerContainer) {
              playerContainer.innerHTML = "";
            }
          }
        });

        agoraClient.on("user-left", (user) => {
          setRemoteUsers((prev) => {
            const updated = new Map(prev);
            updated.delete(user.uid.toString());
            return updated;
          });
        });

        // Join channel
        await agoraClient.join(appId, channelName, token, null);

        // Create local tracks
        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack(),
        ]);

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        // Play local video
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        // Publish tracks
        await agoraClient.publish([audioTrack, videoTrack]);
      } catch (err: unknown) {
        console.error("Failed to initialize Agora client:", err);
        setError(err instanceof Error ? err.message : "Failed to join video call");
      }
    };

    initClient();

    return () => {
      // Cleanup
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      void clientRef.current?.leave();
      clientRef.current = null;
    };
  }, [sessionId]);

  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleScreenShare = async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      if (!isScreenSharing) {
        // Disable audio to ensure we get a single video track, not an array
        const screenTrack = (await AgoraRTC.createScreenVideoTrack(
          {},
          "disable"
        )) as ILocalVideoTrack;

        if (localVideoTrackRef.current) {
          await client.unpublish([localVideoTrackRef.current]);
        }

        await client.publish([screenTrack]);
        screenTrackRef.current = screenTrack;

        if (screenShareRef.current) {
          screenTrack.play(screenShareRef.current);
        }

        setIsScreenSharing(true);
      } else {
        // Stop screen sharing and resume camera
        if (screenTrackRef.current) {
          await client.unpublish([screenTrackRef.current]);
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }
        if (localVideoTrackRef.current) {
          await client.publish([localVideoTrackRef.current]);
          if (localVideoRef.current) {
            localVideoTrackRef.current.play(localVideoRef.current);
          }
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error("Error toggling screen share:", err);
    }
  };

  const handleLeave = async () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current.close();
      screenTrackRef.current = null;
    }
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    await clientRef.current?.leave();
    clientRef.current = null;
    onLeave();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Failed to join call</p>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={onLeave} variant="outline">
            Return
          </Button>
        </div>
      </div>
    );
  }

  const totalParticipants = remoteUsers.size + 1; // +1 for local user
  const gridCols = totalParticipants <= 2 ? 1 : totalParticipants <= 4 ? 2 : 3;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div
          className={cn(
            "grid gap-4 h-full",
            gridCols === 1 && "grid-cols-1",
            gridCols === 2 && "grid-cols-2",
            gridCols === 3 && "grid-cols-3"
          )}
        >
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <div
              ref={isScreenSharing ? screenShareRef : localVideoRef}
              className="w-full h-full"
            />
            {!isVideoEnabled && !isScreenSharing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">You</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
              <span className="text-white text-sm">
                You {isHost && "(Host)"}
              </span>
            </div>
            {!isAudioEnabled && (
              <div className="absolute top-4 left-4 bg-red-500 p-2 rounded-full">
                <MicOff size={16} className="text-white" />
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {Array.from(remoteUsers.entries()).map(([uid, user]) => (
            <div key={uid} className="relative bg-gray-800 rounded-lg overflow-hidden">
              <div id={`remote-${uid}`} className="w-full h-full" />
              {!user.hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
                    <Users size={32} className="text-gray-400" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
                <span className="text-white text-sm">Participant {uid}</span>
              </div>
              {!user.hasAudio && (
                <div className="absolute top-4 left-4 bg-red-500 p-2 rounded-full">
                  <MicOff size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "outline" : "destructive"}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </Button>

        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "outline" : "destructive"}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </Button>

        {isHost && (
          <Button
            onClick={toggleScreenShare}
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
          </Button>
        )}

        <Button
          onClick={handleLeave}
          variant="destructive"
          size="lg"
          className="rounded-full w-14 h-14"
        >
          <Phone size={24} />
        </Button>

        <div className="ml-4 text-white">
          <Users size={20} className="inline mr-2" />
          {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
