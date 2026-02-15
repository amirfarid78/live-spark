import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Swords, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PKBattleCard, PKBattle } from "./PKBattleCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface Country {
  id: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { id: "all", name: "All", flag: "🌍" },
  { id: "us", name: "United States", flag: "🇺🇸" },
  { id: "pk", name: "Pakistan", flag: "🇵🇰" },
  { id: "af", name: "Afghanistan", flag: "🇦🇫" },
  { id: "in", name: "India", flag: "🇮🇳" },
  { id: "bd", name: "Bangladesh", flag: "🇧🇩" },
  { id: "gb", name: "UK", flag: "🇬🇧" },
  { id: "ae", name: "UAE", flag: "🇦🇪" },
];

function mapApiBattles(data: any[]): PKBattle[] {
  return data.map((b: any) => {
    const isPending = b.status === 'pending';
    return {
      id: String(b.id),
      player1: {
        id: String(b.hostId),
        name: b.host?.displayName || b.host?.username || 'Player 1',
        avatar: b.host?.avatarUrl || '',
        score: b.hostScore || 0,
        winStreak: 0,
      },
      player2: {
        id: b.opponentId ? String(b.opponentId) : '0',
        name: (isPending || !b.opponent) ? 'Waiting...' : (b.opponent?.displayName || b.opponent?.username || 'Player 2'),
        avatar: (isPending || !b.opponent) ? '' : (b.opponent?.avatarUrl || ''),
        score: b.opponentScore || 0,
        winStreak: 0,
      },
      type: "random" as const,
      isLive: b.status === 'live',
      isPending,
      viewerCount: b.viewerCount || 0,
    };
  });
}

interface PKBattleListProps {
  onBattleClick?: (battle: PKBattle) => void;
  onJoinBattle?: () => void;
}

export function PKBattleList({ onBattleClick, onJoinBattle }: PKBattleListProps) {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: battles = [] } = useQuery<PKBattle[]>({
    queryKey: ['/api/pk-battles'],
    queryFn: async () => {
      const res = await api.get('/pk-battles');
      return mapApiBattles(res.data || []);
    },
  });

  const handleJoinBattle = async (battleId: string) => {
    try {
      await api.post(`/pk-battles/${battleId}/join`);
      queryClient.invalidateQueries({ queryKey: ['/api/pk-battles'] });
    } catch (error) {
      console.error("Failed to join battle:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Country Filter */}
      <div className="px-4 py-3 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {countries.map((country) => (
            <button
              key={country.id}
              onClick={() => setSelectedCountry(country.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                selectedCountry === country.id
                  ? "bg-gradient-to-r from-stream-purple to-stream-coral text-white shadow-lg"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              )}
            >
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search battles..."
            className="pl-9 h-10 bg-secondary/50 border-border/50 rounded-xl"
          />
        </div>
      </div>

      {/* Battle Cards */}
      <div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
        {battles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Swords className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No active battles</p>
            <p className="text-sm">Start one or check back later!</p>
          </div>
        )}
        {battles.map((battle, index) => (
          <div 
            key={battle.id} 
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <PKBattleCard battle={battle} onClick={() => onBattleClick?.(battle)} onJoinBattle={handleJoinBattle} />
          </div>
        ))}
      </div>

      {/* Floating Join Battle Button */}
      <div className="absolute bottom-20 right-4 z-20">
        <Button
          onClick={onJoinBattle}
          className="h-14 px-6 rounded-2xl bg-gradient-to-r from-stream-live to-stream-coral text-white shadow-xl shadow-stream-live/30 hover:shadow-2xl hover:shadow-stream-live/40 transition-all hover:scale-105"
        >
          <Swords className="h-5 w-5 mr-2" />
          Join Battle
        </Button>
      </div>
    </div>
  );
}
