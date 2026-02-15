import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Send, MessageCircle, Gem, Crown, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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
  const totalDuration = 240;
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [scores, setScores] = useState({ p1: battle.player1.score, p2: battle.player2.score });
  const [previousScores, setPreviousScores] = useState({ p1: battle.player1.score, p2: battle.player2.score });
  const [selectedPlayer, setSelectedPlayer] = useState<"p1" | "p2">("p1");
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<"win" | "lose" | "tie" | null>(null);
  const [flyingGifts, setFlyingGifts] = useState<FlyingGift[]>([]);
  const [showVSAnimation, setShowVSAnimation] = useState(true);
  const giftIdRef = useRef(0);

  const totalScore = scores.p1 + scores.p2;
  const leader = scores.p1 > scores.p2 ? "p1" : scores.p2 > scores.p1 ? "p2" : null;

  // Opening VS animation
  useEffect(() => {
    const timer = setTimeout(() => setShowVSAnimation(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
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
      setPreviousScores(scores);
      const random1 = Math.floor(Math.random() * 100);
      const random2 = Math.floor(Math.random() * 100);
      setScores((prev) => ({
        p1: prev.p1 + random1,
        p2: prev.p2 + random2,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [scores]);

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
    // Add flying 3D gift animation
    const newGift: FlyingGift = {
      id: giftIdRef.current++,
      icon: gift.icon,
      name: gift.name,
      sender: "You",
      value: gift.price,
      targetPlayer: selectedPlayer,
    };
    setFlyingGifts(prev => [...prev, newGift]);

    const giftMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "",
      message: `sent ${gift.name} to ${selectedPlayer === "p1" ? battle.player1.name : battle.player2.name}`,
      giftName: gift.name,
      giftIcon: gift.icon,
    };
    setMessages(prev => [...prev, giftMessage]);

    setPreviousScores(scores);
    setScores(prev => ({
      ...prev,
      [selectedPlayer]: prev[selectedPlayer] + gift.price * 10,
    }));

    setShowGiftPanel(false);
  };

  const removeGift = (giftId: number) => {
    setFlyingGifts(prev => prev.filter(g => g.id !== giftId));
  };

  // Opening animation
  if (showVSAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Background particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 50,
              opacity: 0 
            }}
            animate={{ 
              y: -50,
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
            className="absolute"
          >
            <Sparkles className="h-4 w-4 text-stream-gold" />
          </motion.div>
        ))}

        {/* Players */}
        <div className="flex items-center gap-8">
          {/* Player 1 */}
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center"
          >
            <Avatar className="h-24 w-24 ring-4 ring-stream-purple shadow-2xl shadow-stream-purple/50">
              <AvatarImage src={battle.player1.avatar} />
              <AvatarFallback>{battle.player1.name[0]}</AvatarFallback>
            </Avatar>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white font-bold mt-3"
            >
              {battle.player1.name.slice(0, 12)}
            </motion.p>
          </motion.div>

          {/* VS */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <VSAnimation intensity="high" />
          </motion.div>

          {/* Player 2 */}
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center"
          >
            <Avatar className="h-24 w-24 ring-4 ring-stream-coral shadow-2xl shadow-stream-coral/50">
              <AvatarImage src={battle.player2.avatar} />
              <AvatarFallback>{battle.player2.name[0]}</AvatarFallback>
            </Avatar>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white font-bold mt-3"
            >
              {battle.player2.name.slice(0, 12)}
            </motion.p>
          </motion.div>
        </div>

        {/* Battle Start Text */}
        <motion.div
          initial={{ scale: 0, y: 100 }}
          animate={{ scale: 1, y: 80 }}
          transition={{ delay: 1, type: "spring" }}
          className="absolute"
        >
          <div className="px-8 py-3 rounded-full bg-gradient-to-r from-stream-purple via-stream-gold to-stream-coral">
            <span className="text-2xl font-black text-white">BATTLE START!</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black overflow-hidden"
    >
      {/* 3D Gift Animations */}
      <AnimatePresence>
        {flyingGifts.map((gift) => (
          <Gift3DAnimation
            key={gift.id}
            gift={gift}
            targetPlayer={gift.targetPlayer}
            onComplete={() => removeGift(gift.id)}
          />
        ))}
      </AnimatePresence>

      {/* Top Bar */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/80 to-transparent"
      >
        <div className="flex items-center justify-between">
          {/* Host Info */}
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Avatar className="h-10 w-10 ring-2 ring-stream-purple">
                <AvatarImage src={battle.player1.avatar} />
                <AvatarFallback>{battle.player1.name[0]}</AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white font-medium text-sm">{battle.player1.name.split(/[✨🔥@]/)[0]}</span>
                <Badge className="bg-stream-gold text-black text-[9px] px-1.5 border-0">
                  ⚔️ 1320
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Gem className="h-3 w-3 text-stream-gold" />
                </motion.div>
                <span className="text-stream-gold text-xs font-bold">29.30k</span>
              </div>
            </div>
          </div>

          {/* Top Viewers */}
          <div className="flex items-center gap-1">
            {mockTopGiftersP1.slice(0, 4).map((gifter, i) => (
              <motion.div
                key={gifter.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Avatar className={cn(
                  "h-8 w-8 -ml-2 first:ml-0 ring-2 ring-black",
                  gifter.isVIP && "ring-stream-gold"
                )}>
                  <AvatarImage src={gifter.avatar} />
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
            <Badge className="ml-1 bg-black/50 text-white border-0 text-[10px]">
              +{battle.viewerCount}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-xs">ID: 51179820</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center"
            >
              <X className="h-5 w-5 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Countdown Timer */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
        <CountdownTimer timeLeft={timeLeft} totalTime={totalDuration} />
      </div>

      {/* Split Screen Video */}
      <div className="flex h-[45vh] mt-14">
        {/* Player 1 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex-1 relative overflow-hidden cursor-pointer transition-all",
            selectedPlayer === "p1" && "ring-4 ring-stream-purple ring-inset"
          )}
          onClick={() => setSelectedPlayer("p1")}
        >
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop"
            alt={battle.player1.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Leader Crown */}
          <div className="absolute top-3 left-3">
            <LeaderCrown isLeader={leader === "p1"} />
          </div>

          {/* Selection indicator */}
          <AnimatePresence>
            {selectedPlayer === "p1" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-3 left-3"
              >
                <Badge className="bg-stream-purple text-white border-0">
                  <Gift className="h-3 w-3 mr-1" />
                  Gifting
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Center VS */}
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 z-10">
          <VSAnimation intensity={timeLeft <= 30 ? "high" : "medium"} />
        </div>

        {/* Player 2 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex-1 relative overflow-hidden cursor-pointer transition-all",
            selectedPlayer === "p2" && "ring-4 ring-stream-coral ring-inset"
          )}
          onClick={() => setSelectedPlayer("p2")}
        >
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop"
            alt={battle.player2.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Leader Crown */}
          <div className="absolute top-3 right-3">
            <LeaderCrown isLeader={leader === "p2"} />
          </div>

          {/* Selection indicator */}
          <AnimatePresence>
            {selectedPlayer === "p2" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-3 right-3"
              >
                <Badge className="bg-stream-coral text-white border-0">
                  <Gift className="h-3 w-3 mr-1" />
                  Gifting
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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

      {/* Top Gifters Row */}
      <div className="flex justify-between px-2 py-2 bg-gradient-to-r from-stream-purple/40 to-stream-coral/40">
        <div className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4 text-white/50" />
          {mockTopGiftersP1.map((gifter, i) => (
            <motion.div
              key={gifter.id}
              whileHover={{ scale: 1.2, y: -5 }}
              className="relative"
            >
              <Avatar className="h-9 w-9 ring-2 ring-white/30">
                <AvatarImage src={gifter.avatar} />
                <AvatarFallback>G</AvatarFallback>
              </Avatar>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-stream-gold text-black text-[8px] font-bold px-1.5 rounded"
              >
                {i + 1}
              </motion.span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {mockTopGiftersP2.map((gifter, i) => (
            <motion.div
              key={gifter.id}
              whileHover={{ scale: 1.2, y: -5 }}
              className="relative"
            >
              <Avatar className="h-9 w-9 ring-2 ring-white/30">
                <AvatarImage src={gifter.avatar} />
                <AvatarFallback>G</AvatarFallback>
              </Avatar>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-stream-gold text-black text-[8px] font-bold px-1.5 rounded"
              >
                {i + 1}
              </motion.span>
            </motion.div>
          ))}
          <ChevronRight className="h-4 w-4 text-white/50" />
        </div>
      </div>

      {/* Chat Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a0a2e] via-[#1a0a2e] to-transparent">
        <div className="px-4 py-2">
          <p className="text-stream-cyan text-[11px] leading-relaxed">
            Room name : Welcome to join the live. Any content related to porn, violence, gambling, illegal dealing will be banned.
          </p>
        </div>

        <div className="px-4 pb-2">
          <Badge className="bg-stream-purple/30 text-stream-cyan border-stream-purple/50 text-[10px]">
            Announcement : Welcome to room
          </Badge>
        </div>

        <div className="px-4 pb-2 max-h-28 overflow-y-auto">
          <AnimatePresence>
            {messages.slice(-6).map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 mb-1.5"
              >
                <span className={cn(
                  "text-xs font-medium",
                  msg.isVIP ? "text-stream-gold" : "text-stream-cyan"
                )}>
                  {msg.user}
                </span>
                {msg.giftIcon ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs text-white bg-stream-purple/30 px-2 py-0.5 rounded-full"
                  >
                    {msg.giftIcon} {msg.message}
                  </motion.span>
                ) : msg.isVIP && msg.message.includes("Friend Request") ? (
                  <Badge className="bg-stream-gold/20 text-stream-gold border-stream-gold/30 text-[10px]">
                    {msg.message}
                  </Badge>
                ) : (
                  <span className="text-xs text-white/80">{msg.message}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
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
              className="w-full h-11 rounded-full bg-white/10 border border-white/20 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-stream-purple transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="h-11 w-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
          >
            <span className="text-lg">🤟</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowGiftPanel(true)}
            className="relative h-11 w-11 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30"
          >
            <Gift className="h-5 w-5 text-white" />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-stream-gold flex items-center justify-center"
            >
              <Sparkles className="h-2.5 w-2.5 text-black" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Gift Panel */}
      <AnimatePresence>
        {showGiftPanel && (
          <GiftPanel onClose={() => setShowGiftPanel(false)} onGiftSend={handleGiftSend} />
        )}
      </AnimatePresence>

      {/* Battle Result Modal */}
      <AnimatePresence>
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
              setTimeLeft(totalDuration);
              setScores({ p1: 0, p2: 0 });
              setPreviousScores({ p1: 0, p2: 0 });
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
