import React, { useState } from "react";
import { Radio, Search, Bell, Flame, Swords, Headphones, Users, ChevronRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LiveRoomViewer } from "@/components/live/LiveRoomViewer";
import { GoLiveSheet } from "@/components/live/GoLiveSheet";

const categories = [
  { id: "all", label: "All", icon: Flame },
  { id: "pk", label: "PK Battles", icon: Swords },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "following", label: "Following", icon: Users },
];

const featuredStreamers = [
  { id: 1, name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", isLive: true, viewers: 1243 },
  { id: 2, name: "Alex", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", isLive: true, viewers: 892 },
  { id: 3, name: "Luna", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", isLive: false, viewers: 0 },
  { id: 4, name: "Mike", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100", isLive: true, viewers: 567 },
  { id: 5, name: "Jade", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", isLive: true, viewers: 2341 },
];

const mockStreams = [
  { id: 1, title: "Late Night Vibes 🌙", host: "Sarah M.", viewers: 1243, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Music" },
  { id: 2, title: "Music & Chill", host: "DJ Alex", viewers: 892, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop", isLive: true, isPK: true, category: "DJ" },
  { id: 3, title: "Cooking Stream 🍳", host: "Chef Mike", viewers: 567, thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Food" },
  { id: 4, title: "Gaming Night", host: "ProGamer", viewers: 2341, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Gaming" },
  { id: 5, title: "Dance Party 💃", host: "Luna Dance", viewers: 1567, thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=600&fit=crop", isLive: true, isPK: true, category: "Dance" },
  { id: 6, title: "Art Stream", host: "Creative K", viewers: 432, thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Art" },
];

export default function Live() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedStream, setSelectedStream] = useState<typeof mockStreams[0] | null>(null);
  const [showGoLive, setShowGoLive] = useState(false);

  const handleStreamClick = (stream: typeof mockStreams[0]) => {
    setSelectedStream(stream);
  };

  const handleGoLive = (settings: any) => {
    console.log("Going live with settings:", settings);
    setShowGoLive(false);
    // In production, this would connect to Agora.io
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg shadow-primary/30">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Live</h1>
              <p className="text-xs text-muted-foreground">1,234 streaming now</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl press-effect">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-stream-coral ring-2 ring-background" />
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
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all press-effect",
                  isActive
                    ? "bg-gradient-primary text-white shadow-lg shadow-primary/30"
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

      {/* Featured Streamers */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Featured</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1 press-effect">
            See all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {featuredStreamers.map((streamer, index) => (
            <div 
              key={streamer.id} 
              className={cn(
                "flex flex-col items-center gap-2 animate-fade-in-up",
                `stagger-${index + 1}`
              )}
            >
              <div className="relative">
                <Avatar className={cn(
                  "h-16 w-16 ring-2 ring-offset-2 ring-offset-background transition-all",
                  streamer.isLive ? "ring-stream-live ring-pulse" : "ring-border"
                )}>
                  <AvatarImage src={streamer.avatar} />
                  <AvatarFallback>{streamer.name[0]}</AvatarFallback>
                </Avatar>
                {streamer.isLive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-stream-live px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    LIVE
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-[64px]">{streamer.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stream Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-24">
        {mockStreams.map((stream, index) => (
          <div
            key={stream.id}
            onClick={() => handleStreamClick(stream)}
            className={cn(
              "group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted cursor-pointer card-hover animate-fade-in-up",
              `stagger-${(index % 6) + 1}`
            )}
          >
            <img
              src={stream.thumbnail}
              alt={stream.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-7 w-7 text-white fill-white ml-1" />
              </div>
            </div>
            
            {/* Live badge */}
            <div className="absolute left-2 top-2 flex items-center gap-1.5">
              <Badge className="bg-stream-live text-white border-0 px-2 py-0.5 text-[10px] font-bold shadow-lg">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </Badge>
              {stream.isPK && (
                <Badge className="bg-gradient-gold text-black border-0 px-2 py-0.5 text-[10px] font-bold shadow-lg">
                  <Swords className="mr-1 h-3 w-3" />
                  PK
                </Badge>
              )}
            </div>

            {/* Category tag */}
            <div className="absolute right-2 top-2">
              <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px] backdrop-blur-sm">
                {stream.category}
              </Badge>
            </div>

            {/* Viewer count */}
            <div className="absolute left-2 bottom-14">
              <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px] backdrop-blur-sm">
                <Users className="mr-1 h-3 w-3" />
                {stream.viewers.toLocaleString()}
              </Badge>
            </div>

            {/* Stream info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="line-clamp-1 text-sm font-semibold text-white mb-0.5">
                {stream.title}
              </p>
              <p className="text-xs text-white/70">{stream.host}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Go Live FAB */}
      <button
        onClick={() => setShowGoLive(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-gradient-live shadow-xl shadow-stream-live/30 flex items-center justify-center press-effect z-30"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-live animate-pulse opacity-50" />
        <Radio className="h-6 w-6 text-white relative z-10" />
      </button>

      {/* Live Room Viewer */}
      {selectedStream && (
        <LiveRoomViewer
          streamId={selectedStream.id.toString()}
          hostName={selectedStream.host}
          hostAvatar={featuredStreamers.find(s => s.name === selectedStream.host.split(" ")[0])?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"}
          viewerCount={selectedStream.viewers}
          thumbnail={selectedStream.thumbnail}
          onClose={() => setSelectedStream(null)}
        />
      )}

      {/* Go Live Sheet */}
      {showGoLive && (
        <GoLiveSheet
          onClose={() => setShowGoLive(false)}
          onGoLive={handleGoLive}
        />
      )}
    </div>
  );
}
