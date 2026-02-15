import { useState, useEffect, useRef, useCallback } from "react";
import { X, Users, Share2, Mic, MicOff, Gift, MessageCircle, Send, Hand, Volume2, VolumeX, Sparkles, Crown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SpeakerSeat, Speaker, SeatStatus } from "./SpeakerSeat";
import { GiftPanel } from "@/components/live/GiftPanel";
import { LiveGiftAnimation } from "@/components/live/LiveGiftAnimation";
import { FlyingGift } from "@/components/live/LiveRoomViewer";
import { useAgora } from "@/hooks/useAgora";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

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
  isSystem?: boolean;
}

export function PartyRoomViewer({ room, onClose }: PartyRoomViewerProps) {
  const { user } = useAuth();
  const isHost = user?.displayName === room.hostName || user?.username === room.hostName;
  const channelName = `party-${room.id}`;

  const [seats, setSeats] = useState<{ id: number; status: SeatStatus; speaker: Speaker | null }[]>(
    Array.from({ length: room.maxSpeakers }, (_, i) => ({
      id: i + 1,
      status: i === 0 ? "occupied" as SeatStatus : "empty" as SeatStatus,
      speaker: i === 0 ? {
        id: "host",
        name: room.hostName,
        avatar: room.hostAvatar,
        isSpeaking: true,
        isMuted: false,
        isHost: true,
        level: 5,
      } : null,
    }))
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "system-1", user: "System", avatar: "", message: "Welcome to the party room!", isSystem: true }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [flyingGifts, setFlyingGifts] = useState<FlyingGift[]>([]);
  const [hasRequestedSeat, setHasRequestedSeat] = useState(false);
  const [isOnSeat, setIsOnSeat] = useState(isHost);
  const [showLoading, setShowLoading] = useState(true);
  const giftIdRef = useRef(0);

  const {
    remoteUsers,
    isJoined,
    isPublishing,
    error: agoraError,
    isMicOn,
    toggleMic,
    leave,
    publishAudio,
    unpublishAudio,
  } = useAgora({
    channelName,
    isHost: isHost || isOnSeat,
    enabled: !showLoading,
    mode: "audio",
  });

  useEffect(() => {
    api.post(`/party-rooms/${room.id}/join`).catch(() => {});
    const timer = setTimeout(() => setShowLoading(false), 1500);
    return () => {
      clearTimeout(timer);
      api.post(`/party-rooms/${room.id}/leave`).catch(() => {});
    };
  }, [room.id]);

  useEffect(() => {
    if (remoteUsers.length === 0) return;
    setSeats(prev => {
      const updated = [...prev];
      remoteUsers.forEach((ru) => {
        const uid = ru.uid?.toString();
        const alreadySeated = updated.some(s => s.speaker?.id === uid);
        if (!alreadySeated) {
          const emptySeat = updated.find(s => s.status === "empty");
          if (emptySeat) {
            emptySeat.status = "occupied" as SeatStatus;
            emptySeat.speaker = {
              id: uid || `remote-${ru.uid}`,
              name: `User ${ru.uid}`,
              avatar: "",
              isSpeaking: ru.hasAudio ?? false,
              isMuted: !(ru.hasAudio ?? false),
              isHost: false,
            };
          }
        } else {
          const seat = updated.find(s => s.speaker?.id === uid);
          if (seat && seat.speaker) {
            seat.speaker.isSpeaking = ru.hasAudio ?? false;
            seat.speaker.isMuted = !(ru.hasAudio ?? false);
          }
        }
      });
      return updated;
    });
  }, [remoteUsers]);

  const handleClose = useCallback(async () => {
    await leave();
    if (isHost) {
      api.post(`/party-rooms/${room.id}/end`).catch(() => {});
    }
    onClose();
  }, [leave, onClose, isHost, room.id]);

  const handleSeatClick = (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    if (seat.status === "empty" && !hasRequestedSeat && !isOnSeat) {
      setSeats(prev => prev.map(s =>
        s.id === seatId ? {
          ...s,
          status: "occupied" as SeatStatus,
          speaker: {
            id: user?.id?.toString() || "me",
            name: user?.displayName || user?.username || "You",
            avatar: user?.avatarUrl || "",
            isSpeaking: false,
            isMuted: true,
            isHost: false,
          }
        } : s
      ));
      setIsOnSeat(true);
      setHasRequestedSeat(true);
      publishAudio();
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        user: "System",
        avatar: "",
        message: `${user?.displayName || user?.username || "You"} joined as a speaker`,
        isSystem: true,
      }]);
    }
  };

  const handleLeaveSeat = () => {
    setSeats(prev => prev.map(s =>
      s.speaker?.id === (user?.id?.toString() || "me") && !s.speaker?.isHost
        ? { ...s, status: "empty" as SeatStatus, speaker: null }
        : s
    ));
    setIsOnSeat(false);
    setHasRequestedSeat(false);
    unpublishAudio();
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: user?.displayName || user?.username || "You",
      avatar: user?.avatarUrl || "",
      message: inputMessage,
    }]);
    setInputMessage("");
  };

  const handleGiftSend = (gift: { name: string; icon: string; price: number }) => {
    const newGift: FlyingGift = {
      id: giftIdRef.current++,
      icon: gift.icon,
      name: gift.name,
      sender: user?.displayName || "You",
    };
    setFlyingGifts(prev => [...prev, newGift]);
    setTimeout(() => {
      setFlyingGifts(prev => prev.filter(g => g.id !== newGift.id));
    }, 3500);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: user?.displayName || user?.username || "You",
      avatar: user?.avatarUrl || "",
      message: `sent ${gift.name}`,
      isGift: true,
      giftIcon: gift.icon,
    }]);
    setShowGiftPanel(false);
  };

  if (showLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{
          background: `radial-gradient(ellipse at top, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, rgba(88, 28, 135, 0.98) 0%, rgba(30, 10, 60, 1) 100%)`
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-stream-purple to-stream-coral animate-spin-slow opacity-50 blur-md" />
            <Avatar className="h-20 w-20 ring-2 ring-white/30 relative">
              <AvatarImage src={room.hostAvatar} />
              <AvatarFallback className="bg-stream-purple text-white text-lg">{room.hostName[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">{room.name}</p>
            <p className="text-white/60 text-sm">{room.hostName}</p>
          </div>
          <Loader2 className="h-6 w-6 text-stream-purple animate-spin" />
          <span className="text-white/50 text-xs">Joining room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden animate-fade-in">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at top, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, rgba(88, 28, 135, 0.98) 0%, rgba(59, 7, 100, 0.99) 40%, rgba(30, 10, 60, 1) 100%)`
        }}
      />

      {flyingGifts.map((gift) => (
        <LiveGiftAnimation key={gift.id} gift={gift} />
      ))}

      {/* Header */}
      <header className="relative z-10 px-3 py-3">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-stream-purple via-stream-coral to-stream-purple animate-spin-slow opacity-50 blur-sm" />
              <Avatar className="h-11 w-11 ring-2 ring-white/30 relative">
                <AvatarImage src={room.hostAvatar} />
                <AvatarFallback className="bg-stream-purple text-white">{room.hostName[0]}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-purple-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white truncate">{room.name}</p>
                {isHost && <Crown className="h-3.5 w-3.5 text-stream-gold flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-white/10 text-white/80 border-0 text-[10px] h-5">
                  <Users className="mr-1 h-3 w-3" />
                  {room.viewerCount + (remoteUsers.length || 0)}
                </Badge>
                {isJoined && (
                  <span className="flex items-center gap-1 text-[10px] text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Connected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isHost && (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded-full bg-red-500/80 text-white text-[11px] font-bold press-effect"
                data-testid="button-end-party"
              >
                End
              </button>
            )}
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center press-effect border border-white/10"
              data-testid="button-close-party"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Agora Error */}
      {agoraError && (
        <div className="relative z-10 mx-4 mb-2 px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/30">
          <span className="text-red-300 text-xs">{agoraError}</span>
        </div>
      )}

      {/* Speaker Grid */}
      <div className="relative z-10 px-4 py-3">
        <div className="relative p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="grid grid-cols-4 gap-3 justify-items-center">
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

      {/* Chat */}
      <div className="flex-1 relative z-10 px-3 overflow-hidden">
        <div className="h-full flex flex-col justify-end pb-2">
          <div className="space-y-1.5 overflow-hidden max-h-[30vh]">
            {messages.slice(-8).map((msg, index) => {
              const opacity = Math.max(0.4, 0.5 + (index / 8) * 0.5);
              return (
                <div
                  key={msg.id}
                  className="animate-fade-in"
                  style={{ opacity }}
                >
                  {msg.isSystem ? (
                    <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-[11px] text-white/80">{msg.message}</span>
                    </div>
                  ) : msg.isGift ? (
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/10 rounded-lg px-3 py-1.5">
                      <span className="text-[11px] text-stream-gold font-semibold">{msg.user}</span>
                      <span className="text-[11px] text-white/70">{msg.message}</span>
                      <Gift className="h-3 w-3 text-stream-gold" />
                    </div>
                  ) : (
                    <div className="inline-flex items-start gap-1.5 max-w-[85%]">
                      <span className="text-[11px] font-semibold text-stream-cyan">{msg.user}</span>
                      <span className="text-[11px] text-white/80">{msg.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div
        className="relative z-10 px-3 pb-6 pt-3"
        style={{
          background: 'linear-gradient(to top, rgba(20, 5, 40, 0.98) 0%, rgba(20, 5, 40, 0.8) 70%, transparent 100%)'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="flex items-center h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 gap-2">
              <MessageCircle className="h-4 w-4 text-white/40" />
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Say something..."
                className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/35 focus:outline-none"
                data-testid="input-party-chat"
              />
              {inputMessage.trim() && (
                <button
                  onClick={handleSendMessage}
                  className="h-7 w-7 rounded-full bg-stream-purple flex items-center justify-center text-white"
                  data-testid="button-party-send"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowGiftPanel(true)}
            className="relative h-10 w-10 rounded-full flex items-center justify-center press-effect flex-shrink-0"
            data-testid="button-party-gift"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
            <Gift className="h-4 w-4 text-white relative z-10" />
          </button>
        </div>

        {/* Mic Controls */}
        <div className="flex justify-center gap-2 mt-3">
          {isOnSeat && (
            <button
              onClick={toggleMic}
              className={cn(
                "h-10 px-4 rounded-full flex items-center gap-2 press-effect transition-all border",
                isMicOn
                  ? "bg-stream-cyan/20 border-stream-cyan/30 text-stream-cyan"
                  : "bg-red-500/20 border-red-500/30 text-red-400"
              )}
              data-testid="button-party-mic"
            >
              {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              <span className="text-sm font-medium">{isMicOn ? "Speaking" : "Muted"}</span>
            </button>
          )}

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center press-effect border transition-all",
              isAudioMuted
                ? "bg-white/5 border-white/10 text-white/40"
                : "bg-white/10 border-white/20 text-white"
            )}
            data-testid="button-party-volume"
          >
            {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {!isOnSeat && !hasRequestedSeat && (
            <button
              className="h-10 px-4 rounded-full bg-gradient-to-r from-stream-purple/30 to-stream-coral/30 border border-stream-purple/30 text-white flex items-center gap-2 press-effect"
              onClick={() => {
                const firstEmpty = seats.find(s => s.status === "empty");
                if (firstEmpty) handleSeatClick(firstEmpty.id);
              }}
              data-testid="button-raise-hand"
            >
              <Hand className="h-4 w-4" />
              <span className="text-sm font-medium">Join as Speaker</span>
            </button>
          )}

          {isOnSeat && !isHost && (
            <button
              onClick={handleLeaveSeat}
              className="h-10 px-4 rounded-full bg-white/10 border border-white/15 text-white/70 flex items-center gap-2 press-effect text-sm"
              data-testid="button-leave-seat"
            >
              Leave Seat
            </button>
          )}
        </div>
      </div>

      {showGiftPanel && (
        <GiftPanel onClose={() => setShowGiftPanel(false)} onGiftSend={handleGiftSend} />
      )}
    </div>
  );
}
