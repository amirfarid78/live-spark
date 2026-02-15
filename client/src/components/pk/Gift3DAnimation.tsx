import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Flame, Zap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Gift3DAnimationProps {
  gift: {
    id: number;
    icon: string;
    name: string;
    sender: string;
    value: number;
  };
  targetPlayer: "p1" | "p2";
  onComplete?: () => void;
}

export function Gift3DAnimation({ gift, targetPlayer, onComplete }: Gift3DAnimationProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [showCombo, setShowCombo] = useState(false);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);

    // Show combo effect
    setTimeout(() => setShowCombo(true), 500);

    // Cleanup
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const isLeft = targetPlayer === "p1";

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {/* Background flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.5 }}
        className={cn(
          "absolute inset-0",
          isLeft 
            ? "bg-gradient-to-r from-stream-purple/50 to-transparent" 
            : "bg-gradient-to-l from-stream-coral/50 to-transparent"
        )}
      />

      {/* 3D Gift Entry */}
      <motion.div
        initial={{ 
          scale: 0, 
          x: isLeft ? -200 : 200,
          y: 100,
          rotateY: isLeft ? -90 : 90,
          rotateZ: isLeft ? -30 : 30,
        }}
        animate={{ 
          scale: [0, 1.5, 1.2, 1],
          x: isLeft ? 100 : -100,
          y: [100, -50, 0],
          rotateY: 0,
          rotateZ: [isLeft ? -30 : 30, 10, -5, 0],
        }}
        transition={{ 
          duration: 0.8,
          times: [0, 0.4, 0.7, 1],
          ease: "easeOut"
        }}
        className={cn(
          "absolute top-1/3",
          isLeft ? "left-1/4" : "right-1/4"
        )}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        {/* Glow behind gift */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute -inset-8 rounded-full bg-gradient-radial from-stream-gold/60 via-stream-gold/20 to-transparent blur-xl"
        />

        {/* Main gift icon with 3D effect */}
        <motion.div
          animate={{ 
            rotateY: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotateY: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.5, repeat: Infinity }
          }}
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span className="text-8xl drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
            {gift.icon}
          </span>

          {/* 3D shadow */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/30 rounded-full blur-md"
            style={{ transform: "rotateX(60deg)" }}
          />
        </motion.div>

        {/* Gift name label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-stream-gold via-yellow-400 to-stream-gold text-black font-bold text-lg shadow-xl">
            {gift.name}
          </div>
        </motion.div>
      </motion.div>

      {/* Particle explosion */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: isLeft ? "25%" : "75%", 
              y: "33%",
              scale: 0,
              opacity: 1 
            }}
            animate={{ 
              x: `calc(${isLeft ? "25%" : "75%"} + ${particle.x}px)`,
              y: `calc(33% + ${particle.y}px)`,
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ 
              duration: 1.5,
              delay: particle.delay,
              ease: "easeOut"
            }}
            className="absolute"
          >
            {particle.id % 4 === 0 && <Star className="h-6 w-6 text-stream-gold fill-stream-gold" />}
            {particle.id % 4 === 1 && <Sparkles className="h-5 w-5 text-yellow-300" />}
            {particle.id % 4 === 2 && <Heart className="h-5 w-5 text-stream-coral fill-stream-coral" />}
            {particle.id % 4 === 3 && <Flame className="h-5 w-5 text-orange-500" />}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Combo multiplier */}
      <AnimatePresence>
        {showCombo && gift.value >= 100 && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [0, 1.3, 1], rotate: [-20, 5, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "absolute top-1/4",
              isLeft ? "left-1/3" : "right-1/3"
            )}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4"
              >
                <div className="w-full h-full rounded-full border-4 border-dashed border-stream-gold/50" />
              </motion.div>
              <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-stream-gold via-yellow-400 to-orange-500 shadow-2xl shadow-stream-gold/50">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-white" />
                  <span className="text-2xl font-black text-white">
                    x{Math.floor(gift.value / 100)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sender info trail */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "absolute bottom-1/3",
          isLeft ? "left-8" : "right-8"
        )}
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-2xl">{gift.icon}</span>
          </motion.div>
          <div>
            <p className="text-white font-semibold">{gift.sender}</p>
            <p className="text-stream-gold text-sm">sent {gift.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Screen edge glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: 2 }}
        className={cn(
          "absolute inset-y-0 w-32",
          isLeft ? "left-0 bg-gradient-to-r from-stream-purple/40 to-transparent" : "right-0 bg-gradient-to-l from-stream-coral/40 to-transparent"
        )}
      />
    </div>
  );
}
