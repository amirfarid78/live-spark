import { X, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TopViewer {
  id: string;
  avatar: string;
  isVIP: boolean;
  level: number;
}

interface LiveTopBarProps {
  hostName: string;
  hostAvatar: string;
  viewerCount: number;
  topViewers: TopViewer[];
  isHost?: boolean;
  onClose: () => void;
  onEndStream?: () => void;
}

export function LiveTopBar({ hostName, hostAvatar, viewerCount, topViewers, isHost, onClose, onEndStream }: LiveTopBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 pt-safe">
      <div className="flex items-center justify-between px-3 py-3 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 animate-fade-in-left">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-r from-stream-purple via-stream-coral to-stream-gold animate-spin-slow opacity-80" />
            <Avatar className="relative h-10 w-10 ring-2 ring-black">
              <AvatarImage src={hostAvatar} />
              <AvatarFallback className="text-xs bg-neutral-800 text-white">{hostName[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="bg-black/50 backdrop-blur-xl rounded-full pl-2 pr-3 py-1.5 border border-white/10 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate max-w-[80px]">{hostName}</span>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1 text-white/70 flex-shrink-0">
                <Users className="h-3 w-3" />
                <span className="text-[10px] font-medium">{viewerCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {!isHost && (
            <button className="flex-shrink-0 px-3 py-1.5 rounded-full bg-stream-purple/80 backdrop-blur-sm text-white text-[11px] font-bold press-effect" data-testid="button-follow-host">
              Follow
            </button>
          )}
        </div>

        <div className="flex items-center -space-x-1.5 animate-fade-in-up flex-shrink-0">
          {topViewers.slice(0, 3).map((viewer, index) => (
            <div key={viewer.id} className="relative" style={{ zIndex: 5 - index }}>
              <Avatar className={cn("relative h-7 w-7 ring-2 ring-black/60")}>
                <AvatarImage src={viewer.avatar} />
                <AvatarFallback className="text-[8px] bg-neutral-800 text-white">U</AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 animate-fade-in-right flex-shrink-0">
          {isHost && onEndStream && (
            <button
              onClick={onEndStream}
              className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-[11px] font-bold press-effect border border-red-400/30"
              data-testid="button-end-stream"
            >
              End
            </button>
          )}
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center press-effect"
            data-testid="button-close-live"
          >
            <X className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
}
