import { cn } from "@/lib/utils";
import { ChatMessage } from "./LiveRoomViewer";
import { Gift, UserPlus } from "lucide-react";

interface LiveChatSectionProps {
  messages: ChatMessage[];
}

export function LiveChatSection({ messages }: LiveChatSectionProps) {
  const visibleMessages = messages.slice(-8);

  return (
    <div className="px-3 mb-2 max-h-[28vh] overflow-hidden">
      <div className="space-y-1.5">
        {visibleMessages.map((msg, index) => {
          const opacity = Math.max(0.4, 0.5 + (index / visibleMessages.length) * 0.5);

          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="animate-fade-in"
                style={{ opacity }}
              >
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-[11px] text-white/90 font-medium">{msg.message}</span>
                </div>
              </div>
            );
          }

          if (msg.isFriendRequest) {
            return (
              <div
                key={msg.id}
                className="animate-fade-in"
                style={{ opacity }}
              >
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <UserPlus className="h-3 w-3 text-stream-gold" />
                  <span className="text-[11px] text-stream-gold font-semibold">{msg.user}</span>
                  <span className="text-[11px] text-white/70">sent a friend request</span>
                </div>
              </div>
            );
          }

          if (msg.giftIcon) {
            return (
              <div
                key={msg.id}
                className="animate-fade-in"
                style={{ opacity }}
              >
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-[11px] text-stream-gold font-semibold">{msg.user}</span>
                  <span className="text-[11px] text-white/70">{msg.message}</span>
                  <Gift className="h-3.5 w-3.5 text-stream-gold" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className="animate-fade-in"
              style={{ opacity }}
            >
              <div className="inline-flex items-start gap-1.5 max-w-[85%]">
                <span className={cn(
                  "text-[11px] font-semibold flex-shrink-0",
                  msg.isHost ? "text-stream-gold" : msg.isVIP ? "text-stream-cyan" : "text-white/60"
                )}>
                  {msg.user}
                </span>
                <span className="text-[11px] text-white/90 break-words">{msg.message}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
