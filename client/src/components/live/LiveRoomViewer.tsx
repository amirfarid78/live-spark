import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Gift, Send, MessageCircle, Video, VideoOff, Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GiftPanel } from "./GiftPanel";
import { LiveChatSection } from "./LiveChatSection";
import { LiveTopBar } from "./LiveTopBar";
import { LiveOpeningAnimation } from "./LiveOpeningAnimation";
import { LiveGiftAnimation } from "./LiveGiftAnimation";
import { useAgora } from "@/hooks/useAgora";

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

const topViewers: { id: string; avatar: string; isVIP: boolean; level: number }[] = [];

export function LiveRoomViewer({ streamId, hostName, hostAvatar, viewerCount, thumbnail, isHost, onClose, onEndStream }: LiveRoomViewerProps) {
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "system-1", user: "System", avatar: "", message: "Welcome to the live room!", isSystem: true }
  ]);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; color: string }[]>([]);
  const [flyingGifts, setFlyingGifts] = useState<FlyingGift[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const heartIdRef = useRef(0);
  const giftIdRef = useRef(0);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const channelName = `stream-${streamId}`;

  const {
    localVideoTrack,
    remoteUsers,
    isJoined,
    isPublishing,
    error: agoraError,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
    leave,
  } = useAgora({
    channelName,
    isHost: !!isHost,
    enabled: !showOpeningAnimation,
  });

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (!isHost && remoteUsers.length > 0 && remoteVideoRef.current) {
      const hostUser = remoteUsers[0];
      if (hostUser.videoTrack) {
        remoteVideoRef.current.innerHTML = "";
        hostUser.videoTrack.play(remoteVideoRef.current);
      }
    }
  }, [remoteUsers, isHost]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOpeningAnimation(false);
      setTimeout(() => setIsLoaded(true), 100);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(async () => {
    await leave();
    onClose();
  }, [leave, onClose]);

  const handleEndStream = useCallback(async () => {
    await leave();
    onEndStream?.(streamId);
  }, [leave, onEndStream, streamId]);

  const handleLike = () => {
    const colors = ["#FF6B6B", "#FF85A2", "#FFB6C1", "#FF69B4", "#FF1493"];
    const newHeart = {
      id: heartIdRef.current++,
      x: Math.random() * 40 - 20,
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
      avatar: "",
      message: inputMessage,
      isHost: !!isHost,
    };
    setMessages(prev => [...prev, newMessage]);
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
      giftName: gift.name,
      giftIcon: gift.icon,
    };
    setMessages(prev => [...prev, giftMessage]);
    setShowGiftPanel(false);
  };


  if (showOpeningAnimation) {
    return (
      <LiveOpeningAnimation
        hostName={hostName}
        hostAvatar={hostAvatar}
        thumbnail={thumbnail}
      />
    );
  }

  const hasRemoteVideo = !isHost && remoteUsers.length > 0 && remoteUsers[0]?.videoTrack;
  const showVideo = isHost ? (isPublishing && isCameraOn) : hasRemoteVideo;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] bg-black overflow-hidden transition-opacity duration-500",
      isLoaded ? "opacity-100" : "opacity-0"
    )}>
      {/* Video Layer */}
      <div className="absolute inset-0">
        {isHost && (
          <div
            ref={localVideoRef}
            className="h-full w-full"
            style={{ display: isPublishing && isCameraOn ? "block" : "none" }}
          />
        )}
        {!isHost && (
          <div
            ref={remoteVideoRef}
            className="h-full w-full"
            style={{ display: hasRemoteVideo ? "block" : "none" }}
          />
        )}
        {!showVideo && (
          <>
            {thumbnail ? (
              <img src={thumbnail} alt={hostName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#1a0533] via-[#12122a] to-[#0a1628]" />
            )}
          </>
        )}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Connection Status Overlay */}
      {!isJoined && !agoraError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-black/60 backdrop-blur-md rounded-2xl px-8 py-6">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
            <span className="text-white text-sm font-medium">
              {isHost ? "Starting your stream..." : "Connecting..."}
            </span>
          </div>
        </div>
      )}

      {agoraError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-black/60 backdrop-blur-md rounded-2xl px-8 py-6 max-w-xs text-center">
            <VideoOff className="h-8 w-8 text-red-400" />
            <span className="text-white text-sm font-medium">Connection Error</span>
            <span className="text-white/50 text-xs">{agoraError}</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <LiveTopBar
        hostName={hostName}
        hostAvatar={hostAvatar}
        viewerCount={viewerCount}
        topViewers={topViewers}
        isHost={isHost}
        onClose={handleClose}
        onEndStream={isHost && onEndStream ? handleEndStream : undefined}
      />

      {/* Host Live Badge + Controls - floating below top bar */}
      {isHost && isJoined && (
        <div className="absolute top-[60px] left-0 right-0 z-20 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm rounded-full pl-2.5 pr-3 py-1 border border-red-400/30">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[11px] font-bold tracking-wide uppercase">Live</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleCamera}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors",
                  isCameraOn
                    ? "bg-white/15 border-white/20 text-white"
                    : "bg-red-500/80 border-red-400/30 text-white"
                )}
                data-testid="button-toggle-camera"
              >
                {isCameraOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={toggleMic}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors",
                  isMicOn
                    ? "bg-white/15 border-white/20 text-white"
                    : "bg-red-500/80 border-red-400/30 text-white"
                )}
                data-testid="button-toggle-mic"
              >
                {isMicOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flying Gift Animations */}
      {flyingGifts.map((gift) => (
        <LiveGiftAnimation key={gift.id} gift={gift} />
      ))}

      {/* Floating Hearts */}
      <div className="absolute right-6 bottom-52 pointer-events-none z-20">
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute animate-float-heart-modern"
            style={{ left: `${heart.x}px` }}
          >
            <Heart
              className="h-6 w-6 drop-shadow-[0_0_10px_currentColor]"
              style={{ color: heart.color, fill: heart.color }}
            />
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <LiveChatSection messages={messages} />

        <div className="px-3 pb-6 pt-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex-1 relative transition-all duration-200",
            )}>
              <div className={cn(
                "relative flex items-center h-10 rounded-full transition-all duration-200",
                "bg-white/10 backdrop-blur-md border",
                isFocused
                  ? "border-white/30"
                  : "border-white/10"
              )}>
                <div className="pl-3 pr-1.5">
                  <MessageCircle className="h-4 w-4 text-white/40" />
                </div>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Say something..."
                  className="flex-1 h-full bg-transparent text-[13px] text-white placeholder:text-white/35 focus:outline-none pr-2"
                  data-testid="input-live-chat"
                />

                {inputMessage.trim() && (
                  <button
                    onClick={handleSendMessage}
                    className="h-7 w-7 rounded-full flex items-center justify-center mr-1.5 bg-stream-purple text-white"
                    data-testid="button-send-message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleLike}
              className="relative h-10 w-10 rounded-full flex items-center justify-center press-effect flex-shrink-0"
              data-testid="button-like"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-rose-600" />
              <Heart className="h-4.5 w-4.5 text-white fill-white relative z-10" />
            </button>

            <button
              onClick={() => setShowGiftPanel(true)}
              className="relative h-10 w-10 rounded-full flex items-center justify-center press-effect flex-shrink-0"
              data-testid="button-gift"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
              <Gift className="h-4.5 w-4.5 text-white relative z-10" />
            </button>
          </div>
        </div>
      </div>

      {showGiftPanel && (
        <GiftPanel onClose={() => setShowGiftPanel(false)} onGiftSend={handleGiftSend} />
      )}
    </div>
  );
}
