import React from "react";
import { UserPlus, Check, Crown, Verified } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LiveHostInfoProps {
  hostName: string;
  hostAvatar: string;
  isFollowing: boolean;
  onFollowToggle: () => void;
}

export function LiveHostInfo({ hostName, hostAvatar, isFollowing, onFollowToggle }: LiveHostInfoProps) {
  return (
    <div className="px-3 mb-4">
      <div className="flex items-center gap-3">
        {/* Host Avatar with Live Ring */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-stream-coral via-stream-pink to-stream-purple opacity-75 blur-sm animate-pulse" />
          <Avatar className="relative h-14 w-14 ring-2 ring-white/20 ring-offset-2 ring-offset-black">
            <AvatarImage src={hostAvatar} />
            <AvatarFallback className="bg-neutral-800 text-white">{hostName[0]}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-stream-coral to-stream-pink flex items-center justify-center ring-2 ring-black shadow-lg">
            <Crown className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Host Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-white text-base truncate">{hostName}</span>
            <div className="h-4 w-4 rounded-full bg-stream-cyan flex items-center justify-center flex-shrink-0">
              <Verified className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <span className="text-xs text-white/50">@{hostName.toLowerCase().replace(" ", "_")}</span>
        </div>

        {/* Follow Button */}
        <button
          onClick={onFollowToggle}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all press-effect",
            isFollowing
              ? "bg-white/15 text-white border border-white/20 hover:bg-white/20"
              : "bg-gradient-to-r from-stream-coral via-stream-pink to-stream-purple text-white shadow-lg shadow-stream-coral/40 hover:shadow-stream-coral/60"
          )}
        >
          {isFollowing ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Follow
            </>
          )}
        </button>
      </div>

      {/* Stream Title & Tags */}
      <div className="mt-3 pr-20">
        <p className="text-sm text-white font-medium line-clamp-1">
          What's Happening Today? 🌙✨
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stream-purple/30 text-stream-purple-light border border-stream-purple/20">
            #ChillVibes
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stream-coral/30 text-stream-coral-light border border-stream-coral/20">
            #Music
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stream-cyan/30 text-stream-cyan border border-stream-cyan/20">
            #TalkShow
          </span>
        </div>
      </div>
    </div>
  );
}
