import { useState, useEffect, useRef, useCallback } from "react";
import { X, Gift, Send, MessageCircle, Sparkles, Video, VideoOff, Mic, MicOff, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GiftPanel } from "@/components/live/GiftPanel";
import { PKBattle } from "./PKBattleCard";
import { PKBattleResultModal } from "./PKBattleResultModal";
import { Gift3DAnimation } from "./Gift3DAnimation";
import { VSAnimation, LeaderCrown } from "./VSAnimation";
import { CountdownTimer } from "./CountdownTimer";
import { ScoreProgressBar } from "./ScoreProgressBar";
import { useAgora } from "@/hooks/useAgora";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  isVIP?: boolean;
  giftName?: string;
  giftIcon?: string;
}

interface FlyingGift {
  id: number;
  icon: string;
  name: string;
  sender: string;
  value: number;
  targetPlayer: "p1" | "p2";
}

interface PKBattleLiveRoomProps {
  battle: PKBattle;
  onClose: () => void;
}

export function PKBattleLiveRoom({ battle, onClose }: PKBattleLiveRoomProps) {
  const { user } = useAuth();
  const totalDuration = 240;
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "system-1", user: "System", avatar: "", message: "PK Battle has started!" }
  ]);
  const [scores, setScores] = useState({ p1: battle.player1.score, p2: battle.player2.score });
  const [previousScores, setPreviousScores] = useState({ p1: battle.player1.score, p2: battle.player2.score });
  const [selectedPlayer, setSelectedPlayer] = useState<"p1" | "p2">("p1");
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<"win" | "lose" | "tie" | null>(null);
  const [flyingGifts, setFlyingGifts] = useState<FlyingGift[]>([]);
  const [showVSAnimation, setShowVSAnimation] = useState(true);
  const giftIdRef = useRef(0);
  const p1VideoRef = useRef<HTMLDivElement>(null);
  const p2VideoRef = useRef<HTMLDivElement>(null);

  const isPlayer1 = user?.id?.toString() === battle.player1.id;
  const isPlayer2 = user?.id?.toString() === battle.player2.id;
  const isParticipant = isPlayer1 || isPlayer2;
  const channelName = `pk-battle-${battle.id}`;

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
    isHost: isParticipant,
    enabled: !showVSAnimation,
    mode: "pk",
  });

  useEffect(() => {
    if (isParticipant && localVideoTrack) {
      const targetRef = isPlayer1 ? p1VideoRef : p2VideoRef;
      if (targetRef.current) {
        targetRef.current.innerHTML = "";
        localVideoTrack.play(targetRef.current);
      }
    }
  }, [localVideoTrack, isParticipant, isPlayer1]);

  useEffect(() => {
    if (remoteUsers.length === 0) return;

    if (isParticipant) {
      const remoteUser = remoteUsers[0];
      if (remoteUser?.videoTrack) {
        const targetRef = isPlayer1 ? p2VideoRef : p1VideoRef;
        if (targetRef.current) {
          targetRef.current.innerHTML = "";
          remoteUser.videoTrack.play(targetRef.current);
        }
      }
    } else {
      remoteUsers.forEach((remoteUser, index) => {
        if (remoteUser.videoTrack) {
          const targetRef = index === 0 ? p1VideoRef : p2VideoRef;
          if (targetRef.current) {
            targetRef.current.innerHTML = "";
            remoteUser.videoTrack.play(targetRef.current);
          }
        }
      });
    }
  }, [remoteUsers, isPlayer1, isParticipant]);
  const leader = scores.p1 > scores.p2 ? "p1" : scores.p2 > scores.p1 ? "p2" : null;

  useEffect(() => {
    const timer = setTimeout(() => setShowVSAnimation(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (scores.p1 > scores.p2) setBattleResult("win");
      else if (scores.p2 > scores.p1) setBattleResult("lose");
      else setBattleResult("tie");
      setShowResult(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, scores]);

  const handleClose = useCallback(async () => {
    await leave();
    onClose();
  }, [leave, onClose]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: "You",
      avatar: "",
      message: inputMessage,
    }]);
    setInputMessage("");
  };

  const handleGiftSend = (gift: { name: string; icon: string; price: number }) => {
    const newGift: FlyingGift = {
      id: giftIdRef.current++,
      icon: gift.icon,
      name: gift.name,
      sender: "You",
      value: gift.price,
      targetPlayer: selectedPlayer,
    };
    setFlyingGifts(prev => [...prev, newGift]);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: "You",
      avatar: "",
      message: `sent ${gift.name} to ${selectedPlayer === "p1" ? battle.player1.name : battle.player2.name}`,
      giftName: gift.name,
      giftIcon: gift.icon,
    }]);

    setPreviousScores(scores);
    setScores(prev => ({
      ...prev,
      [selectedPlayer]: prev[selectedPlayer] + gift.price * 10,
    }));

    api.post(`/pk-battles/${battle.id}/score`, {
      player: selectedPlayer === "p1" ? "host" : "opponent",
      points: gift.price * 10,
    }).catch(() => {});

    setShowGiftPanel(false);
  };

  const removeGift = (giftId: number) => {
    setFlyingGifts(prev => prev.filter(g => g.id !== giftId));
  };

  if (showVSAnimation) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden animate-fade-in">
        <div className="flex items-center gap-8">
          <div className="text-center animate-fade-in-left">
            <Avatar className="h-24 w-24 ring-4 ring-stream-purple shadow-2xl shadow-stream-purple/50">
              <AvatarImage src={battle.player1.avatar} />
              <AvatarFallback className="text-white bg-stream-purple">{battle.player1.name[0]}</AvatarFallback>
            </Avatar>
            <p className="text-white font-bold mt-3">{battle.player1.name.slice(0, 12)}</p>
          </div>
          <VSAnimation intensity="high" />
          <div className="text-center animate-fade-in-right">
            <Avatar className="h-24 w-24 ring-4 ring-stream-coral shadow-2xl shadow-stream-coral/50">
              <AvatarImage src={battle.player2.avatar} />
              <AvatarFallback className="text-white bg-stream-coral">{battle.player2.name[0]}</AvatarFallback>
            </Avatar>
            <p className="text-white font-bold mt-3">{battle.player2.name.slice(0, 12)}</p>
          </div>
        </div>
        <div className="absolute bottom-1/4">
          <div className="px-8 py-3 rounded-full bg-gradient-to-r from-stream-purple via-stream-gold to-stream-coral animate-fade-in-up">
            <span className="text-2xl font-black text-white">BATTLE START!</span>
          </div>
        </div>
      </div>
    );
  }

  const hasP1Video = isPlayer1
    ? (isPublishing && isCameraOn)
    : isParticipant
      ? remoteUsers.some(u => u.videoTrack)
      : (remoteUsers[0]?.videoTrack != null);
  const hasP2Video = isPlayer2
    ? (isPublishing && isCameraOn)
    : isParticipant
      ? remoteUsers.some(u => u.videoTrack)
      : (remoteUsers[1]?.videoTrack != null);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden animate-fade-in">
      {flyingGifts.map((gift) => (
        <Gift3DAnimation
          key={gift.id}
          gift={gift}
          targetPlayer={gift.targetPlayer}
          onComplete={() => removeGift(gift.id)}
        />
      ))}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 ring-2 ring-stream-purple">
              <AvatarImage src={battle.player1.avatar} />
              <AvatarFallback className="text-xs text-white bg-stream-purple">{battle.player1.name[0]}</AvatarFallback>
            </Avatar>
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-[11px] font-semibold text-white truncate max-w-[60px] block">{battle.player1.name.split(/[✨🔥@]/)[0]}</span>
            </div>
          </div>

          <CountdownTimer timeLeft={timeLeft} totalTime={totalDuration} />

          <div className="flex items-center gap-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-[11px] font-semibold text-white truncate max-w-[60px] block">{battle.player2.name.split(/[✨🔥@]/)[0]}</span>
            </div>
            <Avatar className="h-8 w-8 ring-2 ring-stream-coral">
              <AvatarImage src={battle.player2.avatar} />
              <AvatarFallback className="text-xs text-white bg-stream-coral">{battle.player2.name[0]}</AvatarFallback>
            </Avatar>
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center press-effect border border-white/10"
              data-testid="button-close-pk"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isJoined && !agoraError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-black/60 backdrop-blur-md rounded-2xl px-8 py-6">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
            <span className="text-white text-sm font-medium">Connecting to battle...</span>
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

      {/* Split Screen Video Area */}
      <div className="flex h-[45vh] mt-14">
        {/* Player 1 Video */}
        <div
          className={cn(
            "flex-1 relative overflow-hidden cursor-pointer transition-all",
            selectedPlayer === "p1" && "ring-4 ring-stream-purple ring-inset"
          )}
          onClick={() => setSelectedPlayer("p1")}
        >
          <div
            ref={p1VideoRef}
            className="h-full w-full"
            style={{ display: hasP1Video ? "block" : "none" }}
          />
          {!hasP1Video && (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-stream-purple/30 to-black">
              <Avatar className="h-20 w-20 ring-2 ring-stream-purple/50 mb-2">
                <AvatarImage src={battle.player1.avatar} />
                <AvatarFallback className="text-white bg-stream-purple">{battle.player1.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-white/60 text-xs">Waiting for video...</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3">
            <LeaderCrown isLeader={leader === "p1"} />
          </div>

          {selectedPlayer === "p1" && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-stream-purple text-white border-0">
                <Gift className="h-3 w-3 mr-1" />
                Gifting
              </Badge>
            </div>
          )}
        </div>

        {/* Center VS */}
        <div className="absolute left-1/2 top-[22%] -translate-x-1/2 z-10">
          <VSAnimation intensity={timeLeft <= 30 ? "high" : "medium"} />
        </div>

        {/* Player 2 Video */}
        <div
          className={cn(
            "flex-1 relative overflow-hidden cursor-pointer transition-all",
            selectedPlayer === "p2" && "ring-4 ring-stream-coral ring-inset"
          )}
          onClick={() => setSelectedPlayer("p2")}
        >
          <div
            ref={p2VideoRef}
            className="h-full w-full"
            style={{ display: hasP2Video ? "block" : "none" }}
          />
          {!hasP2Video && (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-stream-coral/30 to-black">
              <Avatar className="h-20 w-20 ring-2 ring-stream-coral/50 mb-2">
                <AvatarImage src={battle.player2.avatar} />
                <AvatarFallback className="text-white bg-stream-coral">{battle.player2.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-white/60 text-xs">Waiting for video...</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-3 right-3">
            <LeaderCrown isLeader={leader === "p2"} />
          </div>

          {selectedPlayer === "p2" && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-stream-coral text-white border-0">
                <Gift className="h-3 w-3 mr-1" />
                Gifting
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Score Progress Bar */}
      <ScoreProgressBar
        p1Score={scores.p1}
        p2Score={scores.p2}
        p1WinStreak={battle.player1.winStreak}
        p2WinStreak={battle.player2.winStreak}
        previousP1Score={previousScores.p1}
        previousP2Score={previousScores.p2}
      />

      {/* Host Controls */}
      {isParticipant && isJoined && (
        <div className="flex justify-center gap-2 py-2 bg-black/40">
          <button
            onClick={toggleCamera}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors",
              isCameraOn ? "bg-white/15 border-white/20 text-white" : "bg-red-500/80 border-red-400/30 text-white"
            )}
            data-testid="button-pk-toggle-camera"
          >
            {isCameraOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={toggleMic}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors",
              isMicOn ? "bg-white/15 border-white/20 text-white" : "bg-red-500/80 border-red-400/30 text-white"
            )}
            data-testid="button-pk-toggle-mic"
          >
            {isMicOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={async () => {
              await leave();
              try {
                const winnerId = scores.p1 >= scores.p2 ? battle.player1.id : battle.player2.id;
                await api.post(`/pk-battles/${battle.id}/end`, { winnerId: parseInt(winnerId) });
              } catch {}
              onClose();
            }}
            className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-[11px] font-bold press-effect border border-red-400/30"
            data-testid="button-end-pk"
          >
            End Battle
          </button>
        </div>
      )}

      {/* Chat + Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="px-3 pb-2 max-h-28 overflow-hidden">
          {messages.slice(-6).map((msg, i) => {
            const opacity = Math.max(0.4, 0.5 + (i / 6) * 0.5);
            return (
              <div
                key={msg.id}
                className="flex items-start gap-1.5 mb-1 animate-fade-in"
                style={{ opacity }}
              >
                <span className={cn("text-[11px] font-semibold", msg.isVIP ? "text-stream-gold" : "text-stream-cyan")}>
                  {msg.user}
                </span>
                {msg.giftIcon ? (
                  <span className="text-[11px] text-white/90 flex items-center gap-1">
                    {msg.message}
                    <Gift className="h-3 w-3 text-stream-gold" />
                  </span>
                ) : (
                  <span className="text-[11px] text-white/80">{msg.message}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3 pb-6 pt-2">
          <div className="flex-1 relative">
            <div className="flex items-center h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-3 gap-2">
              <MessageCircle className="h-4 w-4 text-white/40" />
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Say something..."
                className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/35 focus:outline-none"
                data-testid="input-pk-chat"
              />
              {inputMessage.trim() && (
                <button
                  onClick={handleSendMessage}
                  className="h-7 w-7 rounded-full flex items-center justify-center bg-stream-purple text-white"
                  data-testid="button-pk-send"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowGiftPanel(true)}
            className="relative h-10 w-10 rounded-full flex items-center justify-center press-effect flex-shrink-0"
            data-testid="button-pk-gift"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
            <Gift className="h-4 w-4 text-white relative z-10" />
          </button>
        </div>
      </div>

      {showGiftPanel && (
        <GiftPanel onClose={() => setShowGiftPanel(false)} onGiftSend={handleGiftSend} />
      )}

      {showResult && battleResult && (
        <PKBattleResultModal
          result={battleResult}
          winner={leader === "p1" ? battle.player1 : battle.player2}
          loser={leader === "p1" ? battle.player2 : battle.player1}
          winnerScore={leader === "p1" ? scores.p1 : scores.p2}
          loserScore={leader === "p1" ? scores.p2 : scores.p1}
          onClose={handleClose}
          onBattleAgain={() => {
            setShowResult(false);
            setTimeLeft(totalDuration);
            setScores({ p1: 0, p2: 0 });
            setPreviousScores({ p1: 0, p2: 0 });
          }}
        />
      )}
    </div>
  );
}
