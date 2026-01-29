import React, { useState, useEffect, useRef } from "react";
import { X, Users, Share2, MoreHorizontal, Mic, MicOff, Gift, MessageCircle, Send, Music, Sparkles, Hand, Volume2, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const mockSeats: { id: number; status: SeatStatus; speaker?: Speaker }[] = [
  { id: 1, status: "occupied", speaker: { id: "1", name: "Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", isSpeaking: true, isMuted: false, isHost: true, level: 45 } },
  { id: 2, status: "occupied", speaker: { id: "2", name: "Daniel Taylor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", isSpeaking: false, isMuted: true, level: 32 } },
  { id: 3, status: "empty" },
  { id: 4, status: "locked" },
  { id: 5, status: "locked" },
  { id: 6, status: "occupied", speaker: { id: "3", name: "Alexander Phillips", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", isSpeaking: false, isMuted: false, level: 28 } },
  { id: 7, status: "locked" },
  { id: 8, status: "occupied", speaker: { id: "4", name: "Matthew Sanchez", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", isSpeaking: true, isMuted: false, level: 15 } },
  { id: 9, status: "occupied", speaker: { id: "5", name: "Joseph Rogers", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", isSpeaking: false, isMuted: true, level: 22 } },
  { id: 10, status: "locked" },
  { id: 11, status: "empty" },
  { id: 12, status: "empty" },
];

const mockMessages: ChatMessage[] = [
  { id: "1", user: "Guest", avatar: "", message: "give me your mobile number" },
  { id: "2", user: "Lily Adams", avatar: "https://i.pravatar.cc/50?u=lily", message: "Your Hotness is beating me everytime?" },
  { id: "3", user: "Bailey Mia", avatar: "https://i.pravatar.cc/50?u=bailey", message: "looking very very hot" },
  { id: "4", user: "Thomas", avatar: "https://i.pravatar.cc/50?u=thomas", message: "can we talk?" },
];

export function PartyRoomViewer({ room, onClose }: PartyRoomViewerProps) {
  const [seats, setSeats] = useState(mockSeats);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
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
      // Request to join as speaker
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
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50",
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
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50",
      message: `sent ${gift.name}`,
      isGift: true,
      giftIcon: gift.icon,
    };
    setMessages(prev => [...prev, giftMessage]);
    setShowGiftPanel(false);
  };

  // Simulate chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessages = [
        "Hey everyone! 👋",
        "This room is lit 🔥",
        "Can I get on mic?",
        "Love the vibes here",
        "❤️❤️❤️",
      ];
      const randomUsers = ["Emma", "Chris", "Taylor", "Jordan", "Sam"];
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
        avatar: `https://i.pravatar.cc/50?u=${Date.now()}`,
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
      };
      setMessages(prev => [...prev.slice(-15), newMsg]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(180deg, 
          rgba(88, 28, 135, 0.95) 0%, 
          rgba(59, 7, 100, 0.98) 40%,
          rgba(30, 10, 60, 1) 100%)`
      }}
    >
      {/* Background Image Overlay */}
      {room.coverImage && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${room.coverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px)",
          }}
        />
      )}

      {/* Flying Gifts */}
      {flyingGifts.map((gift) => (
        <LiveGiftAnimation key={gift.id} gift={gift} />
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-11 w-11 ring-2 ring-white/30">
              <AvatarImage src={room.hostAvatar} />
              <AvatarFallback>{room.hostName[0]}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-stream-live ring-2 ring-background" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{room.name}</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-stream-gold/20 text-stream-gold border-0 text-[10px] h-5">
                <Users className="mr-1 h-3 w-3" />
                {room.viewerCount}
              </Badge>
              <span className="text-[10px] text-white/50">ID:{room.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
            <Share2 className="h-5 w-5" />
          </Button>
          <button 
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center press-effect"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </header>

      {/* Coin Display */}
      <div className="px-4 mb-2">
        <Badge className="bg-stream-gold/20 text-stream-gold border-0">
          💰 1.5k
        </Badge>
      </div>

      {/* Speaker Grid */}
      <div className="relative z-10 px-4 py-4">
        <div className="grid grid-cols-4 gap-4 justify-items-center">
          {seats.slice(0, room.maxSpeakers).map((seat) => (
            <SpeakerSeat 
              key={seat.id} 
              seat={seat} 
              onSeatClick={handleSeatClick}
            />
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 relative z-10 px-4 overflow-hidden">
        <div className="h-full flex flex-col justify-end pb-2">
          <div className="space-y-2 overflow-y-auto max-h-[40vh]">
            {messages.slice(-10).map((msg, index) => {
              const opacity = 1 - (messages.slice(-10).length - 1 - index) * 0.08;
              return (
                <div 
                  key={msg.id} 
                  className="animate-fade-in"
                  style={{ opacity: Math.max(opacity, 0.4) }}
                >
                  <div className="inline-flex items-start gap-2 max-w-[85%]">
                    {msg.avatar && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback className="text-[10px]">{msg.user[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="bg-white/10 rounded-xl rounded-tl-sm px-3 py-1.5 backdrop-blur-sm">
                      <span className="text-xs font-medium text-stream-cyan">{msg.user}</span>
                      <p className="text-xs text-white/90">
                        {msg.message}
                        {msg.giftIcon && <span className="ml-1">{msg.giftIcon}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 px-4 pb-6 pt-3" style={{ background: 'linear-gradient(to top, rgba(30, 10, 60, 0.98), transparent)' }}>
        <div className="flex items-center gap-3">
          {/* Message Input */}
          <div className="flex-1 h-11 rounded-full bg-white/10 border border-white/20 flex items-center px-4 gap-2">
            <MessageCircle className="h-4 w-4 text-white/50" />
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Say Something..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
            <button onClick={handleSendMessage} className="text-stream-cyan">
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Music Button */}
          <button className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center press-effect shadow-lg">
            <Music className="h-5 w-5 text-white" />
          </button>

          {/* Emoji Button */}
          <button className="h-11 w-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center press-effect shadow-lg">
            <span className="text-lg">😊</span>
          </button>

          {/* Gift Button */}
          <button 
            onClick={() => setShowGiftPanel(true)}
            className="h-11 w-11 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center press-effect shadow-lg"
          >
            <Gift className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Mic Controls (shown if user is speaker) */}
        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "h-12 px-6 rounded-full flex items-center gap-2 press-effect transition-all",
              isMuted 
                ? "bg-destructive/20 text-destructive" 
                : "bg-stream-cyan/20 text-stream-cyan"
            )}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            <span className="text-sm font-medium">{isMuted ? "Muted" : "Speaking"}</span>
          </button>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center press-effect",
              isAudioMuted ? "bg-white/10" : "bg-white/20"
            )}
          >
            {isAudioMuted ? <VolumeX className="h-5 w-5 text-white/50" /> : <Volume2 className="h-5 w-5 text-white" />}
          </button>

          {!hasRequestedSeat && (
            <button className="h-12 px-6 rounded-full bg-stream-purple/20 text-stream-purple flex items-center gap-2 press-effect">
              <Hand className="h-5 w-5" />
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
