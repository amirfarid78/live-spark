import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  X, RotateCcw, Zap, ZapOff, Timer, Camera, SwitchCamera,
  Sparkles, ChevronDown, Music, Gauge
} from "lucide-react";

interface VideoRecorderProps {
  onVideoRecorded: (blob: Blob, duration: number) => void;
  onClose: () => void;
}

type SpeedOption = 0.3 | 0.5 | 1 | 2 | 3;
type TimerOption = 0 | 3 | 10;

const SPEED_OPTIONS: SpeedOption[] = [0.3, 0.5, 1, 2, 3];
const SPEED_LABELS: Record<number, string> = { 0.3: "0.3x", 0.5: "0.5x", 1: "1x", 2: "2x", 3: "3x" };
const TIMER_OPTIONS: TimerOption[] = [0, 3, 10];
const MAX_DURATION = 60;

export function VideoRecorder({ onVideoRecorded, onClose }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState<SpeedOption>(1);
  const [selectedTimer, setSelectedTimer] = useState<TimerOption>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSpeedPanel, setShowSpeedPanel] = useState(false);
  const [showTimerPanel, setShowTimerPanel] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("none");
  const [showFilters, setShowFilters] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const filters = [
    { id: "none", label: "Normal", css: "" },
    { id: "warm", label: "Warm", css: "sepia(0.3) saturate(1.4) brightness(1.05)" },
    { id: "cool", label: "Cool", css: "saturate(0.8) hue-rotate(20deg) brightness(1.05)" },
    { id: "vintage", label: "Vintage", css: "sepia(0.5) contrast(1.1) brightness(0.95)" },
    { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.2)" },
    { id: "vivid", label: "Vivid", css: "saturate(1.8) contrast(1.1) brightness(1.05)" },
    { id: "dramatic", label: "Drama", css: "contrast(1.4) saturate(0.8) brightness(0.9)" },
    { id: "beauty", label: "Beauty", css: "brightness(1.1) contrast(0.95) saturate(1.1) blur(0.3px)" },
    { id: "sunset", label: "Sunset", css: "sepia(0.2) saturate(1.5) hue-rotate(-10deg) brightness(1.05)" },
    { id: "neon", label: "Neon", css: "saturate(2) contrast(1.3) brightness(1.1)" },
  ];

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);

      if (flashEnabled) {
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.();
        if (capabilities && 'torch' in capabilities) {
          await track.applyConstraints({ advanced: [{ torch: true } as any] });
        }
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      if (err?.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera permission and try again.");
      } else if (err?.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Could not access camera. Try uploading a video instead.");
      }
    }
  }, [facingMode, flashEnabled]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [startCamera]);

  const renderFilteredFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isRecording) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;

    const filter = filters.find(f => f.id === activeFilter);
    ctx.filter = filter?.css || "none";

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    animationRef.current = requestAnimationFrame(renderFilteredFrame);
  }, [isRecording, activeFilter, facingMode]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = videoRef.current?.videoWidth || 1080;
    canvas.height = videoRef.current?.videoHeight || 1920;

    const canvasStream = canvas.captureStream(30);
    const audioTracks = streamRef.current.getAudioTracks();
    audioTracks.forEach(t => canvasStream.addTrack(t));

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

    const recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: 4000000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      onVideoRecorded(blob, recordingTime);
    };

    mediaRecorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);

    animationRef.current = requestAnimationFrame(renderFilteredFrame);

    timerIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_DURATION) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [renderFilteredFrame, onVideoRecorded, recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRecording(false);
  }, []);

  const handleRecordPress = useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (selectedTimer > 0) {
      setCountdown(selectedTimer);
      let remaining = selectedTimer;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownRef.current!);
          setCountdown(null);
          startRecording();
        }
      }, 1000);
    } else {
      startRecording();
    }
  }, [isRecording, selectedTimer, startRecording, stopRecording]);

  const handleFlipCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (cameraError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6" data-testid="camera-error">
        <div className="text-center max-w-sm">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Camera className="h-10 w-10 text-white/50" />
          </div>
          <h2 className="text-white text-xl font-bold mb-3">Camera Unavailable</h2>
          <p className="text-white/60 mb-8">{cameraError}</p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => { setCameraError(null); startCamera(); }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
              data-testid="button-retry-camera"
            >
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full border-white/20 text-white" data-testid="button-back-from-error">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" data-testid="video-recorder">
      <canvas ref={canvasRef} className="hidden" />

      {isRecording && (
        <div className="absolute top-0 left-0 right-0 z-30">
          <div className="h-1 bg-white/20 w-full">
            <div 
              className="h-full bg-stream-coral transition-all duration-1000 ease-linear"
              style={{ width: `${(recordingTime / MAX_DURATION) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-3 flex items-center justify-between">
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-white bg-black/30 backdrop-blur-sm rounded-full"
          data-testid="button-close-recorder"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-stream-coral animate-pulse" />
              <span className="text-white text-sm font-mono font-semibold">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        <div className="w-9" />
      </div>

      <div className="absolute right-3 top-20 z-30 flex flex-col items-center gap-1 bg-black/30 backdrop-blur-md rounded-full py-3 px-1.5">
        <button
          onClick={handleFlipCamera}
          className="flex flex-col items-center gap-0.5 py-1.5"
          data-testid="button-flip-camera"
        >
          <div className="h-10 w-10 rounded-full flex items-center justify-center">
            <SwitchCamera className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] text-white/70">Flip</span>
        </button>

        <button
          onClick={() => setFlashEnabled(!flashEnabled)}
          className="flex flex-col items-center gap-0.5 py-1.5"
          data-testid="button-flash"
        >
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            flashEnabled && "bg-white/20"
          )}>
            {flashEnabled ? <Zap className="h-5 w-5 text-yellow-400" /> : <ZapOff className="h-5 w-5 text-white" />}
          </div>
          <span className="text-[10px] text-white/70">{flashEnabled ? "On" : "Off"}</span>
        </button>

        <button
          onClick={() => { setShowSpeedPanel(!showSpeedPanel); setShowTimerPanel(false); setShowFilters(false); }}
          className="flex flex-col items-center gap-0.5 py-1.5"
          data-testid="button-speed"
        >
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            selectedSpeed !== 1 && "bg-white/20"
          )}>
            <Gauge className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] text-white/70">{SPEED_LABELS[selectedSpeed]}</span>
        </button>

        <button
          onClick={() => { setShowTimerPanel(!showTimerPanel); setShowSpeedPanel(false); setShowFilters(false); }}
          className="flex flex-col items-center gap-0.5 py-1.5"
          data-testid="button-timer"
        >
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            selectedTimer > 0 && "bg-white/20"
          )}>
            <Timer className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] text-white/70">{selectedTimer > 0 ? `${selectedTimer}s` : "Timer"}</span>
        </button>

        <button
          onClick={() => { setShowFilters(!showFilters); setShowSpeedPanel(false); setShowTimerPanel(false); }}
          className="flex flex-col items-center gap-0.5 py-1.5"
          data-testid="button-filters"
        >
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            activeFilter !== "none" && "bg-white/20"
          )}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] text-white/70">Filters</span>
        </button>

        <button className="flex flex-col items-center gap-0.5 py-1.5" data-testid="button-music">
          <div className="h-10 w-10 rounded-full flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] text-white/70">Music</span>
        </button>
      </div>

      {showSpeedPanel && (
        <div className="absolute right-16 top-32 z-40 bg-black/70 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-1">
          {SPEED_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setSelectedSpeed(s); setShowSpeedPanel(false); }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedSpeed === s ? "bg-primary text-white" : "text-white/80 hover:bg-white/10"
              )}
            >
              {SPEED_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {showTimerPanel && (
        <div className="absolute right-16 top-44 z-40 bg-black/70 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-1">
          {TIMER_OPTIONS.map(t => (
            <button
              key={t}
              onClick={() => { setSelectedTimer(t); setShowTimerPanel(false); }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedTimer === t ? "bg-primary text-white" : "text-white/80 hover:bg-white/10"
              )}
            >
              {t === 0 ? "Off" : `${t}s`}
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: facingMode === "user" ? "scaleX(-1)" : "none",
            filter: filters.find(f => f.id === activeFilter)?.css || "none",
          }}
          autoPlay
          playsInline
          muted
        />

        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <Camera className="h-12 w-12 text-white/50 mx-auto mb-3 animate-pulse" />
              <p className="text-white/70">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="absolute bottom-28 left-0 right-0 z-40 px-3">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5"
                data-testid={`button-filter-${filter.id}`}
              >
                <div className={cn(
                  "h-14 w-14 rounded-full overflow-hidden border-2 transition-all duration-200",
                  activeFilter === filter.id ? "border-stream-coral scale-110" : "border-transparent"
                )}>
                  <div
                    className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500"
                    style={{ filter: filter.css || "none" }}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  activeFilter === filter.id ? "text-stream-coral" : "text-white/70"
                )}>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <span 
            key={countdown}
            className="text-[120px] font-black text-white drop-shadow-2xl"
            style={{
              animation: 'countdown-scale 1s ease-out forwards',
            }}
          >
            {countdown}
          </span>
          <style>{`
            @keyframes countdown-scale {
              0% { transform: scale(0.5); opacity: 0; }
              30% { transform: scale(1.2); opacity: 1; }
              60% { transform: scale(1); opacity: 1; }
              100% { transform: scale(0.8); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-8 px-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
          data-testid="button-effects-bottom"
        >
          <Sparkles className="h-5 w-5 text-white" />
        </button>

        <button
          onClick={handleRecordPress}
          className="relative flex items-center justify-center"
          data-testid="button-record"
        >
          <div className={cn(
            "h-[72px] w-[72px] rounded-full border-[4px] flex items-center justify-center transition-all duration-300",
            isRecording ? "border-stream-coral" : "border-white"
          )}>
            <div className={cn(
              "transition-all duration-300",
              isRecording 
                ? "h-6 w-6 rounded-md bg-stream-coral" 
                : "h-[56px] w-[56px] rounded-full bg-stream-coral"
            )} />
          </div>
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-stream-coral/50 animate-ping" />
          )}
        </button>

        <button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "video/*";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                onVideoRecorded(file, 0);
              }
            };
            input.click();
          }}
          className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20"
          data-testid="button-gallery"
        >
          <Camera className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
