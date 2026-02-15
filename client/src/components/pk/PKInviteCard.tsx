import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Users, Gem, Swords, Copy } from "lucide-react";

interface PKInviteCardProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    followers: number;
    likes: number;
    coins: number;
    country?: string;
  };
  onJoinBattle: () => void;
  onCopyId?: () => void;
}

export function PKInviteCard({ user, onJoinBattle, onCopyId }: PKInviteCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl",
      "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
      "border border-white/10 backdrop-blur-xl",
      "p-4"
    )}>
      {/* User Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-14 w-14 ring-2 ring-stream-purple ring-offset-2 ring-offset-transparent">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          {user.country && (
            <span className="absolute -bottom-1 -right-1 text-lg">
              {user.country}
            </span>
          )}
        </div>

        {/* Name & Stats */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{user.name}</span>
            <Badge className="bg-stream-purple/20 text-stream-purple border-stream-purple/30 text-[10px] px-1.5">
              LV.{user.level}
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-stream-coral" />
              <span className="text-xs text-muted-foreground">{user.followers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-stream-purple" />
              <span className="text-xs text-muted-foreground">{user.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gem className="h-3 w-3 text-stream-gold" />
              <span className="text-xs text-muted-foreground">{user.coins}</span>
            </div>
          </div>

          {/* ID */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-muted-foreground">ID: {user.id}</span>
            {onCopyId && (
              <button onClick={onCopyId} className="p-0.5 hover:bg-white/10 rounded">
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Join Battle Button */}
        <Button
          onClick={onJoinBattle}
          className="bg-gradient-to-r from-stream-coral to-stream-live text-white font-bold px-6 rounded-full shadow-lg shadow-stream-coral/30 hover:shadow-xl hover:shadow-stream-coral/40 transition-all"
        >
          <Swords className="h-4 w-4 mr-1" />
          Join Battle
        </Button>
      </div>
    </div>
  );
}
