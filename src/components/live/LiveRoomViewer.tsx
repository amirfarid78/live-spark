import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Share2, Gift, Users, Volume2, VolumeX, MoreHorizontal, Sparkles, Crown, Zap, Music2, UserPlus, Send, Smile, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GiftPanel } from "./GiftPanel";

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  isVIP?: boolean;
  isHost?: boolean;
  giftName?: string;
  giftIcon?: string;
}

interface LiveRoomViewerProps {
  streamId: string;
  hostName: string;
  hostAvatar: string;
  viewerCount: number;
  thumbnail: string;
  onClose: () => void;
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
  const [showHeart, setShowHeart] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [comments] = useState(2341);
  const [shares] = useState(892);

  const handleLike = () => {
    setLikes(prev => prev + 1);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 600);
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
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
      ];
      const randomUsers = ["Alex", "Emma", "Chris", "Taylor", "Jordan", "Sam", "Casey"];
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
        avatar: `https://i.pravatar.cc/50?u=${Date.now()}`,
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
      };
      setMessages(prev => [...prev.slice(-12), newMsg]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Background */}
      <div className="absolute inset-0">
        <img
          src={thumbnail}
          alt={hostName}
          className="h-full w-full object-cover"
        />
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left - Live indicator with viewers */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full pl-2.5 pr-3 py-1.5">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-5 w-5 rounded-full bg-stream-live/50 animate-ping" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-stream-live" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">LIVE</span>
              <span className="text-xs text-white/70">•</span>
              <Users className="h-3.5 w-3.5 text-white/80" />
              <span className="text-xs font-semibold text-white">{viewerCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center press-effect"
            >
              {isMuted ? <VolumeX className="h-4.5 w-4.5 text-white" /> : <Volume2 className="h-4.5 w-4.5 text-white" />}
            </button>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center press-effect"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Actions - TikTok Style */}
      <div className="absolute right-3 bottom-44 flex flex-col items-center gap-5 z-10">
        {/* Like */}
        <button onClick={handleLike} className="relative flex flex-col items-center gap-1 press-effect group">
          <div className="relative">
            <Heart 
              className={cn(
                "h-8 w-8 transition-all duration-200",
                showHeart 
                  ? "text-stream-coral fill-stream-coral scale-110" 
                  : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              )} 
            />
            {showHeart && (
              <Heart className="absolute inset-0 h-8 w-8 text-stream-coral fill-stream-coral animate-ping" />
            )}
          </div>
          <span className="text-xs font-bold text-white drop-shadow-lg">{formatNumber(likes)}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <MessageCircle className="h-8 w-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
          <span className="text-xs font-bold text-white drop-shadow-lg">{formatNumber(comments)}</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <Share2 className="h-7 w-7 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
          <span className="text-xs font-bold text-white drop-shadow-lg">{formatNumber(shares)}</span>
        </button>

        {/* Gift */}
        <button 
          onClick={() => setShowGiftPanel(true)}
          className="flex flex-col items-center gap-1 press-effect"
        >
          <div className="relative">
            <Gift className="h-7 w-7 text-stream-gold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-stream-gold animate-pulse" />
          </div>
        </button>

        {/* Spinning Music Disc */}
        <div className="relative h-12 w-12 mt-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black p-1 shadow-2xl animate-spin-slow">
            <div className="h-full w-full rounded-full overflow-hidden ring-2 ring-white/20">
              <img src={hostAvatar} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          {/* Vinyl grooves effect */}
          <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute inset-3 rounded-full border border-white/5 pointer-events-none" />
          {/* Center hole */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-3 w-3 rounded-full bg-black ring-1 ring-white/20" />
          </div>
          {/* Music note indicator */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2">
            <Music2 className="h-3.5 w-3.5 text-white/80" />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {/* Chat Messages */}
        <div className="px-3 mb-3 max-h-[25vh] overflow-hidden">
          <div className="space-y-2">
            {messages.slice(-6).map((msg, index) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2 animate-fade-in",
                  index === messages.length - 1 && "opacity-100",
                  index < messages.length - 1 && `opacity-${90 - (messages.length - 1 - index) * 20}`
                )}
                style={{ opacity: 1 - (messages.slice(-6).length - 1 - index) * 0.15 }}
              >
                <Avatar className="h-7 w-7 ring-1 ring-white/30 flex-shrink-0">
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback className="text-[10px]">{msg.user[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl bg-black/30 backdrop-blur-sm px-3 py-1.5 max-w-full">
                    <span className={cn(
                      "text-xs font-bold flex-shrink-0",
                      msg.isHost ? "text-stream-gold" : msg.isVIP ? "text-stream-pink" : "text-white/90"
                    )}>
                      {msg.user}
                    </span>
                    {msg.giftIcon ? (
                      <span className="text-xs text-white flex items-center gap-1">
                        {msg.message} <span className="text-base">{msg.giftIcon}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-white/80">{msg.message}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Host Info + Follow */}
        <div className="px-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-stream-coral/50 ring-offset-2 ring-offset-black/50">
                <AvatarImage src={hostAvatar} />
                <AvatarFallback>{hostName[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-stream-live flex items-center justify-center ring-2 ring-black">
                <Crown className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{hostName}</span>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all press-effect",
                    isFollowing
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-gradient-to-r from-stream-coral to-stream-pink text-white shadow-lg shadow-stream-coral/30"
                  )}
                >
                  <UserPlus className="h-3 w-3" />
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
              <span className="text-xs text-white/60">@{hostName.toLowerCase().replace(" ", "_")}</span>
            </div>
          </div>
          
          {/* Stream Description */}
          <div className="mt-2 pr-16">
            <p className="text-sm text-white/90 line-clamp-2">
              What's Happen Today? 🌙
            </p>
            <p className="text-xs text-white/60 mt-0.5">
              Today Very Happy Because Chill Vibes ✨
            </p>
          </div>
        </div>

        {/* Bottom Input Bar */}
        <div className="px-3 pb-safe bg-gradient-to-t from-black/80 to-transparent pt-3">
          <div className="flex items-center gap-2">
            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Say something nice..."
                className="w-full h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 pr-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Smile className="h-5 w-5 text-white/50" />
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className="h-10 w-10 rounded-full bg-gradient-to-r from-stream-purple to-stream-coral flex items-center justify-center shadow-lg press-effect"
            >
              <Send className="h-4 w-4 text-white ml-0.5" />
            </button>

            {/* Gift Button */}
            <button
              onClick={() => setShowGiftPanel(true)}
              className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg shadow-stream-gold/30 press-effect"
            >
              <Gift className="h-5 w-5 text-black" />
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
