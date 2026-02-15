import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export interface PKBattle {
  id: string;
  player1: {
    id: string;
    name: string;
    avatar: string;
    score: number;
    winStreak: number;
    country?: string;
  };
  player2: {
    id: string;
    name: string;
    avatar: string;
    score: number;
    winStreak: number;
    country?: string;
  };
  type: "random" | "ranked" | "challenge";
  isLive: boolean;
  viewerCount: number;
}

interface PKBattleCardProps {
  battle: PKBattle;
  onClick?: () => void;
}

export function PKBattleCard({ battle, onClick }: PKBattleCardProps) {
  const totalScore = battle.player1.score + battle.player2.score;
  const p1Percentage = totalScore > 0 ? (battle.player1.score / totalScore) * 100 : 50;
  const p2Percentage = totalScore > 0 ? (battle.player2.score / totalScore) * 100 : 50;
  
  const leader = battle.player1.score > battle.player2.score ? "p1" : 
                 battle.player2.score > battle.player1.score ? "p2" : null;

  const formatScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300",
        "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
        "border border-white/10 backdrop-blur-xl",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-stream-purple/20",
        "active:scale-[0.98]"
      )}
    >
      {/* Type Badge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <Badge 
          className={cn(
            "rounded-t-none rounded-b-xl px-4 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg",
            battle.type === "random" && "bg-gradient-to-r from-yellow-400 to-orange-500 text-black",
            battle.type === "ranked" && "bg-gradient-to-r from-stream-purple to-stream-coral text-white",
            battle.type === "challenge" && "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          )}
        >
          {battle.type === "random" ? "Random PK" : battle.type === "ranked" ? "Ranked" : "Challenge"}
        </Badge>
      </div>

      <div className="p-4 pt-6">
        {/* Players Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Player 1 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative">
              <div className={cn(
                "absolute -inset-1 rounded-full blur-md transition-opacity",
                leader === "p1" ? "bg-stream-gold/50 opacity-100" : "opacity-0"
              )} />
              <Avatar className={cn(
                "h-16 w-16 ring-2 ring-offset-2 ring-offset-transparent relative",
                leader === "p1" ? "ring-stream-gold" : "ring-stream-purple/50"
              )}>
                <AvatarImage src={battle.player1.avatar} />
                <AvatarFallback>{battle.player1.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                {battle.player1.name}
              </span>
              {battle.player1.winStreak > 0 && (
                <Badge className="mt-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[9px] px-2 border-0">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  WIN x{battle.player1.winStreak}
                </Badge>
              )}
            </div>
          </div>

          {/* VS Badge */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 blur-xl opacity-50" />
            <div className="relative">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700'/%3E%3Cstop offset='50%25' style='stop-color:%23FFA500'/%3E%3Cstop offset='100%25' style='stop-color:%23FF6B00'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M10,10 L30,50 L40,30 L50,50 L70,10 M75,10 L75,50 Q90,35 75,25 Q90,15 75,10' fill='url(%23g)' stroke='%23FFD700' stroke-width='2'/%3E%3C/svg%3E"
                alt="VS"
                className="h-10 w-14 animate-pulse"
              />
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative">
              <div className={cn(
                "absolute -inset-1 rounded-full blur-md transition-opacity",
                leader === "p2" ? "bg-stream-gold/50 opacity-100" : "opacity-0"
              )} />
              <Avatar className={cn(
                "h-16 w-16 ring-2 ring-offset-2 ring-offset-transparent relative",
                leader === "p2" ? "ring-stream-gold" : "ring-stream-coral/50"
              )}>
                <AvatarImage src={battle.player2.avatar} />
                <AvatarFallback>{battle.player2.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                {battle.player2.name}
              </span>
              {battle.player2.winStreak > 0 && (
                <Badge className="mt-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[9px] px-2 border-0">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  WIN x{battle.player2.winStreak}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="mt-4">
          <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-stream-purple/20 via-transparent to-stream-coral/20">
            {/* P1 Score Bar */}
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-stream-purple to-stream-purple-light transition-all duration-500 flex items-center"
              style={{ width: `${p1Percentage}%` }}
            >
              <div className="flex items-center gap-1 px-2">
                <span className="text-[10px] font-bold text-white flex items-center">
                  ⭐ {formatScore(battle.player1.score)}
                </span>
              </div>
            </div>
            
            {/* P2 Score Bar */}
            <div 
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-stream-coral to-stream-coral-light transition-all duration-500 flex items-center justify-end"
              style={{ width: `${p2Percentage}%` }}
            >
              <div className="flex items-center gap-1 px-2">
                <span className="text-[10px] font-bold text-white flex items-center">
                  {formatScore(battle.player2.score)} ⭐
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
