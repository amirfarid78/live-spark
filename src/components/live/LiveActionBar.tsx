import React from "react";
import { Heart, MessageCircle, Share2, Gift, Sparkles, Music2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LiveActionBarProps {
  likes: number;
  comments: number;
  shares: number;
  hostAvatar: string;
  onLike: () => void;
  onGiftOpen: () => void;
}

export function LiveActionBar({ likes, comments, shares, hostAvatar, onLike, onGiftOpen }: LiveActionBarProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="absolute right-3 bottom-52 flex flex-col items-center gap-6 z-10">
      {/* Like Button */}
      <button onClick={onLike} className="relative flex flex-col items-center gap-1.5 press-effect group">
        <div className="relative h-12 w-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all group-active:scale-90">
          <Heart className="h-6 w-6 text-white group-hover:text-stream-coral group-hover:fill-stream-coral transition-colors" />
        </div>
        <span className="text-xs font-bold text-white drop-shadow-lg">{formatNumber(likes)}</span>
      </button>

      {/* Comment Button */}
      <button className="relative flex flex-col items-center gap-1.5 press-effect group">
        <div className="relative h-12 w-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
        <span className="text-xs font-bold text-white drop-shadow-lg">{formatNumber(comments)}</span>
      </button>

      {/* Share Button */}
      <button className="relative flex flex-col items-center gap-1.5 press-effect group">
        <div className="relative h-12 w-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
          <Share2 className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-bold text-white drop-shadow-lg">{formatNumber(shares)}</span>
      </button>

      {/* Gift Button */}
      <button onClick={onGiftOpen} className="relative flex flex-col items-center gap-1.5 press-effect group">
        <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-stream-gold/90 to-orange-500/90 backdrop-blur-xl border border-yellow-400/30 flex items-center justify-center shadow-lg shadow-stream-gold/30 group-hover:shadow-stream-gold/50 transition-all">
          <Gift className="h-5.5 w-5.5 text-white" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
        </div>
      </button>

      {/* Spinning Music Disc */}
      <div className="relative h-14 w-14 mt-2">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-0.5 shadow-2xl animate-spin-slow">
          <div className="h-full w-full rounded-full overflow-hidden ring-2 ring-white/10">
            <img src={hostAvatar} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
        {/* Vinyl effect */}
        <div className="absolute inset-1.5 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-2.5 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-3.5 rounded-full border border-white/5 pointer-events-none" />
        {/* Center hole */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-3.5 w-3.5 rounded-full bg-black ring-1 ring-white/20" />
        </div>
        {/* Music icon */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black/60 backdrop-blur flex items-center justify-center">
          <Music2 className="h-3 w-3 text-white" />
        </div>
      </div>
    </div>
  );
}
