import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, AlertTriangle, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  timeLeft: number;
  totalTime: number;
}

export function CountdownTimer({ timeLeft, totalTime }: CountdownTimerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [showUrgent, setShowUrgent] = useState(false);

  const percentage = (timeLeft / totalTime) * 100;
  const isWarning = timeLeft <= 60 && timeLeft > 30;
  const isUrgent = timeLeft <= 30;

  useEffect(() => {
    setShowWarning(isWarning);
    setShowUrgent(isUrgent);
  }, [isWarning, isUrgent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      animate={isUrgent ? {
        scale: [1, 1.05, 1],
        y: [0, -2, 0],
      } : {}}
      transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
      className="relative"
    >
      {/* Outer glow for urgent */}
      <AnimatePresence>
        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -inset-3 bg-stream-live/40 rounded-full blur-lg"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "relative flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md transition-all duration-300",
          isUrgent 
            ? "bg-gradient-to-r from-red-600 to-stream-live shadow-lg shadow-red-500/50" 
            : isWarning 
              ? "bg-gradient-to-r from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/30"
              : "bg-black/60 border border-white/20"
        )}
      >
        {/* Animated icon */}
        <motion.div
          animate={isUrgent ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.3, repeat: isUrgent ? Infinity : 0 }}
        >
          {isUrgent ? (
            <AlertTriangle className="h-5 w-5 text-white" />
          ) : isWarning ? (
            <Flame className="h-5 w-5 text-white" />
          ) : (
            <Timer className="h-5 w-5 text-white/80" />
          )}
        </motion.div>

        {/* Time display */}
        <div className="flex items-center gap-1">
          <span className="text-white/60 text-sm">Cutdown :</span>
          <motion.span
            key={timeLeft}
            initial={{ scale: 1.2, color: "#fff" }}
            animate={{ scale: 1 }}
            className={cn(
              "font-bold text-lg tabular-nums",
              isUrgent ? "text-white" : isWarning ? "text-white" : "text-white"
            )}
          >
            {formatTime(timeLeft)}
          </motion.span>
        </div>

        {/* Progress ring (subtle) */}
        <svg className="absolute -inset-0.5 w-full h-full -rotate-90" viewBox="0 0 100 40">
          <rect
            x="2"
            y="2"
            width="96"
            height="36"
            rx="18"
            ry="18"
            fill="none"
            stroke={isUrgent ? "#ef4444" : isWarning ? "#f97316" : "#ffffff20"}
            strokeWidth="1"
            strokeDasharray={`${percentage * 2.6} 260`}
            className="transition-all duration-1000"
          />
        </svg>

        {/* Electric effect for urgent */}
        <AnimatePresence>
          {isUrgent && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.5 }}
                className="absolute -left-2"
              >
                <Zap className="h-4 w-4 text-yellow-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.5, delay: 0.25 }}
                className="absolute -right-2"
              >
                <Zap className="h-4 w-4 text-yellow-300" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Seconds tick animation */}
      <AnimatePresence>
        {isUrgent && timeLeft <= 10 && (
          <motion.div
            key={timeLeft}
            initial={{ scale: 2, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="text-6xl font-black text-stream-live/50">
              {timeLeft}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
