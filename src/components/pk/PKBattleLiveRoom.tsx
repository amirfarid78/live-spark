import React, { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX, Gift, Send, MessageCircle, Timer, Gem, Crown, Users, Heart, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GiftPanel } from "@/components/live/GiftPanel";
import { PKBattle } from "./PKBattleCard";
import { PKBattleResultModal } from "./PKBattleResultModal";

interface TopGifter {
  id: string;
  avatar: string;
  rank: number;
  isVIP?: boolean;
}

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  isVIP?: boolean;
  giftName?: string;
  giftIcon?: string;
}

interface PKBattleLiveRoomProps {
  battle: PKBattle;
  onClose: () => void;
}

const mockTopGiftersP1: TopGifter[] = [
  { id: "1", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50", rank: 1, isVIP: true },
  { id: "2", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50", rank: 2, isVIP: true },
  { id: "3", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50", rank: 3 },
];

const mockTopGiftersP2: TopGifter[] = [
  { id: "4", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50", rank: 1, isVIP: true },
  { id: "5", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50", rank: 2 },
  { id: "6", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=50", rank: 3 },
];

const mockMessages: ChatMessage[] = [
  { id: "1", user: "John Daveldeo", avatar: "", message: "Very Nice Cloths" },
  { id: "2", user: "John Daveldeo", avatar: "", message: "Sent Friend Request", isVIP: true },
  { id: "3", user: "Jamie Davidson", avatar: "", message: "Very Nice Cloths" },
  { id: "4", user: "John Davidson", avatar: "", message: "Very Nice Cloths" },
];

export function PKBattleLiveRoom({ battle, onClose }: PKBattleLiveRoomProps) {
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const [isMuted, setIsMuted] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [scores, setScores] = useState({ p1: battle.player1.score, p2: battle.player2.score });
  const [selectedPlayer, setSelectedPlayer] = useState<"p1" | "p2">("p1");
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<"win" | "lose" | "tie" | null>(null);

  const totalScore = scores.p1 + scores.p2;
  const p1Percentage = totalScore > 0 ? (scores.p1 / totalScore) * 100 : 50;
  const leader = scores.p1 > scores.p2 ? "p1" : scores.p2 > scores.p1 ? "p2" : null;

  useEffect(() => {
    if (timeLeft <= 0) {
      // Battle ended
      if (scores.p1 > scores.p2) {
        setBattleResult("win");
      } else if (scores.p2 > scores.p1) {
        setBattleResult("lose");
      } else {
        setBattleResult("tie");
      }
      setShowResult(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, scores]);

  // Simulate score updates
  useEffect(() => {
    const interval = setInterval(() => {
      const random1 = Math.floor(Math.random() * 100);
      const random2 = Math.floor(Math.random() * 100);
      setScores((prev) => ({
        p1: prev.p1 + random1,
        p2: prev.p2 + random2,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "",
      message: inputMessage,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
  };

  const handleGiftSend = (gift: { name: string; icon: string; price: number }) => {
    const giftMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "",
      message: `sent ${gift.name} to ${selectedPlayer === "p1" ? battle.player1.name : battle.player2.name}`,
      giftName: gift.name,
      giftIcon: gift.icon,
    };
    setMessages(prev => [...prev, giftMessage]);
    
    // Add to selected player's score
    setScores(prev => ({
      ...prev,
      [selectedPlayer]: prev[selectedPlayer] + gift.price * 10,
    }));
    
    setShowGiftPanel(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          {/* Host Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 ring-2 ring-stream-purple">
              <AvatarImage src={battle.player1.avatar} />
              <AvatarFallback>{battle.player1.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white font-medium text-sm">{battle.player1.name.split(/[✨🔥@]/)[0]}</span>
                <Badge className="bg-stream-gold text-black text-[9px] px-1.5 border-0">
                  ⚔️ 1320
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Gem className="h-3 w-3 text-stream-gold" />
                <span className="text-stream-gold text-xs font-bold">29.30k</span>
              </div>
            </div>
          </div>

          {/* Top Viewers */}
          <div className="flex items-center gap-1">
            {mockTopGiftersP1.slice(0, 4).map((gifter, i) => (
              <Avatar key={gifter.id} className={cn(
                "h-8 w-8 -ml-2 first:ml-0 ring-2 ring-black",
                gifter.isVIP && "ring-stream-gold"
              )}>
                <AvatarImage src={gifter.avatar} />
                <AvatarFallback>G</AvatarFallback>
              </Avatar>
            ))}
            <Badge className="ml-1 bg-black/50 text-white border-0 text-[10px]">
              +{battle.viewerCount}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-xs">ID: 51179820</span>
            <button 
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
        <Badge className={cn(
          "px-4 py-1.5 rounded-full text-sm font-bold",
          timeLeft <= 30 
            ? "bg-stream-live text-white animate-pulse" 
            : "bg-black/60 text-white backdrop-blur-sm"
        )}>
          Cutdown : {formatTime(timeLeft)}
        </Badge>
      </div>

      {/* Split Screen Video */}
      <div className="flex h-[45vh] mt-14">
        {/* Player 1 */}
        <div 
          className={cn(
            "flex-1 relative overflow-hidden cursor-pointer transition-all",
            selectedPlayer === "p1" && "ring-2 ring-stream-purple ring-inset"
          )}
          onClick={() => setSelectedPlayer("p1")}
        >
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop"
            alt={battle.player1.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Player 1 Badge */}
          {leader === "p1" && (
            <div className="absolute top-2 left-2">
              <Crown className="h-6 w-6 text-stream-gold animate-bounce" />
            </div>
          )}
        </div>

        {/* Player 2 */}
        <div 
          className={cn(
            "flex-1 relative overflow-hidden cursor-pointer transition-all",
            selectedPlayer === "p2" && "ring-2 ring-stream-coral ring-inset"
          )}
          onClick={() => setSelectedPlayer("p2")}
        >
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop"
            alt={battle.player2.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Player 2 Badge */}
          {leader === "p2" && (
            <div className="absolute top-2 right-2">
              <Crown className="h-6 w-6 text-stream-gold animate-bounce" />
            </div>
          )}
        </div>
      </div>

      {/* Score Bar */}
      <div className="relative px-0">
        {/* Win Streak Labels */}
        <div className="flex justify-between px-3 py-1 bg-gradient-to-r from-stream-purple/80 via-purple-900/80 to-stream-coral/80">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-[10px]">Win x{battle.player1.winStreak}</span>
            <div className="flex items-center gap-1">
              <Gem className="h-3 w-3 text-stream-gold" />
              <span className="text-white font-bold text-sm">{formatScore(scores.p1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-sm">{formatScore(scores.p2)}</span>
              <Gem className="h-3 w-3 text-stream-gold" />
            </div>
            <span className="text-white/80 text-[10px]">Win x{battle.player2.winStreak}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gradient-to-r from-stream-purple/30 to-stream-coral/30">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-stream-purple to-stream-purple-light transition-all duration-500"
            style={{ width: `${p1Percentage}%` }}
          />
          <div 
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-stream-coral to-stream-coral-light transition-all duration-500"
            style={{ width: `${100 - p1Percentage}%` }}
          />
        </div>

        {/* Top Gifters Row */}
        <div className="flex justify-between px-2 py-2 bg-gradient-to-r from-stream-purple/60 to-stream-coral/60">
          {/* P1 Gifters */}
          <div className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4 text-white/50" />
            {mockTopGiftersP1.map((gifter, i) => (
              <div key={gifter.id} className="relative">
                <Avatar className="h-8 w-8 ring-2 ring-white/30">
                  <AvatarImage src={gifter.avatar} />
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-stream-gold text-black text-[8px] font-bold px-1 rounded">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>

          {/* P2 Gifters */}
          <div className="flex items-center gap-1">
            {mockTopGiftersP2.map((gifter, i) => (
              <div key={gifter.id} className="relative">
                <Avatar className="h-8 w-8 ring-2 ring-white/30">
                  <AvatarImage src={gifter.avatar} />
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-stream-gold text-black text-[8px] font-bold px-1 rounded">
                  {i + 1}
                </span>
              </div>
            ))}
            <ChevronRight className="h-4 w-4 text-white/50" />
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a0a2e] via-[#1a0a2e] to-transparent">
        {/* Room Rules */}
        <div className="px-4 py-2">
          <p className="text-stream-cyan text-[11px] leading-relaxed">
            Room name : Welcome to join the live. Any content related to porn, violence, gambling, illegal dealing will be banned.
          </p>
        </div>

        {/* Announcement */}
        <div className="px-4 pb-2">
          <Badge className="bg-stream-purple/30 text-stream-cyan border-stream-purple/50 text-[10px]">
            Announcement : Welcome to room
          </Badge>
        </div>

        {/* Messages */}
        <div className="px-4 pb-2 max-h-32 overflow-y-auto">
          {messages.slice(-6).map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 mb-1.5">
              <span className={cn(
                "text-xs font-medium",
                msg.isVIP ? "text-stream-gold" : "text-stream-cyan"
              )}>
                {msg.user}
              </span>
              {msg.giftIcon ? (
                <span className="text-xs text-white bg-stream-purple/30 px-2 py-0.5 rounded-full">
                  {msg.giftIcon} {msg.message}
                </span>
              ) : msg.isVIP && msg.message.includes("Friend Request") ? (
                <Badge className="bg-stream-gold/20 text-stream-gold border-stream-gold/30 text-[10px]">
                  {msg.message}
                </Badge>
              ) : (
                <span className="text-xs text-white/80">{msg.message}</span>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 pb-6 pt-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type Something..."
              className="w-full h-11 rounded-full bg-white/10 border border-white/20 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-stream-purple"
            />
          </div>

          {/* Emoji/Sticker Button */}
          <button className="h-11 w-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-lg">🤟</span>
          </button>

          {/* Gift Button */}
          <button 
            onClick={() => setShowGiftPanel(true)}
            className="relative h-11 w-11 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg"
          >
            <Gift className="h-5 w-5 text-white" />
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-stream-gold flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-black" />
            </div>
          </button>
        </div>
      </div>

      {/* Gift Panel */}
      {showGiftPanel && (
        <GiftPanel onClose={() => setShowGiftPanel(false)} onGiftSend={handleGiftSend} />
      )}

      {/* Battle Result Modal */}
      {showResult && battleResult && (
        <PKBattleResultModal
          result={battleResult}
          winner={leader === "p1" ? battle.player1 : battle.player2}
          loser={leader === "p1" ? battle.player2 : battle.player1}
          winnerScore={leader === "p1" ? scores.p1 : scores.p2}
          loserScore={leader === "p1" ? scores.p2 : scores.p1}
          onClose={onClose}
          onBattleAgain={() => {
            setShowResult(false);
            setTimeLeft(240);
            setScores({ p1: 0, p2: 0 });
          }}
        />
      )}
    </div>
  );
}
