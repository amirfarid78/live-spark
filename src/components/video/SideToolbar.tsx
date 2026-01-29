import React from "react";
import { 
  Zap, 
  RotateCcw, 
  Clock, 
  Gauge, 
  Sparkles, 
  Music2,
  Smile,
  SlidersHorizontal,
  Timer,
  Grid3X3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  badge?: string;
}

function ToolButton({ icon: Icon, label, isActive, onClick, badge }: ToolButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 press-effect"
    >
      <div className={cn(
        "h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center relative",
        isActive ? "bg-primary" : "bg-black/30"
      )}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-white text-xs">{badge || label}</span>
    </button>
  );
}

interface SpeedMenuProps {
  selectedSpeed: number;
  onSelectSpeed: (speed: number) => void;
  onClose: () => void;
}

function SpeedMenu({ selectedSpeed, onSelectSpeed, onClose }: SpeedMenuProps) {
  const speedOptions = [0.3, 0.5, 1, 2, 3];
  
  return (
    <div className="absolute right-14 top-0 bg-black/80 backdrop-blur-xl rounded-xl p-2 animate-scale-in">
      {speedOptions.map((speed) => (
        <button
          key={speed}
          onClick={() => {
            onSelectSpeed(speed);
            onClose();
          }}
          className={cn(
            "block w-full px-4 py-2 text-sm rounded-lg text-left transition-colors",
            selectedSpeed === speed 
              ? "bg-primary text-white" 
              : "text-white/80 hover:bg-white/10"
          )}
        >
          {speed}x
        </button>
      ))}
    </div>
  );
}

interface TimerMenuProps {
  selectedTimer: number;
  onSelectTimer: (timer: number) => void;
  onClose: () => void;
}

function TimerMenu({ selectedTimer, onSelectTimer, onClose }: TimerMenuProps) {
  const timerOptions = [0, 3, 5, 10];
  
  return (
    <div className="absolute right-14 top-0 bg-black/80 backdrop-blur-xl rounded-xl p-2 animate-scale-in">
      {timerOptions.map((timer) => (
        <button
          key={timer}
          onClick={() => {
            onSelectTimer(timer);
            onClose();
          }}
          className={cn(
            "block w-full px-4 py-2 text-sm rounded-lg text-left transition-colors",
            selectedTimer === timer 
              ? "bg-primary text-white" 
              : "text-white/80 hover:bg-white/10"
          )}
        >
          {timer === 0 ? 'Off' : `${timer}s`}
        </button>
      ))}
    </div>
  );
}

interface SideToolbarProps {
  isFlashOn: boolean;
  onToggleFlash: () => void;
  onFlipCamera: () => void;
  selectedSpeed: number;
  onSelectSpeed: (speed: number) => void;
  selectedTimer: number;
  onSelectTimer: (timer: number) => void;
  onOpenFilters: () => void;
  showFilters: boolean;
  onOpenMusic: () => void;
  onOpenBeauty: () => void;
  showBeauty: boolean;
  onOpenEffects: () => void;
  showEffects: boolean;
  onOpenAdjustments: () => void;
  showAdjustments: boolean;
  onToggleGrid: () => void;
  showGrid: boolean;
}

export default function SideToolbar({
  isFlashOn,
  onToggleFlash,
  onFlipCamera,
  selectedSpeed,
  onSelectSpeed,
  selectedTimer,
  onSelectTimer,
  onOpenFilters,
  showFilters,
  onOpenMusic,
  onOpenBeauty,
  showBeauty,
  onOpenEffects,
  showEffects,
  onOpenAdjustments,
  showAdjustments,
  onToggleGrid,
  showGrid,
}: SideToolbarProps) {
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const [showTimerMenu, setShowTimerMenu] = React.useState(false);

  const closeAllMenus = () => {
    setShowSpeedMenu(false);
    setShowTimerMenu(false);
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
      {/* Flash */}
      <button 
        onClick={onToggleFlash}
        className="flex flex-col items-center gap-1 press-effect"
      >
        <div className={cn(
          "h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center",
          isFlashOn ? "bg-yellow-500" : "bg-black/30"
        )}>
          <Zap className={cn("h-5 w-5", isFlashOn ? "text-black" : "text-white")} />
        </div>
      </button>

      {/* Flip Camera */}
      <button 
        onClick={onFlipCamera}
        className="flex flex-col items-center gap-1 press-effect"
      >
        <div className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
          <RotateCcw className="h-5 w-5 text-white" />
        </div>
      </button>

      <div className="h-px bg-white/20 mx-2 my-1" />

      {/* Speed */}
      <div className="relative">
        <ToolButton
          icon={Gauge}
          label="Speed"
          badge={`${selectedSpeed}x`}
          onClick={() => {
            closeAllMenus();
            setShowSpeedMenu(!showSpeedMenu);
          }}
        />
        {showSpeedMenu && (
          <SpeedMenu
            selectedSpeed={selectedSpeed}
            onSelectSpeed={onSelectSpeed}
            onClose={() => setShowSpeedMenu(false)}
          />
        )}
      </div>

      {/* Timer */}
      <div className="relative">
        <ToolButton
          icon={Timer}
          label="Timer"
          badge={selectedTimer === 0 ? 'Off' : `${selectedTimer}s`}
          onClick={() => {
            closeAllMenus();
            setShowTimerMenu(!showTimerMenu);
          }}
        />
        {showTimerMenu && (
          <TimerMenu
            selectedTimer={selectedTimer}
            onSelectTimer={onSelectTimer}
            onClose={() => setShowTimerMenu(false)}
          />
        )}
      </div>

      <div className="h-px bg-white/20 mx-2 my-1" />

      {/* Beauty */}
      <ToolButton
        icon={Smile}
        label="Beauty"
        isActive={showBeauty}
        onClick={onOpenBeauty}
      />

      {/* Effects */}
      <ToolButton
        icon={Sparkles}
        label="Effects"
        isActive={showEffects}
        onClick={onOpenEffects}
      />

      {/* Filters */}
      <ToolButton
        icon={SlidersHorizontal}
        label="Filters"
        isActive={showFilters}
        onClick={onOpenFilters}
      />

      {/* Music */}
      <ToolButton
        icon={Music2}
        label="Music"
        onClick={onOpenMusic}
      />

      {/* Grid */}
      <ToolButton
        icon={Grid3X3}
        label="Grid"
        isActive={showGrid}
        onClick={onToggleGrid}
      />
    </div>
  );
}
