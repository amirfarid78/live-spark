import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Frown, XCircle, Sparkles, PartyPopper } from "lucide-react";

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
  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm mx-4">
        {/* Win Result */}
        {result === "win" && (
          <div className="animate-bounce-in">
            {/* Crown & Trophy */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-stream-gold/30 rounded-full blur-2xl animate-pulse" />
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-yellow-300 via-stream-gold to-orange-500 flex items-center justify-center shadow-2xl shadow-stream-gold/50">
                  <Crown className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                </div>
              </div>
            </div>

            {/* WIN Badge */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-stream-gold blur-xl opacity-50" />
                <div className="relative px-8 py-2 bg-gradient-to-r from-yellow-400 via-stream-gold to-yellow-400 rounded-lg shadow-lg">
                  <span className="text-2xl font-black text-white drop-shadow-lg">WIN</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-3xl font-black text-stream-gold mb-6 drop-shadow-lg">
              You Are<br />Battle Winner
            </h2>

            {/* Score Card */}
            <div className="bg-gradient-to-r from-stream-gold/20 to-yellow-500/20 rounded-2xl p-4 border border-stream-gold/30 mb-6">
              <div className="text-center mb-2">
                <span className="text-stream-gold text-sm font-semibold">Congrats!</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-black text-stream-gold">You win!</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <PartyPopper className="h-5 w-5 text-stream-gold" />
                </div>
              </div>
              
              {/* Players */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 ring-2 ring-stream-gold">
                    <AvatarImage src={winner.avatar} />
                    <AvatarFallback>{winner.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-white text-sm font-medium">{winner.name.slice(0, 10)}</span>
                    <div className="text-stream-gold text-xs">{formatScore(winnerScore)} pts</div>
                  </div>
                </div>
                <span className="text-2xl">VS</span>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Avatar className="h-10 w-10 ring-2 ring-white/30">
                    <AvatarImage src={loser.avatar} />
                    <AvatarFallback>{loser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <span className="text-white/70 text-sm font-medium">{loser.name.slice(0, 10)}</span>
                    <div className="text-white/50 text-xs">{formatScore(loserScore)} pts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lose Result */}
        {result === "lose" && (
          <div className="animate-bounce-in">
            {/* Sad Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-red-500/30 rounded-full blur-2xl" />
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/50">
                  <Frown className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            {/* LOSE Badge */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-50" />
                <div className="relative px-8 py-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-lg shadow-lg">
                  <span className="text-2xl font-black text-white drop-shadow-lg">LOSE</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-3xl font-black text-red-500 mb-6 drop-shadow-lg">
              You Are<br />Battle Loser !
            </h2>

            {/* Score Card */}
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl p-4 border border-red-500/30 mb-6">
              <div className="text-center mb-2">
                <span className="text-red-400 text-sm font-semibold">Ohh...</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-black text-red-500">You Lose!</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-2xl">😢</span>
                </div>
              </div>
              
              {/* Players */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 ring-2 ring-white/30">
                    <AvatarImage src={loser.avatar} />
                    <AvatarFallback>{loser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-white/70 text-sm font-medium">{loser.name.slice(0, 10)}</span>
                    <div className="text-white/50 text-xs">{formatScore(loserScore)} pts</div>
                  </div>
                </div>
                <span className="text-2xl">VS</span>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Avatar className="h-10 w-10 ring-2 ring-stream-gold">
                    <AvatarImage src={winner.avatar} />
                    <AvatarFallback>{winner.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <span className="text-stream-gold text-sm font-medium">{winner.name.slice(0, 10)}</span>
                    <div className="text-stream-gold text-xs">{formatScore(winnerScore)} pts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tie Result */}
        {result === "tie" && (
          <div className="animate-bounce-in">
            {/* Bowtie Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-orange-500/30 rounded-full blur-2xl" />
                <div className="relative h-24 w-24 flex items-center justify-center">
                  <span className="text-6xl">🎀</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-3xl font-black text-orange-400 mb-6 drop-shadow-lg">
              Bad Luck<br />This Tie Battle
            </h2>

            {/* Score Card */}
            <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl p-4 border border-orange-500/30 mb-6">
              <div className="text-center">
                <span className="text-3xl font-black text-orange-400">Tie Battle !</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-2xl">🤝</span>
                </div>
              </div>
              
              {/* Players */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 ring-2 ring-orange-400">
                    <AvatarImage src={winner.avatar} />
                    <AvatarFallback>{winner.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-2xl">🤝</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 ring-2 ring-orange-400">
                    <AvatarImage src={loser.avatar} />
                    <AvatarFallback>{loser.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onBattleAgain}
            className={cn(
              "flex-1 h-12 rounded-xl text-white font-bold",
              result === "win" && "bg-gradient-to-r from-stream-gold to-orange-500",
              result === "lose" && "bg-gradient-to-r from-red-500 to-red-600",
              result === "tie" && "bg-gradient-to-r from-orange-400 to-yellow-500"
            )}
          >
            Battle Again !
          </Button>
        </div>
      </div>
    </div>
  );
}
