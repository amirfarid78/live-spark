import React from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./LiveRoomViewer";

interface LiveChatSectionProps {
  messages: ChatMessage[];
}

export function LiveChatSection({ messages }: LiveChatSectionProps) {
  return (
    <div className="px-4 mb-3 max-h-[32vh] overflow-hidden">
      <div className="space-y-2">
        {messages.slice(-10).map((msg, index) => {
          const opacity = 1 - (messages.slice(-10).length - 1 - index) * 0.1;
          
          // System message
          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="animate-fade-in"
                style={{ opacity: Math.max(opacity, 0.4) }}
              >
                <span className="text-xs text-white font-medium">
                  Announcement : <span className="text-white/80">{msg.message}</span>
                </span>
              </div>
            );
          }

          // Friend request message
          if (msg.isFriendRequest) {
            return (
              <div
                key={msg.id}
                className="animate-fade-in"
                style={{ opacity: Math.max(opacity, 0.4) }}
              >
                <div className="inline-flex items-center">
                  <span className="text-xs text-stream-cyan font-medium mr-2">{msg.user}</span>
                  <span className="text-xs bg-gradient-to-r from-stream-gold to-orange-500 text-black font-bold px-2.5 py-1 rounded-full">
                    {msg.user} : Sent Friend Request
                  </span>
                </div>
              </div>
            );
          }

          // Regular message
          return (
            <div
              key={msg.id}
              className="animate-fade-in"
              style={{ opacity: Math.max(opacity, 0.4) }}
            >
              <div className="flex items-start gap-1.5 flex-wrap">
                <span className={cn(
                  "text-xs font-semibold",
                  msg.isVIP ? "text-stream-cyan" : "text-stream-cyan"
                )}>
                  {msg.user}
                </span>
                {msg.giftIcon ? (
                  <span className="text-xs text-white/90 flex items-center gap-1">
                    {msg.message}
                    <span className="text-base">{msg.giftIcon}</span>
                  </span>
                ) : (
                  <span className="text-xs text-white/80">{msg.message}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
