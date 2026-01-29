import React, { useState, useEffect, useRef } from "react";
import { Heart, Gift, Send, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { GiftPanel } from "./GiftPanel";
import { LiveChatSection } from "./LiveChatSection";
import { LiveTopBar } from "./LiveTopBar";
import { LiveOpeningAnimation } from "./LiveOpeningAnimation";

interface LiveRoomViewerProps {
  streamId: string;
  hostName: string;
  hostAvatar: string;
  viewerCount: number;
  thumbnail: string;
  onClose: () => void;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  isVIP?: boolean;
  isHost?: boolean;
  giftName?: string;
  giftIcon?: string;
  isSystem?: boolean;
  isFriendRequest?: boolean;
}

const mockMessages: ChatMessage[] = [
  { id: "1", user: "System", avatar: "", message: "Welcome to the room", isSystem: true },
  { id: "2", user: "StarGirl", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50", message: "You look amazing! 💖", isVIP: true },
  { id: "3", user: "Mike_M", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50", message: "Hi from NYC 🗽" },
  { id: "4", user: "Luna", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50", message: "Sent Friend Request", isFriendRequest: true, isVIP: true },
  { id: "5", user: "GamerX", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50", message: "Very Nice!", isVIP: true },
];

// Top viewers with VIP frames
const topViewers = [
  { id: "1", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50", isVIP: true, level: 3 },
  { id: "2", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50", isVIP: true, level: 2 },
  { id: "3", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50", isVIP: false, level: 1 },
  { id: "4", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50", isVIP: true, level: 3 },
  { id: "5", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50", isVIP: false, level: 1 },
];

export function LiveRoomViewer({ streamId, hostName, hostAvatar, viewerCount, thumbnail, onClose }: LiveRoomViewerProps) {
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; color: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const heartIdRef = useRef(0);

  // Handle opening animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOpeningAnimation(false);
      setTimeout(() => setIsLoaded(true), 100);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = () => {
    const colors = ["#FF6B6B", "#FF85A2", "#FFB6C1", "#FF69B4", "#FF1493"];
    const newHeart = {
      id: heartIdRef.current++,
      x: Math.random() * 60 - 30,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50",
      message: inputMessage,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
  };

  const handleGiftSend = (gift: { name: string; icon: string; price: number }) => {
    const giftMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50",
      message: `sent ${gift.name}`,
      giftName: gift.name,
      giftIcon: gift.icon,
    };
    setMessages(prev => [...prev, giftMessage]);
    setShowGiftPanel(false);
  };

  // Auto-scroll chat with new messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessages = [
        "Love this stream! 🔥",
        "Amazing vibes ✨",
        "Hi from Brazil 🇧🇷",
        "You're the best!",
        "❤️❤️❤️",
        "Very Nice Cloths",
        "This is fire! 🔥",
        "Wow so pretty! 💕",
        "Hello everyone 👋",
      ];
      const randomUsers = ["John Daveldeo", "Emma_Star", "Chris", "Taylor", "Jordan", "Sam_VIP", "Casey", "Riley", "Morgan"];
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
        avatar: `https://i.pravatar.cc/50?u=${Date.now()}`,
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        isVIP: Math.random() > 0.7,
        isFriendRequest: Math.random() > 0.9,
      };
      setMessages(prev => [...prev.slice(-12), newMsg]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Show opening animation
  if (showOpeningAnimation) {
    return (
      <LiveOpeningAnimation
        hostName={hostName}
        hostAvatar={hostAvatar}
        thumbnail={thumbnail}
      />
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black overflow-hidden transition-opacity duration-500",
      isLoaded ? "opacity-100" : "opacity-0"
    )}>
      {/* Video Background with Premium Overlay */}
      <div className="absolute inset-0">
        <img
          src={thumbnail}
          alt={hostName}
          className="h-full w-full object-cover animate-scale-in-slow"
        />
        {/* Modern gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-[#1a1a2e]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        
        {/* Purple/Blue ambient glow */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#1a1a40]/90 via-[#1a1a40]/30 to-transparent pointer-events-none" />
      </div>

      {/* Floating Hearts Animation */}
      <div className="absolute right-8 bottom-60 pointer-events-none z-20">
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute animate-float-heart-modern"
            style={{ 
              left: `${heart.x}px`,
            }}
          >
            <Heart 
              className="h-7 w-7 drop-shadow-[0_0_12px_currentColor]" 
              style={{ color: heart.color, fill: heart.color }}
            />
          </div>
        ))}
      </div>

      {/* Top Bar with Host Info & Viewers */}
      <LiveTopBar
        hostName={hostName}
        hostAvatar={hostAvatar}
        viewerCount={viewerCount}
        topViewers={topViewers}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onClose={onClose}
      />

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {/* Room Announcement */}
        <div className="px-4 mb-3 animate-fade-in-up stagger-1">
          <p className="text-xs text-stream-cyan leading-relaxed">
            Room name : Welcome to join the live. Any content related to violence, gambling, illegal dealing will be banned.
          </p>
        </div>

        {/* Chat Messages */}
        <LiveChatSection messages={messages} />

        {/* Bottom Input Bar */}
        <div className="px-3 pb-safe bg-gradient-to-t from-[#1a1a40] via-[#1a1a40]/80 to-transparent pt-4">
          <div className="flex items-center gap-3">
            {/* Message Input */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <MessageSquare className="h-4 w-4 text-white/40" />
              </div>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type Something..."
                className="w-full h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 pl-11 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-stream-purple/50 focus:bg-white/15 transition-all"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Send className="h-5 w-5 text-white/60" />
              </button>
            </div>

            {/* Heart/Like Button */}
            <button
              onClick={handleLike}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 press-effect relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xl">🤟</span>
            </button>

            {/* Gift Button */}
            <button
              onClick={() => setShowGiftPanel(true)}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/30 press-effect relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Gift className="h-5 w-5 text-white" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-yellow-300 animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Gift Panel */}
      {showGiftPanel && (
        <GiftPanel onClose={() => setShowGiftPanel(false)} onGiftSend={handleGiftSend} />
      )}
    </div>
  );
}
