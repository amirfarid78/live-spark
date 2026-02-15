import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import api from "@/lib/api";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

interface UseAgoraOptions {
  channelName: string;
  isHost: boolean;
  enabled?: boolean;
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

export function useAgora({ channelName, isHost, enabled = true }: UseAgoraOptions) {
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
        const role = isHost ? "host" : "audience";
        const client = AgoraRTC.createClient({
          mode: "live",
          codec: "vp8",
        });
        clientRef.current = client;

        await client.setClientRole(role);

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (cancelled) return;
          setState(prev => ({
            ...prev,
            remoteUsers: [...client.remoteUsers],
          }));
          if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack?.play();
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
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
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            {},
            {
              encoderConfig: {
                width: 720,
                height: 1280,
                frameRate: 24,
                bitrateMax: 1500,
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
  }, [channelName, isHost, enabled, cleanup]);

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

  return {
    ...state,
    toggleCamera,
    toggleMic,
    leave,
  };
}
