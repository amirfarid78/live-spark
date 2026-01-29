import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Swords, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PKBattleCard, PKBattle } from "./PKBattleCard";

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

const mockBattles: PKBattle[] = [
  {
    id: "1",
    player1: { id: "p1", name: "Priya✨🔥", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", score: 6354, winStreak: 2 },
    player2: { id: "p2", name: "vijeta_sings🔥", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", score: 264, winStreak: 1 },
    type: "random",
    isLive: true,
    viewerCount: 1234,
  },
  {
    id: "2",
    player1: { id: "p3", name: "@_Niknik_@", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", score: 5298, winStreak: 2 },
    player2: { id: "p4", name: "@_Mistu02", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", score: 2368, winStreak: 1 },
    type: "random",
    isLive: true,
    viewerCount: 892,
  },
  {
    id: "3",
    player1: { id: "p5", name: "✨Riya_02✨💕", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", score: 5436, winStreak: 1 },
    player2: { id: "p6", name: "@SM_Khan🔥", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100", score: 840, winStreak: 2 },
    type: "random",
    isLive: true,
    viewerCount: 567,
  },
  {
    id: "4",
    player1: { id: "p7", name: "Luving_@💚", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100", score: 1240, winStreak: 2 },
    player2: { id: "p8", name: "🌟Hanna_S✨", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", score: 980, winStreak: 1 },
    type: "ranked",
    isLive: true,
    viewerCount: 345,
  },
  {
    id: "5",
    player1: { id: "p9", name: "DJ_Mike🎵", avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100", score: 8900, winStreak: 3 },
    player2: { id: "p10", name: "BeatMaster", avatar: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100", score: 7200, winStreak: 1 },
    type: "challenge",
    isLive: true,
    viewerCount: 2341,
  },
];

interface PKBattleListProps {
  onBattleClick?: (battle: PKBattle) => void;
  onJoinBattle?: () => void;
}

export function PKBattleList({ onBattleClick, onJoinBattle }: PKBattleListProps) {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
        {mockBattles.map((battle, index) => (
          <div 
            key={battle.id} 
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <PKBattleCard battle={battle} onClick={() => onBattleClick?.(battle)} />
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
