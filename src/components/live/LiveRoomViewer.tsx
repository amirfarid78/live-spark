import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Share2, Gift, Users, Volume2, VolumeX, MoreHorizontal, Flag, Star, Sparkles, Crown, Zap } from "lucide-react";
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
  { id: "1", user: "JohnDoe", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50", message: "Welcome everyone! 🎉", isHost: true },
  { id: "2", user: "StarGirl", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50", message: "Love this stream!", isVIP: true },
  { id: "3", user: "Mike_M", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50", message: "Hi from NYC 🗽" },
  { id: "4", user: "Luna", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50", message: "Amazing vibes tonight", isVIP: true },
  { id: "5", user: "GamerX", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50", message: "First time here!", giftName: "Rose", giftIcon: "🌹" },
];

export function LiveRoomViewer({ streamId, hostName, hostAvatar, viewerCount, thumbnail, onClose }: LiveRoomViewerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [likes, setLikes] = useState(2341);
  const [showHeart, setShowHeart] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

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
      message: `sent a ${gift.name}`,
      giftName: gift.name,
      giftIcon: gift.icon,
    };
    setMessages(prev => [...prev, giftMessage]);
    setShowGiftPanel(false);
  };

  // Auto-scroll chat
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessages = [
        "This is fire! 🔥",
        "Love from Brazil 🇧🇷",
        "Keep going!",
        "You're amazing!",
        "❤️❤️❤️",
        "First time here!",
        "What song is this?",
      ];
      const randomUsers = ["Alex", "Emma", "Chris", "Taylor", "Jordan"];
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
        avatar: `https://i.pravatar.cc/50?u=${Date.now()}`,
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
      };
      setMessages(prev => [...prev.slice(-15), newMsg]);
    }, 3000);

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe">
        <div className="flex items-center justify-between">
          {/* Host Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-stream-live ring-offset-2 ring-offset-black">
                <AvatarImage src={hostAvatar} />
                <AvatarFallback>{hostName[0]}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-stream-live flex items-center justify-center">
                <Crown className="h-2.5 w-2.5 text-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{hostName}</span>
                <Badge className="bg-gradient-gold text-black border-0 text-[10px] px-1.5 py-0">
                  <Star className="h-2.5 w-2.5 mr-0.5" />
                  LV.15
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Users className="h-3 w-3" />
                <span>{viewerCount.toLocaleString()} watching</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIsFollowing(!isFollowing)}
              className={cn(
                "ml-2 rounded-full h-8 px-4 text-xs font-semibold transition-all",
                isFollowing
                  ? "bg-white/20 text-white border border-white/30"
                  : "bg-stream-coral text-white"
              )}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50 press-effect"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50 press-effect"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="flex items-center gap-3 mt-4">
          <Badge className="bg-stream-live text-white border-0 px-2.5 py-1 text-xs font-bold shadow-lg shadow-stream-live/30">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-white animate-pulse" />
            LIVE
          </Badge>
          <Badge className="bg-black/40 text-white border-0 px-2.5 py-1 text-xs backdrop-blur-sm">
            <Heart className="h-3 w-3 mr-1 text-stream-coral" />
            {likes.toLocaleString()}
          </Badge>
          <Badge className="bg-black/40 text-white border-0 px-2.5 py-1 text-xs backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1 text-stream-gold" />
            12.5K coins
          </Badge>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="absolute left-0 right-20 bottom-32 max-h-[40vh] overflow-hidden p-4">
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2 animate-fade-in-up",
                index === messages.length - 1 && "opacity-100",
                index === messages.length - 2 && "opacity-90",
                index === messages.length - 3 && "opacity-70",
                index < messages.length - 3 && "opacity-50"
              )}
            >
              <Avatar className="h-7 w-7 ring-1 ring-white/20">
                <AvatarImage src={msg.avatar} />
                <AvatarFallback>{msg.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-black/40 backdrop-blur-sm px-3 py-1.5">
                  <span className={cn(
                    "text-xs font-semibold",
                    msg.isHost ? "text-stream-gold" : msg.isVIP ? "text-stream-coral" : "text-white/80"
                  )}>
                    {msg.isHost && <Crown className="h-3 w-3 inline mr-1" />}
                    {msg.isVIP && <Star className="h-3 w-3 inline mr-1" />}
                    {msg.user}
                  </span>
                  {msg.giftIcon ? (
                    <span className="text-xs text-white">
                      {msg.message} <span className="text-lg">{msg.giftIcon}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-white">{msg.message}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-40 flex flex-col items-center gap-4">
        {/* Like */}
        <button onClick={handleLike} className="relative flex flex-col items-center gap-1 press-effect">
          <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Heart className={cn("h-6 w-6 transition-all", showHeart ? "text-stream-coral fill-stream-coral scale-125" : "text-white")} />
          </div>
          <span className="text-[10px] text-white font-medium">{(likes / 1000).toFixed(1)}K</span>
          {showHeart && (
            <Heart className="absolute -top-4 h-8 w-8 text-stream-coral fill-stream-coral animate-bounce-in" />
          )}
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-[10px] text-white font-medium">Chat</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-[10px] text-white font-medium">Share</span>
        </button>

        {/* More */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <MoreHorizontal className="h-6 w-6 text-white" />
          </div>
          <span className="text-[10px] text-white font-medium">More</span>
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe">
        <div className="flex items-center gap-3">
          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Say something..."
              className="w-full h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 pr-12 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-stream-purple/50"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center press-effect"
            >
              <Zap className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Gift Button */}
          <button
            onClick={() => setShowGiftPanel(true)}
            className="h-11 px-5 rounded-full bg-gradient-gold flex items-center gap-2 shadow-lg shadow-stream-gold/30 press-effect"
          >
            <Gift className="h-5 w-5 text-black" />
            <span className="text-sm font-bold text-black">Gift</span>
          </button>
        </div>
      </div>

      {/* Gift Panel */}
      {showGiftPanel && (
        <GiftPanel onClose={() => setShowGiftPanel(false)} onGiftSend={handleGiftSend} />
      )}
    </div>
  );
}
