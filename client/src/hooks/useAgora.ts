import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import api from "@/lib/api";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

export type AgoraMode = "live" | "audio" | "pk";

interface UseAgoraOptions {
  channelName: string;
  isHost: boolean;
  enabled?: boolean;
  mode?: AgoraMode;
}

interface AgoraState {
  localVideoTrack: ICameraVideoTrack | null;
  localAudioTrack: IMicrophoneAudioTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  isJoined: boolean;
  isPublishing: boolean;
  error: string | null;
  isCameraOn: boolean;
  isMicOn: boolean;
}

export function useAgora({ channelName, isHost, enabled = true, mode = "live" }: UseAgoraOptions) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);
  const joinedRef = useRef(false);

  const [state, setState] = useState<AgoraState>({
    localVideoTrack: null,
    localAudioTrack: null,
    remoteUsers: [],
    isJoined: false,
    isPublishing: false,
    error: null,
    isCameraOn: true,
    isMicOn: true,
  });

  const cleanup = useCallback(async () => {
    if (localVideoRef.current) {
      localVideoRef.current.stop();
      localVideoRef.current.close();
      localVideoRef.current = null;
    }
    if (localAudioRef.current) {
      localAudioRef.current.stop();
      localAudioRef.current.close();
      localAudioRef.current = null;
    }
    if (clientRef.current) {
      if (joinedRef.current) {
        await clientRef.current.leave().catch(() => {});
        joinedRef.current = false;
      }
      clientRef.current.removeAllListeners();
      clientRef.current = null;
    }
    setState(prev => ({
      ...prev,
      localVideoTrack: null,
      localAudioTrack: null,
      remoteUsers: [],
      isJoined: false,
      isPublishing: false,
    }));
  }, []);

  useEffect(() => {
    if (!enabled || !channelName || !APP_ID) return;

    let cancelled = false;

    const init = async () => {
      try {
        const isAudioOnly = mode === "audio";
        const agoraMode = mode === "audio" ? "rtc" : "live";
        const role = isHost ? "host" : "audience";

        const client = AgoraRTC.createClient({
          mode: agoraMode,
          codec: "vp8",
        });
        clientRef.current = client;

        if (agoraMode === "live") {
          await client.setClientRole(role);
        }

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (cancelled) return;
          setState(prev => ({
            ...prev,
            remoteUsers: [...client.remoteUsers],
          }));
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", () => {
          if (cancelled) return;
          setState(prev => ({
            ...prev,
            remoteUsers: [...client.remoteUsers],
          }));
        });

        client.on("user-left", () => {
          if (cancelled) return;
          setState(prev => ({
            ...prev,
            remoteUsers: [...client.remoteUsers],
          }));
        });

        const tokenRes = await api.post("/live/agora-token", {
          channelName,
          uid: 0,
          role: isHost ? "publisher" : "subscriber",
        });
        const { token, uid: assignedUid } = tokenRes.data;

        await client.join(APP_ID, channelName, token, assignedUid || 0);
        if (cancelled) return;
        joinedRef.current = true;

        if (isHost) {
          if (isAudioOnly) {
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            if (cancelled) {
              audioTrack.close();
              return;
            }
            localAudioRef.current = audioTrack;
            await client.publish([audioTrack]);

            setState(prev => ({
              ...prev,
              localAudioTrack: audioTrack,
              isJoined: true,
              isPublishing: true,
              isCameraOn: false,
              isMicOn: true,
            }));
          } else {
            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
              {},
              {
                encoderConfig: {
                  width: mode === "pk" ? 480 : 720,
                  height: mode === "pk" ? 640 : 1280,
                  frameRate: 24,
                  bitrateMax: mode === "pk" ? 800 : 1500,
                },
              }
            );

            if (cancelled) {
              audioTrack.close();
              videoTrack.close();
              return;
            }

            localVideoRef.current = videoTrack;
            localAudioRef.current = audioTrack;

            await client.publish([audioTrack, videoTrack]);

            setState(prev => ({
              ...prev,
              localVideoTrack: videoTrack,
              localAudioTrack: audioTrack,
              isJoined: true,
              isPublishing: true,
              isCameraOn: true,
              isMicOn: true,
            }));
          }
        } else {
          setState(prev => ({
            ...prev,
            isJoined: true,
            remoteUsers: [...client.remoteUsers],
          }));
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error("Agora init error:", err);
        setState(prev => ({
          ...prev,
          error: err.message || "Failed to connect to stream",
        }));
      }
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [channelName, isHost, enabled, cleanup, mode]);

  const toggleCamera = useCallback(async () => {
    if (localVideoRef.current) {
      const enabled = localVideoRef.current.enabled;
      await localVideoRef.current.setEnabled(!enabled);
      setState(prev => ({ ...prev, isCameraOn: !enabled }));
    }
  }, []);

  const toggleMic = useCallback(async () => {
    if (localAudioRef.current) {
      const enabled = localAudioRef.current.enabled;
      await localAudioRef.current.setEnabled(!enabled);
      setState(prev => ({ ...prev, isMicOn: !enabled }));
    }
  }, []);

  const leave = useCallback(async () => {
    await cleanup();
  }, [cleanup]);

  const publishAudio = useCallback(async () => {
    if (!clientRef.current || !joinedRef.current) return;
    try {
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioRef.current = audioTrack;
      await clientRef.current.publish([audioTrack]);
      setState(prev => ({
        ...prev,
        localAudioTrack: audioTrack,
        isPublishing: true,
        isMicOn: true,
      }));
    } catch (err: any) {
      console.error("Failed to publish audio:", err);
    }
  }, []);

  const unpublishAudio = useCallback(async () => {
    if (!clientRef.current || !localAudioRef.current) return;
    try {
      await clientRef.current.unpublish([localAudioRef.current]);
      localAudioRef.current.stop();
      localAudioRef.current.close();
      localAudioRef.current = null;
      setState(prev => ({
        ...prev,
        localAudioTrack: null,
        isPublishing: false,
        isMicOn: false,
      }));
    } catch (err: any) {
      console.error("Failed to unpublish audio:", err);
    }
  }, []);

  return {
    ...state,
    toggleCamera,
    toggleMic,
    leave,
    publishAudio,
    unpublishAudio,
  };
}
