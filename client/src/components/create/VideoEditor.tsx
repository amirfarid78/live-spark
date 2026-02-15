import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  X, Check, RotateCcw, Type, Scissors, Palette, Gauge,
  Volume2, VolumeX, Play, Pause, Undo2, Music
} from "lucide-react";

interface VideoEditorProps {
  videoBlob: Blob;
  onSave: (editedBlob: Blob, thumbnail: Blob | null) => void;
  onClose: () => void;
}

type EditorTab = "filters" | "trim" | "text" | "speed" | "adjust";

const VIDEO_FILTERS = [
  { id: "none", label: "Original", css: "" },
  { id: "warm", label: "Warm", css: "sepia(0.3) saturate(1.4) brightness(1.05)" },
  { id: "cool", label: "Cool", css: "saturate(0.8) hue-rotate(20deg) brightness(1.05)" },
  { id: "vintage", label: "Vintage", css: "sepia(0.5) contrast(1.1) brightness(0.95)" },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.2)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.8) contrast(1.1) brightness(1.05)" },
  { id: "dramatic", label: "Drama", css: "contrast(1.4) saturate(0.8) brightness(0.9)" },
  { id: "fade", label: "Fade", css: "brightness(1.1) contrast(0.8) saturate(0.7)" },
  { id: "glow", label: "Glow", css: "brightness(1.15) contrast(1.05) saturate(1.2)" },
  { id: "cinematic", label: "Cinema", css: "contrast(1.2) saturate(0.9) brightness(0.95) sepia(0.1)" },
  { id: "sunset", label: "Sunset", css: "sepia(0.2) saturate(1.5) hue-rotate(-10deg) brightness(1.05)" },
  { id: "neon", label: "Neon", css: "saturate(2) contrast(1.3) brightness(1.1)" },
];

const SPEED_OPTIONS = [
  { value: 0.25, label: "0.25x" },
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
];

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: string;
}

