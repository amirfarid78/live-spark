import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Frown, Sparkles, PartyPopper, Star, Flame, Zap, Heart } from "lucide-react";

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  winStreak: number;
}

interface PKBattleResultModalProps {
  result: "win" | "lose" | "tie";
  winner: Player;
  loser: Player;
  winnerScore: number;
  loserScore: number;
  onClose: () => void;
  onBattleAgain: () => void;
}

export function PKBattleResultModal({
  result,
  winner,
  loser,
  winnerScore,
  loserScore,
  onClose,
  onBattleAgain,
}: PKBattleResultModalProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; delay: number; type: string }[]>([]);

  useEffect(() => {
    if (result === "win") {
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        type: ["star", "sparkle", "heart", "flame"][Math.floor(Math.random() * 4)],
      }));
      setConfetti(particles);
    }
  }, [result]);

  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  const renderParticle = (type: string) => {
    switch (type) {
      case "star":
        return <Star className="h-4 w-4 text-stream-gold fill-stream-gold" />;
      case "sparkle":
        return <Sparkles className="h-4 w-4 text-yellow-300" />;
      case "heart":
        return <Heart className="h-4 w-4 text-stream-coral fill-stream-coral" />;
      case "flame":
        return <Flame className="h-4 w-4 text-orange-500" />;
      default:
        return <Star className="h-4 w-4 text-stream-gold" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md"
    >
      {/* Confetti for win */}
      <AnimatePresence>
        {result === "win" && confetti.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ y: -50, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
            animate={{ 
              y: "110vh", 
              rotate: 360,
              opacity: [1, 1, 0],
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              delay: particle.delay,
              ease: "linear",
            }}
            className="fixed top-0 pointer-events-none"
          >
            {renderParticle(particle.type)}
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-sm mx-4"
      >
        {/* Win Result */}
        {result === "win" && (
          <div className="text-center">
            {/* Crown & Trophy with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -inset-6 bg-stream-gold/40 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative h-28 w-28 rounded-full bg-gradient-to-br from-yellow-300 via-stream-gold to-orange-500 flex items-center justify-center shadow-2xl shadow-stream-gold/50"
                >
                  <Crown className="h-14 w-14 text-white" />
                </motion.div>
                
                {/* Orbiting stars */}
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2"
                    >
                      <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* WIN Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.4 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-stream-gold blur-xl"
                />
                <div className="relative px-10 py-3 bg-gradient-to-r from-yellow-400 via-stream-gold to-yellow-400 rounded-xl shadow-lg">
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-3xl font-black text-white drop-shadow-lg"
                  >
                    🏆 WIN
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-3xl font-black text-stream-gold mb-6"
            >
              You Are<br />
              <span className="text-4xl">Battle Winner!</span>
            </motion.h2>

            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-stream-gold/20 to-yellow-500/20 rounded-2xl p-5 border border-stream-gold/30 mb-6"
            >
              <div className="flex items-center gap-2 justify-center mb-3">
                <PartyPopper className="h-6 w-6 text-stream-gold" />
                <span className="text-stream-gold font-bold">Congratulations!</span>
                <PartyPopper className="h-6 w-6 text-stream-gold transform scale-x-[-1]" />
              </div>
              
              {/* Players */}
              <div className="flex items-center justify-between">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-12 w-12 ring-3 ring-stream-gold">
                    <AvatarImage src={winner.avatar} />
                    <AvatarFallback>{winner.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <span className="text-white font-semibold block">{winner.name.slice(0, 10)}</span>
                    <span className="text-stream-gold text-sm font-bold">{formatScore(winnerScore)} pts</span>
                  </div>
                </motion.div>

                <div className="text-2xl">⚔️</div>

                <div className="flex items-center gap-2 flex-row-reverse">
                  <Avatar className="h-10 w-10 ring-2 ring-white/30 opacity-60">
                    <AvatarImage src={loser.avatar} />
                    <AvatarFallback>{loser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <span className="text-white/60 font-medium block text-sm">{loser.name.slice(0, 10)}</span>
                    <span className="text-white/40 text-xs">{formatScore(loserScore)} pts</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Lose Result */}
        {result === "lose" && (
          <div className="text-center">
            {/* Sad Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 bg-red-500/30 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative h-24 w-24 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/50"
                >
                  <Frown className="h-12 w-12 text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* LOSE Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="px-10 py-3 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-xl shadow-lg">
                <span className="text-3xl font-black text-white">😢 LOSE</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black text-red-500 mb-6"
            >
              You Are<br />
              <span className="text-4xl">Battle Loser!</span>
            </motion.h2>

            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl p-5 border border-red-500/30 mb-6"
            >
              <p className="text-red-400 mb-3">Better luck next time!</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 ring-2 ring-white/30 opacity-60">
                    <AvatarImage src={loser.avatar} />
                    <AvatarFallback>{loser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <span className="text-white/60 font-medium block text-sm">{loser.name.slice(0, 10)}</span>
                    <span className="text-white/40 text-xs">{formatScore(loserScore)} pts</span>
                  </div>
                </div>

                <div className="text-2xl">⚔️</div>

                <div className="flex items-center gap-2 flex-row-reverse">
                  <Avatar className="h-12 w-12 ring-3 ring-stream-gold">
                    <AvatarImage src={winner.avatar} />
                    <AvatarFallback>{winner.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <span className="text-stream-gold font-semibold block">{winner.name.slice(0, 10)}</span>
                    <span className="text-stream-gold text-sm font-bold">{formatScore(winnerScore)} pts</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tie Result */}
        {result === "tie" && (
          <div className="text-center">
            {/* Bowtie Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring" }}
              className="flex justify-center mb-4"
            >
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-8xl">🎀</span>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-black text-orange-400 mb-6"
            >
              It's a<br />
              <span className="text-4xl">Tie Battle!</span>
            </motion.h2>

            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl p-5 border border-orange-500/30 mb-6"
            >
              <div className="flex items-center justify-center gap-4">
                <Avatar className="h-14 w-14 ring-3 ring-orange-400">
                  <AvatarImage src={winner.avatar} />
                  <AvatarFallback>{winner.name[0]}</AvatarFallback>
                </Avatar>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl"
                >
                  🤝
                </motion.span>
                <Avatar className="h-14 w-14 ring-3 ring-orange-400">
                  <AvatarImage src={loser.avatar} />
                  <AvatarFallback>{loser.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </motion.div>
          </div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-3"
        >
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            Exit
          </Button>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button
              onClick={onBattleAgain}
              className={cn(
                "w-full h-12 rounded-xl text-white font-bold",
                result === "win" && "bg-gradient-to-r from-stream-gold to-orange-500",
                result === "lose" && "bg-gradient-to-r from-red-500 to-red-600",
                result === "tie" && "bg-gradient-to-r from-orange-400 to-yellow-500"
              )}
            >
              <Zap className="h-5 w-5 mr-2" />
              Battle Again!
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
