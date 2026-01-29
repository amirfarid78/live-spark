import React from "react";
import { PartyRoomCard, PartyRoom } from "./PartyRoomCard";
import { Sparkles, Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartyRoomListProps {
  rooms: PartyRoom[];
  onRoomClick: (room: PartyRoom) => void;
}

const regionFilters = [
  { id: "all", label: "All", flagUrl: "https://flagcdn.com/w40/un.png", color: "from-blue-400 to-cyan-400" },
  { id: "us", label: "United States", flagUrl: "https://flagcdn.com/w40/us.png", color: "from-blue-500 to-red-500" },
  { id: "pk", label: "Pakistan", flagUrl: "https://flagcdn.com/w40/pk.png", color: "from-green-500 to-green-600" },
  { id: "in", label: "India", flagUrl: "https://flagcdn.com/w40/in.png", color: "from-orange-400 to-green-500" },
  { id: "af", label: "Afghanistan", flagUrl: "https://flagcdn.com/w40/af.png", color: "from-black to-red-600" },
  { id: "uk", label: "UK", flagUrl: "https://flagcdn.com/w40/gb.png", color: "from-blue-600 to-red-600" },
  { id: "ae", label: "UAE", flagUrl: "https://flagcdn.com/w40/ae.png", color: "from-green-500 to-red-500" },
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
      {/* Region Filters with Flag Icons */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
        {regionFilters.map((region, index) => (
          <button
            key={region.id}
            onClick={() => setActiveRegion(region.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all press-effect",
              "border shadow-md animate-fade-in-up",
              activeRegion === region.id
                ? `bg-gradient-to-r ${region.color} text-white border-transparent shadow-lg`
                : "bg-white dark:bg-secondary border-border/50 hover:shadow-lg hover:scale-105"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Flag image with circular background */}
            <span className={cn(
              "flex items-center justify-center h-7 w-7 rounded-full overflow-hidden shadow-sm ring-1",
              activeRegion === region.id 
                ? "bg-white/20 ring-white/30" 
                : "bg-white ring-border/50"
            )}>
              <img 
                src={region.flagUrl} 
                alt={region.label}
                className="h-5 w-5 object-cover rounded-sm"
              />
            </span>
            <span className={cn(
              activeRegion === region.id ? "text-white" : "text-foreground"
            )}>
              {region.label}
            </span>
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
