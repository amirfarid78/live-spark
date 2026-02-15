import React, { useState, useEffect, useRef } from "react";
import { Heart, Gift, Send, Sparkles, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GiftPanel } from "./GiftPanel";
import { LiveChatSection } from "./LiveChatSection";
import { LiveTopBar } from "./LiveTopBar";
import { LiveOpeningAnimation } from "./LiveOpeningAnimation";
import { LiveGiftAnimation } from "./LiveGiftAnimation";

interface LiveRoomViewerProps {
  streamId: string;
  hostName: string;
  hostAvatar: string;
  viewerCount: number;
  thumbnail: string;
  isHost?: boolean;
  onClose: () => void;
  onEndStream?: (streamId: string) => void;
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

export interface FlyingGift {
  id: number;
  icon: string;
  name: string;
  sender: string;
}

const mockMessages: ChatMessage[] = [
  { id: "1", user: "System", avatar: "", message: "Welcome to the room", isSystem: true },
  { id: "2", user: "StarGirl", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50", message: "You look amazing! 💖", isVIP: true },
  { id: "3", user: "Mike_M", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50", message: "Hi from NYC 🗽" },
  { id: "4", user: "Luna", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50", message: "Sent Friend Request", isFriendRequest: true, isVIP: true },
  { id: "5", user: "GamerX", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50", message: "Very Nice!", isVIP: true },
];

const topViewers = [
  { id: "1", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50", isVIP: true, level: 3 },
  { id: "2", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50", isVIP: true, level: 2 },
  { id: "3", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50", isVIP: false, level: 1 },
  { id: "4", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50", isVIP: true, level: 3 },
  { id: "5", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50", isVIP: false, level: 1 },
];

export function LiveRoomViewer({ streamId, hostName, hostAvatar, viewerCount, thumbnail, isHost, onClose, onEndStream }: LiveRoomViewerProps) {
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; color: string }[]>([]);
  const [flyingGifts, setFlyingGifts] = useState<FlyingGift[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const heartIdRef = useRef(0);
  const giftIdRef = useRef(0);

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
    // Add flying gift animation
    const newGift: FlyingGift = {
      id: giftIdRef.current++,
      icon: gift.icon,
      name: gift.name,
      sender: "You",
    };
    setFlyingGifts(prev => [...prev, newGift]);
    
    // Remove after animation
    setTimeout(() => {
      setFlyingGifts(prev => prev.filter(g => g.id !== newGift.id));
    }, 3500);

    // Add chat message
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
      {/* Video Background */}
      <div className="absolute inset-0">
        <img
          src={thumbnail}
          alt={hostName}
          className="h-full w-full object-cover animate-scale-in-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-[#0d0d1a]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-[#12122a] via-[#12122a]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
      </div>

      {/* Flying Gift Animations */}
      {flyingGifts.map((gift) => (
        <LiveGiftAnimation key={gift.id} gift={gift} />
      ))}

      {/* Floating Hearts Animation */}
      <div className="absolute right-8 bottom-60 pointer-events-none z-20">
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute animate-float-heart-modern"
            style={{ left: `${heart.x}px` }}
          >
            <Heart 
              className="h-7 w-7 drop-shadow-[0_0_12px_currentColor]" 
              style={{ color: heart.color, fill: heart.color }}
            />
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <LiveTopBar
        hostName={hostName}
        hostAvatar={hostAvatar}
        viewerCount={viewerCount}
        topViewers={topViewers}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onClose={onClose}
      />

      {isHost && onEndStream && (
        <div className="absolute top-16 right-3 z-20">
          <button
            onClick={() => onEndStream(streamId)}
            className="px-4 py-2 rounded-full bg-red-600/90 text-white text-xs font-semibold backdrop-blur-sm press-effect"
            data-testid="button-end-stream"
          >
            End Stream
          </button>
        </div>
      )}

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
        <div className="px-3 pb-6 pt-4" style={{ background: 'linear-gradient(to top, rgba(10, 10, 20, 0.98) 0%, rgba(10, 10, 20, 0.9) 50%, transparent 100%)' }}>
          <div className="flex items-center gap-3">
            {/* Modern Visible Input */}
            <div className={cn(
              "flex-1 relative transition-all duration-300",
              isFocused && "scale-[1.02]"
            )}>
              {/* Glow effect when focused */}
              {isFocused && (
                <div className="absolute -inset-1 bg-gradient-to-r from-stream-purple/30 via-stream-coral/30 to-stream-purple/30 rounded-full blur-md animate-pulse" />
              )}
              
              <div className={cn(
                "relative flex items-center h-12 rounded-full transition-all duration-300",
                "bg-[#1a1a2e] border-2",
                isFocused 
                  ? "border-stream-purple/60 shadow-lg shadow-stream-purple/20" 
                  : "border-white/20 hover:border-white/30"
              )}>
                {/* Icon */}
                <div className="pl-4 pr-2">
                  <MessageCircle className={cn(
                    "h-5 w-5 transition-colors",
                    isFocused ? "text-stream-purple" : "text-white/50"
                  )} />
                </div>
                
                {/* Input */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type Something..."
                  className="flex-1 h-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none pr-3"
                />
                
                {/* Send Button inside input */}
                <button 
                  onClick={handleSendMessage}
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center mr-1.5 transition-all",
                    inputMessage.trim() 
                      ? "bg-gradient-to-br from-stream-purple to-stream-coral text-white shadow-md" 
                      : "bg-white/10 text-white/40"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Heart/Like Button */}
            <button
              onClick={handleLike}
              className="relative h-12 w-12 rounded-full flex items-center justify-center press-effect group"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600 shadow-lg shadow-pink-500/40" />
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30" />
              {/* Ring */}
              <div className="absolute inset-0 rounded-full ring-2 ring-pink-300/40 ring-offset-1 ring-offset-transparent" />
              <span className="text-xl relative z-10">🤟</span>
            </button>

            {/* Gift Button */}
            <button
              onClick={() => setShowGiftPanel(true)}
              className="relative h-12 w-12 rounded-full flex items-center justify-center press-effect group"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 via-rose-500 to-pink-600 shadow-lg shadow-rose-500/40" />
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30" />
              {/* Ring */}
              <div className="absolute inset-0 rounded-full ring-2 ring-rose-300/40 ring-offset-1 ring-offset-transparent" />
              <Gift className="h-5 w-5 text-white relative z-10" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-400/50 animate-bounce">
                <Sparkles className="h-3 w-3 text-white" />
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
