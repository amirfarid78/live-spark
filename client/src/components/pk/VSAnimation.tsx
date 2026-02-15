import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Zap, Flame, Crown, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface VSAnimationProps {
  isActive?: boolean;
  intensity?: "low" | "medium" | "high";
}

export function VSAnimation({ isActive = true, intensity = "medium" }: VSAnimationProps) {
  const [sparks, setSparks] = useState<{ id: number; angle: number; delay: number }[]>([]);

  useEffect(() => {
    if (isActive) {
      const newSparks = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (360 / 12) * i,
        delay: Math.random() * 0.5,
      }));
      setSparks(newSparks);
    }
  }, [isActive]);

  const getIntensityConfig = () => {
    switch (intensity) {
      case "high":
        return { scale: 1.2, glowSize: 60, animationSpeed: 0.3 };
      case "low":
        return { scale: 0.8, glowSize: 20, animationSpeed: 0.8 };
      default:
        return { scale: 1, glowSize: 40, animationSpeed: 0.5 };
    }
  };

  const config = getIntensityConfig();

  return (
    <div className="relative flex items-center justify-center" style={{ perspective: "1000px" }}>
      {/* Outer rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-32 h-32"
      >
        <div className="w-full h-full rounded-full border-4 border-dashed border-stream-gold/30" />
        {[0, 90, 180, 270].map((angle) => (
          <motion.div
            key={angle}
            className="absolute top-1/2 left-1/2 w-3 h-3"
            style={{
              transform: `rotate(${angle}deg) translateY(-64px) translateX(-50%)`,
            }}
          >
            <Star className="h-3 w-3 text-stream-gold fill-stream-gold" />
          </motion.div>
        ))}
      </motion.div>

      {/* Inner counter-rotating ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute w-24 h-24"
      >
        <div className="w-full h-full rounded-full border-2 border-stream-coral/40" />
      </motion.div>

      {/* Center VS badge with 3D effect */}
      <motion.div
        animate={{
          scale: [config.scale, config.scale * 1.1, config.scale],
          rotateY: [0, 10, -10, 0],
        }}
        transition={{
          duration: config.animationSpeed * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute -inset-4 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,107,107,0.3) 50%, transparent 70%)`,
          }}
        />

        {/* Main VS container */}
        <div className="relative">
          {/* Background circle with gradient */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-20 w-20 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)",
              boxShadow: `0 0 ${config.glowSize}px rgba(255,215,0,0.5), 0 0 ${config.glowSize * 2}px rgba(255,107,0,0.3)`,
            }}
          >
            {/* VS Text with 3D effect */}
            <div className="relative">
              <span 
                className="text-3xl font-black text-white drop-shadow-lg"
                style={{
                  textShadow: "2px 2px 0 #c70000, 4px 4px 0 #8b0000, 0 0 20px rgba(255,255,255,0.5)",
                }}
              >
                VS
              </span>
            </div>
          </motion.div>

          {/* Swords crossing animation */}
          <motion.div
            className="absolute -top-2 -left-4"
            animate={{ rotate: [-15, -10, -15], x: [0, 2, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Swords className="h-8 w-8 text-stream-purple drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute -top-2 -right-4"
            animate={{ rotate: [15, 10, 15], x: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Swords className="h-8 w-8 text-stream-coral drop-shadow-lg transform scale-x-[-1]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Electric sparks */}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: spark.delay,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="absolute"
            style={{
              transform: `rotate(${spark.angle}deg) translateY(-50px)`,
            }}
          >
            <Zap className="h-4 w-4 text-yellow-300" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Lightning bolts on sides */}
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1, 0.9] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="absolute -left-8"
      >
        <Flame className="h-6 w-6 text-stream-purple" />
      </motion.div>

      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1, 0.9] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
        className="absolute -right-8"
      >
        <Flame className="h-6 w-6 text-stream-coral" />
      </motion.div>
    </div>
  );
}

// Score change animation component
interface ScorePopupProps {
  amount: number;
  position: "left" | "right";
  onComplete?: () => void;
}

export function ScorePopup({ amount, position, onComplete }: ScorePopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, y: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.5, 1],
        y: -60,
        opacity: [0, 1, 1, 0],
      }}
      transition={{ duration: 1.5 }}
      className={cn(
        "absolute z-50 pointer-events-none",
        position === "left" ? "left-1/4" : "right-1/4"
      )}
    >
      <div className="flex items-center gap-1">
        <span className="text-2xl font-black text-stream-gold drop-shadow-lg">
          +{amount}
        </span>
        <Sparkles className="h-5 w-5 text-yellow-300" />
      </div>
    </motion.div>
  );
}

// Crown animation for leader
interface LeaderCrownProps {
  isLeader: boolean;
}

export function LeaderCrown({ isLeader }: LeaderCrownProps) {
  if (!isLeader) return null;

  return (
    <motion.div
      initial={{ scale: 0, y: -20, rotate: -30 }}
      animate={{ 
        scale: 1, 
        y: 0, 
        rotate: 0,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      <motion.div
        animate={{ 
          y: [0, -5, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="relative">
          {/* Crown glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -inset-2 bg-stream-gold/50 rounded-full blur-md"
          />
          <Crown className="h-8 w-8 text-stream-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] relative z-10" />
        </div>
      </motion.div>
    </motion.div>
  );
}
