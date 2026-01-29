import { Radio, Search, Bell, Flame, Swords, Headphones, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

const categories = [
  { id: "all", label: "All", icon: Flame },
  { id: "pk", label: "PK Battles", icon: Swords },
  { id: "audio", label: "Audio Rooms", icon: Headphones },
  { id: "following", label: "Following", icon: Users },
];

const mockStreams = [
  { id: 1, title: "Late Night Vibes 🌙", host: "Sarah M.", viewers: 1243, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop", isLive: true, isPK: false },
  { id: 2, title: "Music & Chill", host: "DJ Alex", viewers: 892, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop", isLive: true, isPK: true },
  { id: 3, title: "Cooking Stream 🍳", host: "Chef Mike", viewers: 567, thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=600&fit=crop", isLive: true, isPK: false },
  { id: 4, title: "Gaming Night", host: "ProGamer", viewers: 2341, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop", isLive: true, isPK: false },
  { id: 5, title: "Dance Party 💃", host: "Luna Dance", viewers: 1567, thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=600&fit=crop", isLive: true, isPK: true },
  { id: 6, title: "Art Stream", host: "Creative K", viewers: 432, thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=600&fit=crop", isLive: true, isPK: false },
];

export default function Live() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Radio className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold">Live</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-stream-coral" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 hide-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Stream Grid */}
      <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 lg:grid-cols-4">
        {mockStreams.map((stream) => (
          <div
            key={stream.id}
            className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted cursor-pointer"
          >
            <img
              src={stream.thumbnail}
              alt={stream.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Live badge */}
            <div className="absolute left-2 top-2 flex items-center gap-1">
              <Badge className="bg-stream-live text-white border-0 px-2 py-0.5 text-2xs font-semibold">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </Badge>
              {stream.isPK && (
                <Badge className="bg-stream-gold text-black border-0 px-2 py-0.5 text-2xs font-semibold">
                  <Swords className="mr-1 h-3 w-3" />
                  PK
                </Badge>
              )}
            </div>

            {/* Viewer count */}
            <div className="absolute right-2 top-2">
              <Badge variant="secondary" className="bg-black/50 text-white border-0 text-2xs">
                <Users className="mr-1 h-3 w-3" />
                {stream.viewers.toLocaleString()}
              </Badge>
            </div>

            {/* Stream info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="line-clamp-1 text-sm font-semibold text-white">
                {stream.title}
              </p>
              <p className="text-xs text-white/70">{stream.host}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Go Live FAB */}
      <Button
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-gradient-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
        size="icon"
      >
        <Radio className="h-6 w-6" />
      </Button>
    </div>
  );
}
