import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC, {
  type IAgoraRTCClient,
  type IMicrophoneAudioTrack,
  type ICameraVideoTrack,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RotateCcw,
  Minimize2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type CallType = "audio" | "video";
type CallState = "connecting" | "ringing" | "connected" | "ended";

interface CallScreenProps {
  callType: CallType;
  channelName: string;
  peerName: string;
  peerAvatar: string;
  onEnd: () => void;
}

export default function CallScreen({ callType, channelName, peerName, peerAvatar, onEnd }: CallScreenProps) {
  const [callState, setCallState] = useState<CallState>("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [duration, setDuration] = useState(0);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<ICameraVideoTrack | null>(null);
  const localVideoElRef = useRef<HTMLDivElement>(null);
  const remoteVideoElRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const joinedRef = useRef(false);
  const currentCameraIdRef = useRef<string>("");

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const cleanup = useCallback(async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (localAudioRef.current) {
      localAudioRef.current.close();
      localAudioRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.close();
      localVideoRef.current = null;
    }
    if (clientRef.current) {
      await clientRef.current.leave().catch(() => {});
      clientRef.current = null;
    }
    joinedRef.current = false;
  }, []);

  const joinCall = useCallback(async () => {
    if (joinedRef.current) return;
    try {
      const tokenRes = await api.post("/live/agora-token", {
        channelName,
        uid: 0,
        role: "publisher",
      });
      const { token, appId } = tokenRes.data;

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoElRef.current) {
          user.videoTrack?.play(remoteVideoElRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
        setRemoteUser(user);
        setCallState("connected");
        if (!durationIntervalRef.current) {
          durationIntervalRef.current = setInterval(() => {
            setDuration((d) => d + 1);
          }, 1000);
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video" && remoteVideoElRef.current) {
          remoteVideoElRef.current.innerHTML = "";
        }
      });

      client.on("user-left", () => {
        setRemoteUser(null);
        setCallState("ended");
        setTimeout(() => {
          cleanup();
          onEnd();
        }, 1500);
      });

      await client.join(appId, channelName, token, null);
      joinedRef.current = true;
      setCallState("ringing");

      const tracks: (IMicrophoneAudioTrack | ICameraVideoTrack)[] = [];
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioRef.current = audioTrack;
      tracks.push(audioTrack);

      if (callType === "video") {
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: { width: 480, height: 640, frameRate: 24 },
        });
        localVideoRef.current = videoTrack;
        tracks.push(videoTrack);
        const mediaSettings = videoTrack.getMediaStreamTrack().getSettings();
        currentCameraIdRef.current = mediaSettings.deviceId || "";
        if (localVideoElRef.current) {
          videoTrack.play(localVideoElRef.current);
        }
      }

      await client.publish(tracks);
    } catch (err) {
      console.error("Call join error:", err);
      setCallState("ended");
      setTimeout(() => {
        cleanup();
        onEnd();
      }, 2000);
    }
  }, [channelName, callType, cleanup, onEnd]);

  useEffect(() => {
    joinCall();
    return () => {
      cleanup();
    };
  }, [joinCall, cleanup]);

  const toggleMute = () => {
    if (localAudioRef.current) {
      localAudioRef.current.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (callType === "audio") return;
    if (localVideoRef.current) {
      if (isVideoOff) {
        await localVideoRef.current.setEnabled(true);
        if (localVideoElRef.current) {
          localVideoRef.current.play(localVideoElRef.current);
        }
      } else {
        await localVideoRef.current.setEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  const switchCamera = async () => {
    if (localVideoRef.current) {
      try {
        const devices = await AgoraRTC.getCameras();
        if (devices.length > 1) {
          const currentId = currentCameraIdRef.current;
          const nextDevice = devices.find((d) => d.deviceId !== currentId) || devices[0];
          await (localVideoRef.current as any).setDevice(nextDevice.deviceId);
          currentCameraIdRef.current = nextDevice.deviceId;
        }
      } catch (err) {
        console.error("Camera switch error:", err);
      }
    }
  };

  const endCall = async () => {
    setCallState("ended");
    await cleanup();
    onEnd();
  };

  const isVideoCall = callType === "video";
  const showRemoteVideo = isVideoCall && remoteUser && callState === "connected";

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col" data-testid="call-screen">
      {isVideoCall && showRemoteVideo ? (
        <div ref={remoteVideoElRef} className="absolute inset-0 bg-black" data-testid="remote-video" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black" />
      )}

      {isVideoCall && !isVideoOff && callState === "connected" && (
        <div
          ref={localVideoElRef}
          className="absolute top-16 right-4 w-28 h-40 rounded-2xl overflow-hidden bg-gray-800 z-20 ring-2 ring-white/20"
          data-testid="local-video"
        />
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="pt-safe px-6 pt-12 flex items-center justify-between">
          <button onClick={endCall} data-testid="button-minimize-call">
            <Minimize2 className="h-6 w-6 text-white/70" />
          </button>
          {callState === "connected" && (
            <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full">
              <span className="text-white text-sm font-mono" data-testid="text-call-duration">
                {formatDuration(duration)}
              </span>
            </div>
          )}
          <div className="w-6" />
        </div>

        {(!showRemoteVideo || callState !== "connected") && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Avatar className="h-28 w-28 ring-4 ring-white/20">
              <AvatarImage src={peerAvatar} />
              <AvatarFallback className="text-3xl bg-gray-700 text-white">{peerName[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-white text-2xl font-bold" data-testid="text-peer-name">{peerName}</h2>
            <p className="text-white/60 text-sm" data-testid="text-call-status">
              {callState === "connecting" && (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </span>
              )}
              {callState === "ringing" && "Ringing..."}
              {callState === "connected" && (isVideoCall ? "Video Call" : formatDuration(duration))}
              {callState === "ended" && "Call Ended"}
            </p>
          </div>
        )}

        {showRemoteVideo && (
          <div className="flex-1" />
        )}

        <div className="pb-safe px-6 pb-12">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleMute}
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center transition-all",
                isMuted ? "bg-white text-gray-900" : "bg-white/15 text-white"
              )}
              data-testid="button-toggle-mute"
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>

            {isVideoCall && (
              <button
                onClick={toggleVideo}
                className={cn(
                  "h-14 w-14 rounded-full flex items-center justify-center transition-all",
                  isVideoOff ? "bg-white text-gray-900" : "bg-white/15 text-white"
                )}
                data-testid="button-toggle-video"
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </button>
            )}

            <button
              onClick={endCall}
              className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center"
              data-testid="button-end-call"
            >
              <PhoneOff className="h-7 w-7 text-white" />
            </button>

            {isVideoCall && (
              <button
                onClick={switchCamera}
                className="h-14 w-14 rounded-full bg-white/15 flex items-center justify-center text-white"
                data-testid="button-switch-camera"
              >
                <RotateCcw className="h-6 w-6" />
              </button>
            )}

            {!isVideoCall && (
              <div className="h-14 w-14" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
