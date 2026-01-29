import React, { useState, useRef, useCallback } from "react";
import { 
  Camera, 
  X, 
  RotateCcw, 
  Zap, 
  Clock, 
  Gauge,
  Music2,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Type,
  Sticker,
  Wand2,
  Volume2,
  Scissors,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type RecordingState = 'idle' | 'recording' | 'preview' | 'editing';

const speedOptions = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
];

const timerOptions = [
  { value: 0, label: 'Off' },
  { value: 3, label: '3s' },
  { value: 10, label: '10s' },
];

const filters = [
  { id: 'none', name: 'Original', style: {} },
  { id: 'warm', name: 'Warm', style: { filter: 'sepia(30%) saturate(140%)' } },
  { id: 'cool', name: 'Cool', style: { filter: 'hue-rotate(20deg) saturate(110%)' } },
  { id: 'vintage', name: 'Vintage', style: { filter: 'sepia(50%) contrast(90%)' } },
  { id: 'bw', name: 'B&W', style: { filter: 'grayscale(100%)' } },
  { id: 'vivid', name: 'Vivid', style: { filter: 'saturate(150%) contrast(110%)' } },
];

export default function VideoRecorder() {
  const navigate = useNavigate();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedTimer, setSelectedTimer] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Editing state
  const [caption, setCaption] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    if (selectedTimer > 0) {
      setCountdown(selectedTimer);
      countdownInterval.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval.current!);
            beginActualRecording();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      beginActualRecording();
    }
  }, [selectedTimer]);

  const beginActualRecording = () => {
    setRecordingState('recording');
    setRecordingProgress(0);
    recordingInterval.current = setInterval(() => {
      setRecordingProgress(prev => {
        if (prev >= 100) {
          stopRecording();
          return 100;
        }
        return prev + (100 / 600); // 60 seconds max
      });
    }, 100);
  };

  const stopRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    setRecordingState('preview');
  };

  const cancelRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    setCountdown(null);
    setRecordingState('idle');
    setRecordingProgress(0);
  };

  const proceedToEditing = () => {
    setRecordingState('editing');
  };

  const handlePost = () => {
    toast({
      title: "Video Posted!",
      description: "Your video has been shared with your followers.",
    });
    navigate('/');
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "You can continue editing later.",
    });
    navigate('/');
  };

  const currentFilter = filters.find(f => f.id === selectedFilter) || filters[0];

  // Editing Screen
  if (recordingState === 'editing') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Header */}
        <div className="relative z-20 flex items-center justify-between px-4 py-4 pt-safe">
          <button 
            onClick={() => setRecordingState('preview')}
            className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center press-effect"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-white font-semibold">Edit</h1>
          <button 
            onClick={handlePost}
            className="px-4 py-2 rounded-full bg-gradient-primary text-white font-semibold press-effect"
          >
            Post
          </button>
        </div>

        {/* Video Preview */}
        <div className="flex-1 relative mx-4 rounded-2xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50"
            style={currentFilter.style}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/60">
                <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Video Preview</p>
              </div>
            </div>
          </div>
          
          {/* Edit tools overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
            <button className="flex flex-col items-center gap-1 press-effect">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-xs">Trim</span>
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex flex-col items-center gap-1 press-effect"
            >
              <div className={cn(
                "h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center",
                showFilters ? "bg-primary" : "bg-white/20"
              )}>
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-xs">Filters</span>
            </button>
            <button className="flex flex-col items-center gap-1 press-effect">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Type className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-xs">Text</span>
            </button>
            <button className="flex flex-col items-center gap-1 press-effect">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Sticker className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-xs">Stickers</span>
            </button>
            <button className="flex flex-col items-center gap-1 press-effect">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-xs">Audio</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 py-3">
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center gap-1 press-effect",
                  )}
                >
                  <div 
                    className={cn(
                      "h-16 w-16 rounded-xl border-2 overflow-hidden",
                      selectedFilter === filter.id ? "border-primary" : "border-transparent"
                    )}
                    style={filter.style}
                  >
                    <div className="h-full w-full bg-gradient-to-br from-purple-500/50 to-pink-500/50" />
                  </div>
                  <span className={cn(
                    "text-xs",
                    selectedFilter === filter.id ? "text-primary" : "text-white/70"
                  )}>{filter.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Caption & Music */}
        <div className="px-4 py-4 pb-safe space-y-3">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <Music2 className="h-5 w-5 text-white/60" />
            <span className="text-white/60 text-sm">Add music...</span>
            <ChevronRight className="h-5 w-5 text-white/40 ml-auto" />
          </div>
          
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption... #hashtags @mentions"
            className="bg-white/10 border-0 text-white placeholder:text-white/50 h-12 rounded-xl"
          />

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              className="flex-1 h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
            >
              Save Draft
            </Button>
            <Button 
              onClick={handlePost}
              className="flex-1 h-12 rounded-xl bg-gradient-primary hover:opacity-90"
            >
              <Send className="h-5 w-5 mr-2" />
              Post
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Preview Screen
  if (recordingState === 'preview') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Header */}
        <div className="relative z-20 flex items-center justify-between px-4 py-4 pt-safe">
          <button 
            onClick={cancelRecording}
            className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center press-effect"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <span className="text-white font-semibold">Preview</span>
          <div className="w-10" />
        </div>

        {/* Video Preview */}
        <div className="flex-1 relative mx-4 rounded-2xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50"
            style={currentFilter.style}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/60">
                <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Recorded Video</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-6 pb-safe flex gap-4">
          <Button 
            variant="outline" 
            onClick={cancelRecording}
            className="flex-1 h-14 rounded-2xl border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Retake
          </Button>
          <Button 
            onClick={proceedToEditing}
            className="flex-1 h-14 rounded-2xl bg-gradient-primary hover:opacity-90"
          >
            <Check className="h-5 w-5 mr-2" />
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Recording/Idle Screen
  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera Preview */}
      <div 
        className="absolute inset-0"
        style={currentFilter.style}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-24 w-24 text-white/20" />
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="h-32 w-32 rounded-full bg-primary/20 backdrop-blur-xl flex items-center justify-center animate-pulse">
            <span className="text-6xl font-bold text-white">{countdown}</span>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center press-effect"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFlashOn(!isFlashOn)}
              className={cn(
                "h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center press-effect",
                isFlashOn ? "bg-yellow-500" : "bg-black/30"
              )}
            >
              <Zap className={cn("h-5 w-5", isFlashOn ? "text-black" : "text-white")} />
            </button>
            
            <button 
              onClick={() => setIsFrontCamera(!isFrontCamera)}
              className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center press-effect"
            >
              <RotateCcw className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Recording Progress Bar */}
        {recordingState === 'recording' && (
          <div className="mx-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all"
              style={{ width: `${recordingProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Right Side Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
        {/* Speed */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowSpeedMenu(!showSpeedMenu);
              setShowTimerMenu(false);
            }}
            className="flex flex-col items-center gap-1 press-effect"
          >
            <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
              <Gauge className="h-5 w-5 text-white" />
            </div>
            <span className="text-white text-xs">{selectedSpeed}x</span>
          </button>
          
          {showSpeedMenu && (
            <div className="absolute right-14 top-0 bg-black/80 backdrop-blur-xl rounded-xl p-2 animate-scale-in">
              {speedOptions.map((speed) => (
                <button
                  key={speed.value}
                  onClick={() => {
                    setSelectedSpeed(speed.value);
                    setShowSpeedMenu(false);
                  }}
                  className={cn(
                    "block w-full px-4 py-2 text-sm rounded-lg text-left transition-colors",
                    selectedSpeed === speed.value 
                      ? "bg-primary text-white" 
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowTimerMenu(!showTimerMenu);
              setShowSpeedMenu(false);
            }}
            className="flex flex-col items-center gap-1 press-effect"
          >
            <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-white text-xs">{selectedTimer === 0 ? 'Off' : `${selectedTimer}s`}</span>
          </button>
          
          {showTimerMenu && (
            <div className="absolute right-14 top-0 bg-black/80 backdrop-blur-xl rounded-xl p-2 animate-scale-in">
              {timerOptions.map((timer) => (
                <button
                  key={timer.value}
                  onClick={() => {
                    setSelectedTimer(timer.value);
                    setShowTimerMenu(false);
                  }}
                  className={cn(
                    "block w-full px-4 py-2 text-sm rounded-lg text-left transition-colors",
                    selectedTimer === timer.value 
                      ? "bg-primary text-white" 
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  {timer.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex flex-col items-center gap-1 press-effect"
        >
          <div className={cn(
            "h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center",
            showFilters ? "bg-primary" : "bg-black/30"
          )}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xs">Filters</span>
        </button>

        {/* Music */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xs">Music</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && recordingState === 'idle' && (
        <div className="absolute bottom-40 left-0 right-0 z-20 px-4">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 press-effect"
              >
                <div 
                  className={cn(
                    "h-14 w-14 rounded-xl border-2 overflow-hidden",
                    selectedFilter === filter.id ? "border-primary" : "border-white/20"
                  )}
                  style={filter.style}
                >
                  <div className="h-full w-full bg-gradient-to-br from-purple-500/50 to-pink-500/50" />
                </div>
                <span className={cn(
                  "text-xs",
                  selectedFilter === filter.id ? "text-primary" : "text-white/70"
                )}>{filter.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe">
        <div className="flex items-center justify-center gap-8 py-8">
          {/* Gallery */}
          <button className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden press-effect">
            <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500" />
          </button>

          {/* Record Button */}
          <button
            onMouseDown={recordingState === 'idle' ? startRecording : undefined}
            onMouseUp={recordingState === 'recording' ? stopRecording : undefined}
            onTouchStart={recordingState === 'idle' ? startRecording : undefined}
            onTouchEnd={recordingState === 'recording' ? stopRecording : undefined}
            className="relative press-effect"
          >
            <div className={cn(
              "h-20 w-20 rounded-full border-4 border-white flex items-center justify-center transition-all",
              recordingState === 'recording' && "scale-110"
            )}>
              <div className={cn(
                "rounded-full bg-stream-coral transition-all",
                recordingState === 'recording' 
                  ? "h-8 w-8 rounded-lg" 
                  : "h-16 w-16"
              )} />
            </div>
          </button>

          {/* Effects */}
          <button className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center press-effect">
            <Wand2 className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Mode Tabs */}
        {recordingState === 'idle' && (
          <div className="flex justify-center gap-6 pb-4">
            <button className="text-white/50 text-sm font-medium press-effect">60s</button>
            <button className="text-white text-sm font-medium press-effect relative">
              15s
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
            </button>
            <button className="text-white/50 text-sm font-medium press-effect">Photo</button>
          </div>
        )}
      </div>
    </div>
  );
}
