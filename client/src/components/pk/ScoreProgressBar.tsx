import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Gem, Flame, TrendingUp } from "lucide-react";

interface ScoreProgressBarProps {
  p1Score: number;
  p2Score: number;
  p1WinStreak: number;
  p2WinStreak: number;
  previousP1Score?: number;
  previousP2Score?: number;
}

export function ScoreProgressBar({
  p1Score,
  p2Score,
  p1WinStreak,
  p2WinStreak,
  previousP1Score = 0,
  previousP2Score = 0,
}: ScoreProgressBarProps) {
  const totalScore = p1Score + p2Score;
  const p1Percentage = totalScore > 0 ? (p1Score / totalScore) * 100 : 50;
  const p2Percentage = 100 - p1Percentage;
  
  const p1Gained = p1Score - previousP1Score;
  const p2Gained = p2Score - previousP2Score;
  
  const leader = p1Score > p2Score ? "p1" : p2Score > p1Score ? "p2" : null;

  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  return (
    <div className="relative">
      {/* Win Streak & Score Labels */}
      <div 
        className="flex justify-between items-center px-4 py-2"
        style={{
          background: "linear-gradient(90deg, rgba(124,58,237,0.8) 0%, rgba(88,28,135,0.9) 50%, rgba(249,115,22,0.8) 100%)",
        }}
      >
        {/* Player 1 Side */}
        <div className="flex items-center gap-3">
          {/* Win streak badge */}
          <motion.div
            animate={p1WinStreak > 1 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: p1WinStreak > 1 ? Infinity : 0, repeatDelay: 2 }}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
              p1WinStreak >= 3 
                ? "bg-stream-gold text-black" 
                : "bg-white/20 text-white/80"
            )}
          >
            {p1WinStreak >= 3 && <Flame className="h-3 w-3" />}
            Win x{p1WinStreak}
          </motion.div>

          {/* Score with animation */}
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Gem className="h-4 w-4 text-stream-gold" />
            </motion.div>
            <motion.span
              key={p1Score}
              initial={{ scale: 1.3, color: "#FFD700" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ duration: 0.3 }}
              className="text-white font-bold text-base tabular-nums"
            >
              {formatScore(p1Score)}
            </motion.span>
            
            {/* Score gain popup */}
            <AnimatePresence>
              {p1Gained > 0 && (
                <motion.span
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -20, scale: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute left-20 text-stream-gold text-sm font-bold"
                >
                  +{p1Gained}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center indicator */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-1"
        >
          <TrendingUp className={cn(
            "h-4 w-4 transition-transform",
            leader === "p1" ? "text-stream-purple rotate-0" : leader === "p2" ? "text-stream-coral rotate-180" : "text-white/50"
          )} />
        </motion.div>

        {/* Player 2 Side */}
        <div className="flex items-center gap-3 flex-row-reverse">
          {/* Win streak badge */}
          <motion.div
            animate={p2WinStreak > 1 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: p2WinStreak > 1 ? Infinity : 0, repeatDelay: 2 }}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
              p2WinStreak >= 3 
                ? "bg-stream-gold text-black" 
                : "bg-white/20 text-white/80"
            )}
          >
            Win x{p2WinStreak}
            {p2WinStreak >= 3 && <Flame className="h-3 w-3" />}
          </motion.div>

          {/* Score with animation */}
          <div className="flex items-center gap-1.5">
            <motion.span
              key={p2Score}
              initial={{ scale: 1.3, color: "#FFD700" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ duration: 0.3 }}
              className="text-white font-bold text-base tabular-nums"
            >
              {formatScore(p2Score)}
            </motion.span>
            <motion.div
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Gem className="h-4 w-4 text-stream-gold" />
            </motion.div>
            
            {/* Score gain popup */}
            <AnimatePresence>
              {p2Gained > 0 && (
                <motion.span
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -20, scale: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute right-20 text-stream-gold text-sm font-bold"
                >
                  +{p2Gained}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="relative h-3 bg-gradient-to-r from-stream-purple/20 via-black to-stream-coral/20 overflow-hidden">
        {/* Player 1 bar */}
        <motion.div
          className="absolute left-0 top-0 h-full"
          initial={{ width: "50%" }}
          animate={{ width: `${p1Percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{
            background: "linear-gradient(90deg, #7C3AED 0%, #9333EA 50%, #A855F7 100%)",
            boxShadow: "0 0 20px rgba(124,58,237,0.5)",
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>

        {/* Player 2 bar */}
        <motion.div
          className="absolute right-0 top-0 h-full"
          initial={{ width: "50%" }}
          animate={{ width: `${p2Percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{
            background: "linear-gradient(90deg, #FB7185 0%, #F43F5E 50%, #E11D48 100%)",
            boxShadow: "0 0 20px rgba(249,115,22,0.5)",
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>

        {/* Center clash point */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ left: `${p1Percentage}%`, transform: "translateX(-50%) translateY(-50%)" }}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-4 h-4 rounded-full bg-white shadow-lg shadow-white/50"
          />
        </motion.div>
      </div>

      {/* Percentage labels */}
      <div className="flex justify-between px-4 py-1 bg-black/40">
        <motion.span
          key={`p1-${Math.round(p1Percentage)}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={cn(
            "text-xs font-bold",
            leader === "p1" ? "text-stream-gold" : "text-white/60"
          )}
        >
          {Math.round(p1Percentage)}%
        </motion.span>
        <motion.span
          key={`p2-${Math.round(p2Percentage)}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={cn(
            "text-xs font-bold",
            leader === "p2" ? "text-stream-gold" : "text-white/60"
          )}
        >
          {Math.round(p2Percentage)}%
        </motion.span>
      </div>
    </div>
  );
}
