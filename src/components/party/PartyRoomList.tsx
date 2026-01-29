import React from "react";
import { PartyRoomCard, PartyRoom } from "./PartyRoomCard";
import { Sparkles, Mic2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartyRoomListProps {
  rooms: PartyRoom[];
  onRoomClick: (room: PartyRoom) => void;
}

const regionFilters = [
  { id: "all", label: "All", icon: Globe, flag: "🌍" },
  { id: "us", label: "United States", flag: "🇺🇸" },
  { id: "pk", label: "Pakistan", flag: "🇵🇰" },
  { id: "in", label: "India", flag: "🇮🇳" },
  { id: "uk", label: "UK", flag: "🇬🇧" },
];

export function PartyRoomList({ rooms, onRoomClick }: PartyRoomListProps) {
  const [activeRegion, setActiveRegion] = React.useState("all");

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-stream-purple to-stream-coral rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-stream-purple/20 to-stream-coral/20 flex items-center justify-center">
            <Mic2 className="h-10 w-10 text-stream-purple" />
          </div>
        </div>
        <p className="text-foreground font-semibold text-lg">No party rooms yet</p>
        <p className="text-muted-foreground text-sm mt-1">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Region Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {regionFilters.map((region) => (
          <button
            key={region.id}
            onClick={() => setActiveRegion(region.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all press-effect",
              "border shadow-sm",
              activeRegion === region.id
                ? "bg-gradient-to-r from-stream-purple to-stream-coral text-white border-transparent shadow-lg shadow-stream-purple/20"
                : "bg-white/80 dark:bg-secondary border-border/50 hover:bg-secondary/80"
            )}
          >
            <span className="text-base">{region.flag}</span>
            {region.label}
          </button>
        ))}
      </div>

      {/* Header with sparkle */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-stream-gold animate-pulse" />
        <span className="text-sm font-medium text-muted-foreground">
          {rooms.length} active rooms
        </span>
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 gap-4">
        {rooms.map((room, index) => (
          <PartyRoomCard 
            key={room.id} 
            room={room} 
            onClick={() => onRoomClick(room)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
