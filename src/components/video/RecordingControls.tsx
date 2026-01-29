import React from "react";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordingControlsProps {
  recordingState: 'idle' | 'recording' | 'preview' | 'editing';
  recordingProgress: number;
  segments: number[];
  currentDuration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenGallery: () => void;
  onOpenEffects: () => void;
  onChangeDuration: (duration: number) => void;
}

const durationOptions = [
  { value: 15, label: '15s' },
  { value: 60, label: '60s' },
  { value: 180, label: '3m' },
];

export default function RecordingControls({
  recordingState,
  recordingProgress,
  segments,
  currentDuration,
  onStartRecording,
  onStopRecording,
  onOpenGallery,
  onOpenEffects,
  onChangeDuration,
}: RecordingControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe">
      {/* Segments indicator */}
      {segments.length > 0 && recordingState !== 'recording' && (
        <div className="mx-4 mb-4 flex gap-1">
          {segments.map((segment, index) => (
            <div
              key={index}
              className="h-1 bg-primary rounded-full"
              style={{ width: `${(segment / currentDuration) * 100}%` }}
            />
          ))}
          {recordingProgress > 0 && (
            <div
              className="h-1 bg-primary/50 rounded-full"
              style={{ width: `${recordingProgress}%` }}
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-8 py-8">
        {/* Gallery */}
        <button 
          onClick={onOpenGallery}
          className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden press-effect"
        >
          <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500" />
        </button>

        {/* Record Button */}
        <button
          onMouseDown={recordingState === 'idle' ? onStartRecording : undefined}
          onMouseUp={recordingState === 'recording' ? onStopRecording : undefined}
          onTouchStart={recordingState === 'idle' ? onStartRecording : undefined}
          onTouchEnd={recordingState === 'recording' ? onStopRecording : undefined}
          className="relative press-effect"
        >
          {/* Outer ring with progress */}
          <svg className="h-24 w-24 -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="4"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - recordingProgress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-100"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="#ff6b6b" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Inner button */}
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all",
            recordingState === 'recording' 
              ? "h-8 w-8 rounded-lg bg-stream-coral" 
              : "h-16 w-16 rounded-full bg-stream-coral"
          )} />
        </button>

        {/* Effects */}
        <button 
          onClick={onOpenEffects}
          className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center press-effect"
        >
          <Wand2 className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Duration Tabs */}
      {recordingState === 'idle' && (
        <div className="flex justify-center gap-6 pb-4">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChangeDuration(option.value)}
              className={cn(
                "text-sm font-medium press-effect relative",
                currentDuration === option.value ? "text-white" : "text-white/50"
              )}
            >
              {option.label}
              {currentDuration === option.value && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
          <button className="text-white/50 text-sm font-medium press-effect">Photo</button>
        </div>
      )}
    </div>
  );
}
