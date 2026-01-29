import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./LiveRoomViewer";

interface LiveChatSectionProps {
  messages: ChatMessage[];
}

export function LiveChatSection({ messages }: LiveChatSectionProps) {
  return (
    <div className="px-3 mb-3 max-h-[28vh] overflow-hidden">
      <div className="space-y-2.5">
        {messages.slice(-8).map((msg, index) => {
          const opacity = 1 - (messages.slice(-8).length - 1 - index) * 0.12;
          const isGift = !!msg.giftIcon;
          
          return (
            <div
              key={msg.id}
              className="flex items-start gap-2.5 animate-fade-in"
              style={{ opacity: Math.max(opacity, 0.3) }}
            >
              {/* Avatar with status ring */}
              <div className="relative flex-shrink-0">
                <Avatar className={cn(
                  "h-8 w-8 ring-2 ring-offset-1 ring-offset-transparent",
                  msg.isVIP ? "ring-stream-gold" : msg.isHost ? "ring-stream-coral" : "ring-white/20"
                )}>
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback className="text-[10px] bg-neutral-800 text-white">
                    {msg.user[0]}
                  </AvatarFallback>
                </Avatar>
                {msg.isVIP && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-stream-gold to-orange-500 flex items-center justify-center ring-1 ring-black">
                    <Gem className="h-2 w-2 text-white" />
                  </div>
                )}
                {msg.isHost && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-stream-coral to-stream-pink flex items-center justify-center ring-1 ring-black">
                    <Crown className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>

              {/* Message bubble */}
              <div className={cn(
                "flex-1 min-w-0 rounded-2xl px-3.5 py-2",
                isGift 
                  ? "bg-gradient-to-r from-stream-gold/20 to-orange-500/20 border border-stream-gold/30" 
                  : "bg-white/10 backdrop-blur-md border border-white/5"
              )}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-xs font-bold",
                    msg.isHost ? "text-stream-coral" : msg.isVIP ? "text-stream-gold" : "text-white/90"
                  )}>
                    {msg.user}
                  </span>
                  {msg.giftIcon ? (
                    <span className="text-xs text-white/80 flex items-center gap-1.5">
                      {msg.message}
                      <span className="text-lg drop-shadow-glow">{msg.giftIcon}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-white/70">{msg.message}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
