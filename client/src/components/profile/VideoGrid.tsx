import { Heart, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Video {
  id: number;
  thumbnail: string;
  views: string;
  likes: string;
  isPrivate?: boolean;
  isPinned?: boolean;
}

interface VideoGridProps {
  videos: Video[];
  columns?: 2 | 3 | 4 | 5;
  showOverlay?: boolean;
  className?: string;
}

export function VideoGrid({ 
  videos, 
  columns = 3, 
  showOverlay = true,
  className 
}: VideoGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-3 md:grid-cols-4",
    5: "grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Play className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <p className="font-semibold text-muted-foreground">No videos yet</p>
        <p className="text-sm text-muted-foreground mt-1">Start creating to see your content here</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-0.5 sm:gap-1", gridCols[columns], className)}>
      {videos.map((video, index) => (
        <div
          key={video.id}
          className={cn(
            "group relative aspect-[3/4] cursor-pointer overflow-hidden bg-muted animate-fade-in-up rounded-sm sm:rounded-lg",
            `stagger-${(index % 6) + 1}`
          )}
        >
          <img
            src={video.thumbnail}
            alt="Video thumbnail"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          
          {/* Play Button on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-6 w-6 text-white ml-1" fill="white" />
            </div>
          </div>

          {/* Pinned Badge */}
          {video.isPinned && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary/90 text-primary-foreground text-[10px] font-medium">
              📌 Pinned
            </div>
          )}

          {/* Private Badge */}
          {video.isPrivate && (
            <div className="absolute top-2 right-2">
              <Lock className="h-4 w-4 text-white drop-shadow-md" />
            </div>
          )}
          
          {/* Stats Overlay */}
          {showOverlay && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="white" />
                  <span className="text-[10px] sm:text-xs font-medium">{video.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="text-[10px] sm:text-xs font-medium">{video.likes}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
