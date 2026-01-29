import React, { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Share2, Gift, Users, Volume2, VolumeX, Crown, UserPlus, Send, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { GiftPanel } from "./GiftPanel";
import { LiveChatSection } from "./LiveChatSection";
import { LiveActionBar } from "./LiveActionBar";
import { LiveHostInfo } from "./LiveHostInfo";
import { LiveTopBar } from "./LiveTopBar";

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
}

const mockMessages: ChatMessage[] = [
  { id: "1", user: "StarGirl", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50", message: "You look amazing! 💖", isVIP: true },
  { id: "2", user: "Mike_M", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50", message: "Hi from NYC 🗽" },
  { id: "3", user: "Luna", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50", message: "First time here!", isVIP: true },
  { id: "4", user: "GamerX", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50", message: "sent a Rose 🌹", giftName: "Rose", giftIcon: "🌹" },
];

export function LiveRoomViewer({ streamId, hostName, hostAvatar, viewerCount, thumbnail, onClose }: LiveRoomViewerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [likes, setLikes] = useState(124500);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [comments] = useState(2341);
  const [shares] = useState(892);
  const heartIdRef = useRef(0);

  const handleLike = () => {
    setLikes(prev => prev + 1);
    // Create floating heart
    const newHeart = {
      id: heartIdRef.current++,
      x: Math.random() * 40 - 20, // Random offset
    };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
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
        "Keep going!",
        "This is fire! 🔥",
        "Wow so pretty! 💕",
        "Hello everyone 👋",
      ];
      const randomUsers = ["Alex", "Emma", "Chris", "Taylor", "Jordan", "Sam", "Casey", "Riley", "Morgan"];
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
        avatar: `https://i.pravatar.cc/50?u=${Date.now()}`,
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        isVIP: Math.random() > 0.8,
      };
      setMessages(prev => [...prev.slice(-15), newMsg]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Video Background with Premium Overlay */}
      <div className="absolute inset-0">
        <img
          src={thumbnail}
          alt={hostName}
          className="h-full w-full object-cover scale-105"
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
        
        {/* Ambient glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-stream-purple/10 to-transparent pointer-events-none" />
      </div>

      {/* Floating Hearts Animation */}
      <div className="absolute right-16 bottom-48 pointer-events-none z-20">
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute animate-float-heart"
            style={{ 
              left: `${heart.x}px`,
              animationDuration: `${1.5 + Math.random() * 0.5}s`
            }}
          >
            <Heart className="h-6 w-6 text-stream-coral fill-stream-coral drop-shadow-glow" />
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <LiveTopBar
        viewerCount={viewerCount}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onClose={onClose}
      />

      {/* Right Side Actions */}
      <LiveActionBar
        likes={likes}
        comments={comments}
        shares={shares}
        hostAvatar={hostAvatar}
        onLike={handleLike}
        onGiftOpen={() => setShowGiftPanel(true)}
      />

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {/* Chat Messages */}
        <LiveChatSection messages={messages} />

        {/* Host Info + Follow */}
        <LiveHostInfo
          hostName={hostName}
          hostAvatar={hostAvatar}
          isFollowing={isFollowing}
          onFollowToggle={() => setIsFollowing(!isFollowing)}
        />

        {/* Bottom Input Bar */}
        <div className="px-3 pb-safe bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-4">
          <div className="flex items-center gap-2.5">
            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Say something..."
                className="w-full h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 px-5 pr-12 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
              />
              <button className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-lg">😊</span>
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className="h-11 w-11 rounded-full bg-gradient-to-br from-stream-purple to-stream-coral flex items-center justify-center shadow-lg shadow-stream-purple/30 press-effect hover:shadow-stream-purple/50 transition-shadow"
            >
              <Send className="h-4.5 w-4.5 text-white ml-0.5" />
            </button>

            {/* Gift Button */}
            <button
              onClick={() => setShowGiftPanel(true)}
              className="h-11 w-11 rounded-full bg-gradient-to-br from-stream-gold via-yellow-400 to-orange-400 flex items-center justify-center shadow-lg shadow-stream-gold/40 press-effect relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20 group-hover:opacity-100 opacity-0 transition-opacity" />
              <Gift className="h-5 w-5 text-black relative z-10" />
              <Sparkles className="absolute -top-0.5 -right-0.5 h-3 w-3 text-white animate-pulse" />
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
