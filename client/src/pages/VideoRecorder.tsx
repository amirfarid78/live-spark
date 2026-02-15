import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, RotateCcw, Check, ChevronLeft, ChevronRight, Type, Sticker, Wand2, Volume2, Scissors, Send, Music2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

// Components
import RecordingControls from "@/components/video/RecordingControls";
import SideToolbar from "@/components/video/SideToolbar";
import BeautyPanel, { BeautySettings } from "@/components/video/BeautyPanel";
import EffectsPanel from "@/components/video/EffectsPanel";
import FiltersPanel, { filters } from "@/components/video/FiltersPanel";
import AdjustmentsPanel, { AdjustmentSettings } from "@/components/video/AdjustmentsPanel";
import TextOverlayTool, { TextOverlay } from "@/components/video/TextOverlayTool";

type RecordingState = 'idle' | 'recording' | 'preview' | 'editing';

export default function VideoRecorder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading, progress } = useUpload();
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);
  
  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [segments, setSegments] = useState<number[]>([]);
  const [currentDuration, setCurrentDuration] = useState(15);
  
  // Camera controls
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedTimer, setSelectedTimer] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  
  // Effects & filters
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [selectedEffect, setSelectedEffect] = useState('none');
  
  // Panels visibility
  const [showFilters, setShowFilters] = useState(false);
  const [showBeauty, setShowBeauty] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [showTextTool, setShowTextTool] = useState(false);
  
  // Settings
  const [beautySettings, setBeautySettings] = useState<BeautySettings>({
    smooth: 50,
    brighten: 30,
    contrast: 50,
    sharpen: 20,
    eyeEnlarge: 0,
    faceThin: 0,
  });
  
  const [adjustmentSettings, setAdjustmentSettings] = useState<AdjustmentSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    vignette: 0,
    grain: 0,
  });
  
  // Text overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  
  // Editing state
  const [caption, setCaption] = useState('');
  
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Close all panels
  const closeAllPanels = () => {
    setShowFilters(false);
    setShowBeauty(false);
    setShowEffects(false);
    setShowAdjustments(false);
    setShowTextTool(false);
  };

  const togglePanel = (panel: 'filters' | 'beauty' | 'effects' | 'adjustments' | 'text') => {
    const isCurrentlyOpen = {
      filters: showFilters,
      beauty: showBeauty,
      effects: showEffects,
      adjustments: showAdjustments,
      text: showTextTool,
    }[panel];
    
    closeAllPanels();
    
    if (!isCurrentlyOpen) {
      switch (panel) {
        case 'filters': setShowFilters(true); break;
        case 'beauty': setShowBeauty(true); break;
        case 'effects': setShowEffects(true); break;
        case 'adjustments': setShowAdjustments(true); break;
        case 'text': setShowTextTool(true); break;
      }
    }
  };

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
    const maxDuration = currentDuration * 10; // 100ms intervals
    recordingInterval.current = setInterval(() => {
      setRecordingProgress(prev => {
        if (prev >= 100) {
          stopRecording();
          return 100;
        }
        return prev + (100 / maxDuration);
      });
    }, 100);
  };

  const stopRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    // Save current segment
    if (recordingProgress > 0) {
      setSegments(prev => [...prev, recordingProgress]);
    }
    setRecordingState('preview');
  };

  const cancelRecording = () => {
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setCountdown(null);
    setRecordingState('idle');
    setRecordingProgress(0);
    setSegments([]);
  };

  const proceedToEditing = () => {
    setRecordingState('editing');
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setRecordingState('preview');
    }
  };

  const handlePost = async () => {
    if (!selectedVideoFile) {
      toast({
        title: "No video",
        description: "Please select or record a video first.",
      });
      return;
    }
    try {
      const result = await uploadFile(selectedVideoFile);
      if (!result) {
        toast({
          title: "Upload failed",
          description: "Could not upload video. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const hashtags = caption.match(/#\w+/g)?.map(h => h.slice(1)) || [];

      await api.post('/videos', {
        videoUrl: result.objectPath,
        description: caption || '',
        hashtags,
      });

      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/videos`] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });

      toast({
        title: "Video posted",
        description: "Your video has been shared successfully.",
      });
      navigate('/profile');
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to post video",
        variant: "destructive",
      });
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "You can continue editing later.",
    });
    navigate('/');
  };

  // Get combined filter style
  const getFilterStyle = () => {
    const filter = filters.find(f => f.id === selectedFilter);
    if (!filter || filter.id === 'none') return {};
    
    const intensity = filterIntensity / 100;
    const filterValue = filter.style.filter;
    
    // Apply intensity to filter
    const adjustedFilter = filterValue.replace(/(\d+)(%|deg|px)/g, (match, value, unit) => {
      const adjustedValue = parseFloat(value) * intensity;
      return `${adjustedValue}${unit}`;
    });
    
    // Add beauty and adjustment effects
    let combinedFilter = adjustedFilter;
    
    // Add brightness/contrast adjustments
    if (adjustmentSettings.brightness !== 0) {
      combinedFilter += ` brightness(${100 + adjustmentSettings.brightness}%)`;
    }
    if (adjustmentSettings.contrast !== 0) {
      combinedFilter += ` contrast(${100 + adjustmentSettings.contrast}%)`;
    }
    if (adjustmentSettings.saturation !== 0) {
      combinedFilter += ` saturate(${100 + adjustmentSettings.saturation}%)`;
    }
    
    return { filter: combinedFilter || undefined };
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
            disabled={isUploading}
            className="px-4 py-2 rounded-full bg-gradient-primary text-white font-semibold press-effect disabled:opacity-50"
            data-testid="button-post-video"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
          </button>
        </div>

        {/* Video Preview */}
        <div className="flex-1 relative mx-4 rounded-2xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50"
            style={getFilterStyle()}
          >
            {videoPreviewUrl ? (
              <video src={videoPreviewUrl} className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Video Preview</p>
                </div>
              </div>
            )}
            
            {/* Text overlays preview */}
            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className="absolute px-2 py-1 rounded"
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: overlay.fontSize,
                  fontFamily: overlay.fontFamily,
                  color: overlay.color,
                  backgroundColor: overlay.backgroundColor,
                  fontWeight: overlay.isBold ? 'bold' : 'normal',
                  fontStyle: overlay.isItalic ? 'italic' : 'normal',
                  textAlign: overlay.align,
                }}
              >
                {overlay.text}
              </div>
            ))}
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
              onClick={() => togglePanel('filters')}
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
            <button 
              onClick={() => togglePanel('text')}
              className="flex flex-col items-center gap-1 press-effect"
            >
              <div className={cn(
                "h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center",
                showTextTool ? "bg-primary" : "bg-white/20"
              )}>
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

        {/* Filters Panel in editing */}
        {showFilters && (
          <FiltersPanel
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            intensity={filterIntensity}
            onIntensityChange={setFilterIntensity}
          />
        )}

        {/* Text Tool in editing */}
        {showTextTool && (
          <TextOverlayTool
            overlays={textOverlays}
            onAddOverlay={(overlay) => setTextOverlays(prev => [...prev, overlay])}
            onUpdateOverlay={(id, updates) => 
              setTextOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o))
            }
            onRemoveOverlay={(id) => setTextOverlays(prev => prev.filter(o => o.id !== id))}
            onClose={() => setShowTextTool(false)}
          />
        )}

        {/* Caption & Music */}
        {!showFilters && !showTextTool && (
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
                disabled={isUploading}
                className="flex-1 h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
              >
                Save Draft
              </Button>
              <Button 
                onClick={handlePost}
                disabled={isUploading}
                className="flex-1 h-12 rounded-xl bg-gradient-primary hover:opacity-90"
                data-testid="button-post-final"
              >
                {isUploading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                {isUploading ? `Uploading ${progress}%` : "Post"}
              </Button>
            </div>
          </div>
        )}
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
            style={getFilterStyle()}
          >
            {videoPreviewUrl ? (
              <video src={videoPreviewUrl} className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Recorded Video</p>
                </div>
              </div>
            )}
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
        style={getFilterStyle()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-24 w-24 text-white/20" />
          </div>
          
          {/* Grid overlay */}
          {showGrid && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          )}
          
          {/* Text overlays live preview */}
          {textOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute px-2 py-1 rounded cursor-move"
              style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: overlay.fontSize,
                fontFamily: overlay.fontFamily,
                color: overlay.color,
                backgroundColor: overlay.backgroundColor,
                fontWeight: overlay.isBold ? 'bold' : 'normal',
                fontStyle: overlay.isItalic ? 'italic' : 'normal',
                textAlign: overlay.align,
              }}
            >
              {overlay.text}
            </div>
          ))}
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
          
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-medium">
              {currentDuration}s
            </span>
          </div>
          
          <div className="w-10" />
        </div>

        {/* Recording Progress Bar */}
        {recordingState === 'recording' && (
          <div className="mx-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-stream-coral transition-all"
              style={{ width: `${recordingProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Side Toolbar */}
      <SideToolbar
        isFlashOn={isFlashOn}
        onToggleFlash={() => setIsFlashOn(!isFlashOn)}
        onFlipCamera={() => setIsFrontCamera(!isFrontCamera)}
        selectedSpeed={selectedSpeed}
        onSelectSpeed={setSelectedSpeed}
        selectedTimer={selectedTimer}
        onSelectTimer={setSelectedTimer}
        onOpenFilters={() => togglePanel('filters')}
        showFilters={showFilters}
        onOpenMusic={() => toast({ title: "Music", description: "Coming soon!" })}
        onOpenBeauty={() => togglePanel('beauty')}
        showBeauty={showBeauty}
        onOpenEffects={() => togglePanel('effects')}
        showEffects={showEffects}
        onOpenAdjustments={() => togglePanel('adjustments')}
        showAdjustments={showAdjustments}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showGrid={showGrid}
      />

      {/* Beauty Panel */}
      {showBeauty && recordingState === 'idle' && (
        <BeautyPanel
          settings={beautySettings}
          onSettingsChange={setBeautySettings}
          onClose={() => setShowBeauty(false)}
        />
      )}

      {/* Effects Panel */}
      {showEffects && recordingState === 'idle' && (
        <EffectsPanel
          selectedEffect={selectedEffect}
          onSelectEffect={setSelectedEffect}
          onClose={() => setShowEffects(false)}
        />
      )}

      {/* Adjustments Panel */}
      {showAdjustments && recordingState === 'idle' && (
        <AdjustmentsPanel
          settings={adjustmentSettings}
          onSettingsChange={setAdjustmentSettings}
          onClose={() => setShowAdjustments(false)}
        />
      )}

      {/* Text Overlay Tool */}
      {showTextTool && recordingState === 'idle' && (
        <TextOverlayTool
          overlays={textOverlays}
          onAddOverlay={(overlay) => setTextOverlays(prev => [...prev, overlay])}
          onUpdateOverlay={(id, updates) => 
            setTextOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o))
          }
          onRemoveOverlay={(id) => setTextOverlays(prev => prev.filter(o => o.id !== id))}
          onClose={() => setShowTextTool(false)}
        />
      )}

      {/* Filters Panel */}
      {showFilters && recordingState === 'idle' && (
        <div className="absolute bottom-40 left-0 right-0 z-20">
          <FiltersPanel
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            intensity={filterIntensity}
            onIntensityChange={setFilterIntensity}
          />
        </div>
      )}

      {/* Hidden file input for video upload */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoFileSelect}
        data-testid="input-video-file"
      />

      {/* Upload Video Button */}
      <div className="absolute bottom-40 right-6 z-20">
        <button
          onClick={() => videoFileInputRef.current?.click()}
          className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center press-effect"
          data-testid="button-upload-video"
        >
          <Upload className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Bottom Controls */}
      <RecordingControls
        recordingState={recordingState}
        recordingProgress={recordingProgress}
        segments={segments}
        currentDuration={currentDuration}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onOpenGallery={() => toast({ title: "Gallery", description: "Coming soon!" })}
        onOpenEffects={() => togglePanel('effects')}
        onChangeDuration={setCurrentDuration}
      />
    </div>
  );
}
