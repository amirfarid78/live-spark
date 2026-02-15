import React, { useState, useEffect, useRef } from "react";
import { X, Users, Share2, Mic, MicOff, Gift, MessageCircle, Send, Music, Hand, Volume2, VolumeX, Sparkles, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SpeakerSeat, Speaker, SeatStatus } from "./SpeakerSeat";
import { GiftPanel } from "@/components/live/GiftPanel";
import { LiveGiftAnimation } from "@/components/live/LiveGiftAnimation";
import { FlyingGift } from "@/components/live/LiveRoomViewer";

interface PartyRoomViewerProps {
  room: {
    id: string;
    name: string;
    hostName: string;
    hostAvatar: string;
    coverImage?: string;
    viewerCount: number;
    maxSpeakers: number;
    isPrivate: boolean;
    category: string;
  };
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  isGift?: boolean;
  giftIcon?: string;
}

const initialSeats: { id: number; status: SeatStatus; speaker: Speaker | null }[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: "empty" as const,
  speaker: null,
}));

export function PartyRoomViewer({ room, onClose }: PartyRoomViewerProps) {
  const [seats, setSeats] = useState(initialSeats);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "system-1", user: "System", avatar: "", message: "Welcome to the party room!" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [flyingGifts, setFlyingGifts] = useState<FlyingGift[]>([]);
  const [hasRequestedSeat, setHasRequestedSeat] = useState(false);
  const giftIdRef = useRef(0);

  const handleSeatClick = (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    if (seat.status === "empty" && !hasRequestedSeat) {
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: "requested" as SeatStatus } : s
      ));
      setHasRequestedSeat(true);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "",
      message: inputMessage,
    };
    setMessages(prev => [...prev, newMsg]);
    setInputMessage("");
  };

  const handleGiftSend = (gift: { name: string; icon: string; price: number }) => {
    const newGift: FlyingGift = {
      id: giftIdRef.current++,
      icon: gift.icon,
      name: gift.name,
      sender: "You",
    };
    setFlyingGifts(prev => [...prev, newGift]);
    
    setTimeout(() => {
      setFlyingGifts(prev => prev.filter(g => g.id !== newGift.id));
    }, 3500);

    const giftMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "",
      message: `sent ${gift.name}`,
      isGift: true,
      giftIcon: gift.icon,
    };
    setMessages(prev => [...prev, giftMessage]);
    setShowGiftPanel(false);
  };


  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden animate-fade-in">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, 
              rgba(88, 28, 135, 0.98) 0%, 
              rgba(59, 7, 100, 0.99) 40%,
              rgba(30, 10, 60, 1) 100%)`
        }}
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-slow opacity-20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <Sparkles className="h-4 w-4 text-stream-gold" />
          </div>
        ))}
      </div>

      {/* Flying Gifts */}
      {flyingGifts.map((gift) => (
        <LiveGiftAnimation key={gift.id} gift={gift} />
      ))}

      {/* Header with glassmorphism */}
      <header className="relative z-10 px-4 py-3">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            {/* Host Avatar with 3D ring */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-stream-purple via-stream-coral to-stream-purple animate-spin-slow opacity-50 blur-sm" />
              <Avatar className="h-12 w-12 ring-2 ring-white/30 relative">
                <AvatarImage src={room.hostAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-stream-purple to-stream-coral">
                  {room.hostName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-stream-live ring-2 ring-purple-900 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">{room.name}</p>
                <Crown className="h-4 w-4 text-stream-gold" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-gradient-to-r from-stream-gold/30 to-orange-500/30 text-stream-gold border-0 text-[10px] h-5 shadow-inner">
                  <Users className="mr-1 h-3 w-3" />
                  {room.viewerCount.toLocaleString()}
                </Badge>
                <span className="text-[10px] text-white/40 font-mono">ID:{room.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all press-effect border border-white/10">
              <Share2 className="h-4 w-4 text-white" />
            </button>
            <button 
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-all press-effect border border-white/10"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Coin Display with shine effect */}
      <div className="relative z-10 px-4 mb-2">
        <Badge className="bg-gradient-to-r from-stream-gold/20 to-orange-500/20 text-stream-gold border border-stream-gold/20 shadow-lg shadow-stream-gold/10 animate-glow-pulse">
          💰 1.5k
        </Badge>
      </div>

      {/* Speaker Grid with 3D container */}
      <div className="relative z-10 px-4 py-4">
        <div className="relative p-4 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
          {/* Grid glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-stream-purple/10 to-transparent pointer-events-none" />
          
          <div className="grid grid-cols-4 gap-4 justify-items-center relative">
            {seats.slice(0, room.maxSpeakers).map((seat, index) => (
              <div 
                key={seat.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SpeakerSeat 
                  seat={seat} 
                  onSeatClick={handleSeatClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Section with enhanced styling */}
      <div className="flex-1 relative z-10 px-4 overflow-hidden">
        <div className="h-full flex flex-col justify-end pb-2">
          <div className="space-y-2 overflow-y-auto max-h-[35vh] pr-2">
            {messages.slice(-10).map((msg, index) => {
              const opacity = 1 - (messages.slice(-10).length - 1 - index) * 0.08;
              return (
                <div 
                  key={msg.id} 
                  className="animate-fade-in-up"
                  style={{ 
                    opacity: Math.max(opacity, 0.4),
                    animationDelay: `${index * 30}ms`
                  }}
                >
                  <div className="inline-flex items-start gap-2 max-w-[85%]">
                    {msg.avatar && (
                      <Avatar className="h-7 w-7 flex-shrink-0 ring-1 ring-white/20">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-stream-purple to-stream-coral">
                          {msg.user[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-3 py-2 border border-white/5 shadow-lg">
                      <span className="text-xs font-semibold text-stream-cyan">{msg.user}</span>
                      <p className="text-xs text-white/90 mt-0.5">
                        {msg.message}
                        {msg.giftIcon && <span className="ml-1 text-base">{msg.giftIcon}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls with frosted glass */}
      <div 
        className="relative z-10 px-4 pb-6 pt-4"
        style={{ 
          background: 'linear-gradient(to top, rgba(20, 5, 40, 0.98) 0%, rgba(20, 5, 40, 0.8) 70%, transparent 100%)'
        }}
      >
        <div className="flex items-center gap-2">
          {/* Message Input with glow */}
          <div className="flex-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-stream-purple to-stream-coral rounded-full opacity-0 group-focus-within:opacity-30 blur transition-opacity" />
            <div className="relative h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center px-4 gap-2 transition-all focus-within:border-stream-purple/50">
              <MessageCircle className="h-4 w-4 text-white/40" />
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Say Something..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button 
                onClick={handleSendMessage}
                className="h-8 w-8 rounded-full bg-gradient-to-r from-stream-cyan to-teal-400 flex items-center justify-center shadow-lg shadow-stream-cyan/30 press-effect"
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Action Buttons with 3D effect */}
          <button className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center press-effect shadow-lg shadow-orange-500/30 border border-white/20">
            <Music className="h-5 w-5 text-white" />
          </button>

          <button className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center press-effect shadow-lg shadow-yellow-500/30 border border-white/20">
            <span className="text-xl">😊</span>
          </button>

          <button 
            onClick={() => setShowGiftPanel(true)}
            className="relative h-12 w-12 rounded-full bg-gradient-to-br from-red-400 via-pink-500 to-rose-600 flex items-center justify-center press-effect shadow-lg shadow-rose-500/30 border border-white/20"
          >
            <Gift className="h-5 w-5 text-white" />
            {/* Gift notification badge */}
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-stream-gold flex items-center justify-center animate-bounce">
              <Sparkles className="h-2.5 w-2.5 text-black" />
            </span>
          </button>
        </div>

        {/* Mic Controls */}
        <div className="flex justify-center gap-3 mt-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "h-11 px-5 rounded-full flex items-center gap-2 press-effect transition-all border",
              isMuted 
                ? "bg-red-500/20 border-red-500/30 text-red-400" 
                : "bg-stream-cyan/20 border-stream-cyan/30 text-stream-cyan shadow-lg shadow-stream-cyan/20"
            )}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="text-sm font-medium">{isMuted ? "Muted" : "Speaking"}</span>
          </button>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={cn(
              "h-11 w-11 rounded-full flex items-center justify-center press-effect border transition-all",
              isAudioMuted 
                ? "bg-white/5 border-white/10 text-white/40" 
                : "bg-white/10 border-white/20 text-white"
            )}
          >
            {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {!hasRequestedSeat && (
            <button className="h-11 px-5 rounded-full bg-gradient-to-r from-stream-purple/30 to-stream-coral/30 border border-stream-purple/30 text-white flex items-center gap-2 press-effect shadow-lg">
              <Hand className="h-4 w-4" />
              <span className="text-sm font-medium">Raise Hand</span>
            </button>
          )}
        </div>
      </div>

      {/* Gift Panel */}
      {showGiftPanel && (
        <GiftPanel onClose={() => setShowGiftPanel(false)} onGiftSend={handleGiftSend} />
      )}
    </div>
  );
}