export function VideoEditor({ videoBlob, onSave, onClose }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl] = useState(() => URL.createObjectURL(videoBlob));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newTextInput, setNewTextInput] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimEnd(100);
    };
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const time = (value[0] / 100) * duration;
    video.currentTime = time;
    setCurrentTime(time);
  }, [duration]);

  const getFilterCss = useCallback(() => {
    const parts: string[] = [];
    const filter = VIDEO_FILTERS.find(f => f.id === selectedFilter);
    if (filter?.css) parts.push(filter.css);
    if (brightness !== 100) parts.push(`brightness(${brightness / 100})`);
    if (contrast !== 100) parts.push(`contrast(${contrast / 100})`);
    if (saturation !== 100) parts.push(`saturate(${saturation / 100})`);
    return parts.join(" ") || "none";
  }, [selectedFilter, brightness, contrast, saturation]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, []);

  const addTextOverlay = useCallback(() => {
    if (!newTextInput.trim()) return;
    const overlay: TextOverlay = {
      id: Date.now().toString(),
      text: newTextInput.trim(),
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#ffffff",
      fontWeight: "bold",
    };
    setTextOverlays(prev => [...prev, overlay]);
    setNewTextInput("");
    setIsAddingText(false);
  }, [newTextInput]);

  const removeTextOverlay = useCallback((id: string) => {
    setTextOverlays(prev => prev.filter(t => t.id !== id));
  }, []);

  const generateThumbnail = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return resolve(null);

      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);

        const seekTo = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTo;

        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          ctx.filter = getFilterCss();
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          textOverlays.forEach(overlay => {
            ctx.filter = "none";
            ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px sans-serif`;
            ctx.fillStyle = overlay.color;
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0,0,0,0.7)";
            ctx.shadowBlur = 4;
            const x = (overlay.x / 100) * canvas.width;
            const y = (overlay.y / 100) * canvas.height;
            ctx.fillText(overlay.text, x, y);
          });

          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
        };

        video.addEventListener("seeked", onSeeked);
        setTimeout(() => {
          video.removeEventListener("seeked", onSeeked);
          ctx.filter = getFilterCss();
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
        }, 2000);
      } catch {
        resolve(null);
      }
    });
  }, [getFilterCss, textOverlays]);

  const exportVideo = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const sourceVideo = document.createElement("video");
      sourceVideo.playsInline = true;
      sourceVideo.preload = "auto";
      sourceVideo.src = videoUrl;

      const cleanup = () => {
        sourceVideo.pause();
        sourceVideo.removeAttribute("src");
        sourceVideo.load();
      };

      sourceVideo.onloadedmetadata = () => {
        const trimStartSec = (trimStart / 100) * sourceVideo.duration;
        const trimEndSec = (trimEnd / 100) * sourceVideo.duration;

        sourceVideo.currentTime = trimStartSec;

        sourceVideo.onseeked = () => {
          sourceVideo.onseeked = null;

          const canvas = document.createElement("canvas");
          canvas.width = sourceVideo.videoWidth || 720;
          canvas.height = sourceVideo.videoHeight || 1280;
          const ctx = canvas.getContext("2d");
          if (!ctx) { cleanup(); return reject(new Error("Canvas context failed")); }

          sourceVideo.playbackRate = playbackSpeed;

          sourceVideo.play().then(() => {
            const canvasStream = canvas.captureStream(30);

            try {
              const videoStream = (sourceVideo as any).captureStream?.();
              if (videoStream) {
                const audioTracks = videoStream.getAudioTracks();
                audioTracks.forEach((t: MediaStreamTrack) => canvasStream.addTrack(t));
              }
            } catch (_) {}

            const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
              ? "video/webm;codecs=vp9,opus"
              : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
                ? "video/webm;codecs=vp8,opus"
                : "video/webm";

            const recorder = new MediaRecorder(canvasStream, {
              mimeType,
              videoBitsPerSecond: 4000000,
            });

            const chunks: Blob[] = [];
            let stopped = false;

            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunks.push(e.data);
            };
            recorder.onstop = () => {
              cleanup();
              resolve(new Blob(chunks, { type: mimeType }));
            };

            const stopRecording = () => {
              if (stopped) return;
              stopped = true;
              if (recorder.state === "recording") {
                recorder.stop();
              }
              sourceVideo.pause();
            };

            const drawFrame = () => {
              if (stopped) return;
              if (sourceVideo.paused || sourceVideo.ended || sourceVideo.currentTime >= trimEndSec) {
                stopRecording();
                return;
              }

              if (sourceVideo.readyState >= 2) {
                ctx.filter = getFilterCss();
                ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);

                ctx.filter = "none";
                textOverlays.forEach(overlay => {
                  ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px sans-serif`;
                  ctx.fillStyle = overlay.color;
                  ctx.textAlign = "center";
                  ctx.shadowColor = "rgba(0,0,0,0.7)";
                  ctx.shadowBlur = 4;
                  const x = (overlay.x / 100) * canvas.width;
                  const y = (overlay.y / 100) * canvas.height;
                  ctx.fillText(overlay.text, x, y);
                  ctx.shadowBlur = 0;
                });
              }

              requestAnimationFrame(drawFrame);
            };

            recorder.start(100);
            requestAnimationFrame(drawFrame);

            const maxWaitMs = ((trimEndSec - trimStartSec) / playbackSpeed) * 1000 + 3000;
            setTimeout(stopRecording, maxWaitMs);
          }).catch((err) => { cleanup(); reject(err); });
        };
      };

      sourceVideo.onerror = () => { cleanup(); reject(new Error("Failed to load video for export")); };
    });
  }, [videoUrl, trimStart, trimEnd, playbackSpeed, getFilterCss, textOverlays]);

  const handleSave = useCallback(async () => {
    setProcessing(true);
    try {
      const hasEdits = selectedFilter !== "none" || textOverlays.length > 0 ||
        brightness !== 100 || contrast !== 100 || saturation !== 100 ||
        trimStart > 0 || trimEnd < 100 || playbackSpeed !== 1;

      let finalBlob = videoBlob;
      if (hasEdits) {
        try {
          finalBlob = await exportVideo();
        } catch (err) {
          console.warn("Canvas export failed, using original:", err);
        }
      }

      const thumbnail = await generateThumbnail();
      onSave(finalBlob, thumbnail);
    } catch (err) {
      console.error("Processing error:", err);
      onSave(videoBlob, null);
    }
  }, [videoBlob, exportVideo, generateThumbnail, onSave, selectedFilter, textOverlays,
    brightness, contrast, saturation, trimStart, trimEnd, playbackSpeed]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trimStartTime = (trimStart / 100) * duration;
  const trimEndTime = (trimEnd / 100) * duration;

  const tabs: { id: EditorTab; label: string; icon: any }[] = [
    { id: "filters", label: "Filters", icon: Palette },
    { id: "trim", label: "Trim", icon: Scissors },
    { id: "text", label: "Text", icon: Type },
    { id: "speed", label: "Speed", icon: Gauge },
    { id: "adjust", label: "Adjust", icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" data-testid="video-editor">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-white"
          data-testid="button-editor-close"
        >
          <X className="h-5 w-5" />
        </Button>
        <span className="text-white font-semibold">Edit Video</span>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={processing}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
          data-testid="button-editor-next"
        >
          {processing ? "Processing..." : "Next"}
        </Button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-h-full max-w-full object-contain"
          style={{ filter: getFilterCss() }}
          playsInline
          muted={isMuted}
          data-testid="video-preview"
        />

        {textOverlays.map(overlay => (
          <div
            key={overlay.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: overlay.fontSize,
              color: overlay.color,
              fontWeight: overlay.fontWeight as any,
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            <span>{overlay.text}</span>
            <button
              onClick={() => removeTextOverlay(overlay.id)}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
          data-testid="button-play-pause"
        >
          {!isPlaying && (
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          )}
        </button>
      </div>

      <div className="px-4 py-2 flex items-center gap-3">
        <button onClick={togglePlay} className="text-white" data-testid="button-toggle-play">
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <span className="text-white/60 text-xs font-mono min-w-[40px]">{formatTime(currentTime)}</span>
        <div className="flex-1">
          <Slider
            value={[progressPercent]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="cursor-pointer"
            data-testid="slider-timeline"
          />
        </div>
        <span className="text-white/60 text-xs font-mono min-w-[40px]">{formatTime(duration)}</span>
        <button onClick={() => setIsMuted(!isMuted)} className="text-white" data-testid="button-mute">
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex border-t border-white/10">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                activeTab === tab.id ? "text-primary" : "text-white/60"
              )}
              data-testid={`button-tab-${tab.id}`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "filters" && (
        <div className="border-t border-white/10 p-3">
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {VIDEO_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1.5",
                  selectedFilter === filter.id && "opacity-100",
                  selectedFilter !== filter.id && "opacity-60"
                )}
                data-testid={`button-filter-${filter.id}`}
              >
                <div
                  className={cn(
                    "h-16 w-16 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden",
                    selectedFilter === filter.id && "ring-2 ring-primary"
                  )}
                  style={{ filter: filter.css || "none" }}
                >
                  <video src={videoUrl} className="h-full w-full object-cover" muted />
                </div>
                <span className="text-[10px] text-white">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "trim" && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-xs">Start: {formatTime(trimStartTime)}</span>
            <span className="text-white/60 text-xs">End: {formatTime(trimEndTime)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Slider
                value={[trimStart, trimEnd]}
                onValueChange={(val) => { setTrimStart(val[0]); setTrimEnd(val[1]); }}
                max={100}
                step={0.5}
                className="cursor-pointer"
                data-testid="slider-trim"
              />
            </div>
          </div>
          <p className="text-white/40 text-xs mt-2 text-center">
            Duration: {formatTime(trimEndTime - trimStartTime)}
          </p>
        </div>
      )}

      {activeTab === "text" && (
        <div className="border-t border-white/10 p-4">
          {isAddingText ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTextInput}
                onChange={(e) => setNewTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTextOverlay()}
                placeholder="Enter text..."
                className="flex-1 bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                data-testid="input-text-overlay"
              />
              <Button size="sm" onClick={addTextOverlay} className="bg-primary text-white" data-testid="button-add-text">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingText(false)} className="text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingText(true)}
                className="w-full border-white/20 text-white"
                data-testid="button-new-text"
              >
                <Type className="h-4 w-4 mr-2" />
                Add Text
              </Button>
              {textOverlays.length > 0 && (
                <div className="space-y-1 mt-2">
                  {textOverlays.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white text-sm truncate">{t.text}</span>
                      <button onClick={() => removeTextOverlay(t.id)} className="text-red-400 ml-2">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "speed" && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-center gap-2">
            {SPEED_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSpeedChange(opt.value)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  playbackSpeed === opt.value
                    ? "bg-primary text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                )}
                data-testid={`button-speed-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "adjust" && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-xs">Brightness</span>
              <span className="text-white/50 text-xs">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              onValueChange={(v) => setBrightness(v[0])}
              min={50}
              max={150}
              step={1}
              data-testid="slider-brightness"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-xs">Contrast</span>
              <span className="text-white/50 text-xs">{contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              onValueChange={(v) => setContrast(v[0])}
              min={50}
              max={150}
              step={1}
              data-testid="slider-contrast"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-xs">Saturation</span>
              <span className="text-white/50 text-xs">{saturation}%</span>
            </div>
            <Slider
              value={[saturation]}
              onValueChange={(v) => setSaturation(v[0])}
              min={0}
              max={200}
              step={1}
              data-testid="slider-saturation"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); }}
            className="w-full text-white/60"
            data-testid="button-reset-adjust"
          >
            <Undo2 className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
