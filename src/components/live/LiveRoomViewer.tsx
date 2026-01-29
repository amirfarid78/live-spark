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
      "fixed inset-0 z-[100] bg-black overflow-hidden transition-opacity duration-500",
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-[#0d0d1a]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        
        {/* Premium purple/blue ambient glow */}
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-[#12122a] via-[#12122a]/50 to-transparent pointer-events-none" />
        
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
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
        <div className="px-4 mb-2 animate-fade-in-up stagger-1">
          <p className="text-[11px] text-stream-cyan leading-relaxed">
            Room name : Welcome to join the live. Any content related to violence, gambling, illegal dealing will be banned.
          </p>
        </div>

        {/* Chat Messages */}
        <LiveChatSection messages={messages} />

        {/* Premium Bottom Input Bar */}
        <div className="px-3 pb-6 pt-4" style={{ background: 'linear-gradient(to top, rgba(13, 13, 26, 0.98) 0%, rgba(13, 13, 26, 0.85) 60%, transparent 100%)' }}>
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
                className="w-full h-12 rounded-full bg-white/8 backdrop-blur-xl border border-white/15 pl-11 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-stream-purple/60 focus:bg-white/12 transition-all shadow-inner"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Send className="h-5 w-5 text-white/60" />
              </button>
            </div>

            {/* Heart/Like Button - Premium */}
            <button
              onClick={handleLike}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/40 press-effect relative overflow-hidden group ring-2 ring-pink-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              <span className="text-xl relative z-10">🤟</span>
            </button>

            {/* Gift Button - Premium with Glow */}
            <button
              onClick={() => setShowGiftPanel(true)}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-red-400 via-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/40 press-effect relative overflow-hidden group ring-2 ring-rose-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              <Gift className="h-5 w-5 text-white relative z-10" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 flex items-center justify-center animate-pulse shadow-lg shadow-yellow-400/50">
                <Sparkles className="h-2.5 w-2.5 text-yellow-900" />
              </div>
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
