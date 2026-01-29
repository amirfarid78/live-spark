import React, { useState, useEffect } from "react";
import { Swords, Crown, Flame, Trophy, Timer, Users, Gem, Sparkles, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PKPlayer {
  id: string;
  name: string;
  avatar: string;
  level: number;
  score: number;
  thumbnail: string;
}

interface PKBattleViewProps {
  player1: PKPlayer;
  player2: PKPlayer;
  duration: number; // in seconds
  onTimeUp?: () => void;
}

export function PKBattleView({ player1, player2, duration, onTimeUp }: PKBattleViewProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [scores, setScores] = useState({ p1: player1.score, p2: player2.score });

  const totalScore = scores.p1 + scores.p2;
  const p1Percentage = totalScore > 0 ? (scores.p1 / totalScore) * 100 : 50;
  const p2Percentage = totalScore > 0 ? (scores.p2 / totalScore) * 100 : 50;

  const winner = scores.p1 > scores.p2 ? "p1" : scores.p2 > scores.p1 ? "p2" : null;

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  // Simulate live score updates
  useEffect(() => {
    const interval = setInterval(() => {
      const random1 = Math.floor(Math.random() * 50);
      const random2 = Math.floor(Math.random() * 50);
      setScores((prev) => ({
        p1: prev.p1 + random1,
        p2: prev.p2 + random2,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  return (
    <div className="relative w-full">
      {/* Split Screen Container */}
      <div className="flex h-[50vh] relative">
        {/* Player 1 Side */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src={player1.thumbnail}
            alt={player1.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stream-purple/40 to-transparent" />
          
          {/* Player 1 Info */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-white/50 ring-offset-2 ring-offset-black">
                <AvatarImage src={player1.avatar} />
                <AvatarFallback>{player1.name[0]}</AvatarFallback>
              </Avatar>
              {winner === "p1" && (
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-stream-gold flex items-center justify-center animate-bounce">
                  <Crown className="h-3.5 w-3.5 text-black" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">{player1.name}</span>
                <Badge className="bg-stream-purple text-white border-0 text-[10px] px-1.5">
                  LV.{player1.level}
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Gem className="h-4 w-4 text-stream-gold" />
                <span className="text-white font-bold text-lg">{formatScore(scores.p1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Battle Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-xl shadow-stream-gold/50 animate-pulse">
              <Swords className="h-8 w-8 text-black" />
            </div>
            <div className="absolute -inset-3 rounded-full border-4 border-stream-gold/50 animate-spin-slow" />
          </div>
        </div>

        {/* Player 2 Side */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src={player2.thumbnail}
            alt={player2.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-stream-coral/40 to-transparent" />
          
          {/* Player 2 Info */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3 flex-row-reverse">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-white/50 ring-offset-2 ring-offset-black">
                <AvatarImage src={player2.avatar} />
                <AvatarFallback>{player2.name[0]}</AvatarFallback>
              </Avatar>
              {winner === "p2" && (
                <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-stream-gold flex items-center justify-center animate-bounce">
                  <Crown className="h-3.5 w-3.5 text-black" />
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Badge className="bg-stream-coral text-white border-0 text-[10px] px-1.5">
                  LV.{player2.level}
                </Badge>
                <span className="font-bold text-white text-lg">{player2.name}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 justify-end">
                <span className="text-white font-bold text-lg">{formatScore(scores.p2)}</span>
                <Gem className="h-4 w-4 text-stream-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Progress Bar */}
      <div className="absolute left-4 right-4 top-4 z-10">
        {/* Timer */}
        <div className="flex justify-center mb-3">
          <Badge className={cn(
            "bg-black/60 text-white border-0 px-4 py-2 backdrop-blur-md",
            timeLeft <= 30 && "bg-stream-live/80 animate-pulse"
          )}>
            <Timer className="h-4 w-4 mr-2" />
            <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
          </Badge>
        </div>

        {/* Score Progress */}
        <div className="relative h-3 rounded-full overflow-hidden bg-black/30 backdrop-blur-sm">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-stream-purple to-stream-purple-light transition-all duration-500"
            style={{ width: `${p1Percentage}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-stream-coral to-stream-coral-light transition-all duration-500"
            style={{ width: `${p2Percentage}%` }}
          />
          
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 -translate-x-1/2" />
        </div>

        {/* Percentage Labels */}
        <div className="flex justify-between mt-1.5">
          <span className={cn(
            "text-xs font-bold",
            winner === "p1" ? "text-stream-gold" : "text-white/80"
          )}>
            {p1Percentage.toFixed(0)}%
          </span>
          <span className={cn(
            "text-xs font-bold",
            winner === "p2" ? "text-stream-gold" : "text-white/80"
          )}>
            {p2Percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Winner Announcement (when time is up) */}
      {timeLeft === 0 && winner && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center">
          <div className="text-center animate-scale-in">
            <div className="mb-4 flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-gold flex items-center justify-center shadow-2xl shadow-stream-gold/50">
                <Trophy className="h-12 w-12 text-black" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {winner === "p1" ? player1.name : player2.name} Wins!
            </h2>
            <div className="flex items-center justify-center gap-2 text-stream-gold">
              <Sparkles className="h-5 w-5" />
              <span className="text-xl font-bold">
                {formatScore(winner === "p1" ? scores.p1 : scores.p2)} coins earned
              </span>
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
