import React from "react";
import { Users, Lock, Mic } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PartyRoom {
  id: string;
  name: string;
  hostName: string;
  hostAvatar: string;
  coverImage?: string;
  viewerCount: number;
  speakerCount: number;
  maxSpeakers: number;
  isPrivate: boolean;
  isLive: boolean;
  category: string;
  tags?: string[];
}

interface PartyRoomCardProps {
  room: PartyRoom;
  onClick: () => void;
}

export function PartyRoomCard({ room, onClick }: PartyRoomCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer card-hover animate-fade-in",
        "bg-gradient-to-br from-stream-purple/20 via-background to-stream-coral/10",
        "border border-white/10"
      )}
    >
      {/* Header with host info */}
      <div className="p-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-stream-purple/50">
              <AvatarImage src={room.hostAvatar} />
              <AvatarFallback>{room.hostName[0]}</AvatarFallback>
            </Avatar>
            {room.isLive && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-stream-live ring-2 ring-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{room.name}</p>
            <p className="text-xs text-muted-foreground truncate">@{room.hostName}</p>
          </div>
          {room.isPrivate && (
            <Lock className="h-4 w-4 text-stream-gold" />
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-stream-purple/20 text-stream-purple border-0 text-[10px]">
            <Users className="mr-1 h-3 w-3" />
            {room.viewerCount.toLocaleString()}
          </Badge>
          <Badge variant="secondary" className="bg-stream-coral/20 text-stream-coral border-0 text-[10px]">
            <Mic className="mr-1 h-3 w-3" />
            {room.speakerCount}/{room.maxSpeakers}
          </Badge>
        </div>
        <Badge variant="outline" className="text-[10px] border-white/20">
          {room.category}
        </Badge>
      </div>

      {/* Tags */}
      {room.tags && room.tags.length > 0 && (
        <div className="px-3 pb-3 flex flex-wrap gap-1">
          {room.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
