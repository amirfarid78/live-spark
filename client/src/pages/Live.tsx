import React, { useState } from "react";
import { Radio, Search, Bell, Flame, Swords, Headphones, Users, ChevronRight, Play, Mic2, Plus, TrendingUp, Crown, Star, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LiveRoomViewer } from "@/components/live/LiveRoomViewer";
import { GoLiveSheet } from "@/components/live/GoLiveSheet";
import { PartyRoom } from "@/components/party/PartyRoomCard";
import { PartyRoomList } from "@/components/party/PartyRoomList";
import { PartyRoomViewer } from "@/components/party/PartyRoomViewer";
import { CreatePartySheet, PartySettings } from "@/components/party/CreatePartySheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { PKBattleList, PKBattleLiveRoom, PKBattle } from "@/components/pk";

const categories = [
  { id: "all", label: "All", icon: Flame },
  { id: "pk", label: "PK Battles", icon: Swords },
  { id: "party", label: "Party", icon: Mic2 },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "following", label: "Following", icon: Users },
];

const sidebarNavItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "top", label: "Top Hosts", icon: Crown },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

const featuredStreamers = [
  { id: 1, name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", isLive: true, viewers: 1243 },
  { id: 2, name: "Alex", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", isLive: true, viewers: 892 },
  { id: 3, name: "Luna", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", isLive: false, viewers: 0 },
  { id: 4, name: "Mike", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100", isLive: true, viewers: 567 },
  { id: 5, name: "Jade", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", isLive: true, viewers: 2341 },
  { id: 6, name: "Emma", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100", isLive: true, viewers: 1892 },
  { id: 7, name: "Chris", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", isLive: true, viewers: 756 },
];

const mockStreams = [
  { id: 1, title: "Late Night Vibes 🌙", host: "Sarah M.", viewers: 1243, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Music" },
  { id: 2, title: "Music & Chill", host: "DJ Alex", viewers: 892, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop", isLive: true, isPK: true, category: "DJ" },
  { id: 3, title: "Cooking Stream 🍳", host: "Chef Mike", viewers: 567, thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Food" },
  { id: 4, title: "Gaming Night", host: "ProGamer", viewers: 2341, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Gaming" },
  { id: 5, title: "Dance Party 💃", host: "Luna Dance", viewers: 1567, thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=600&fit=crop", isLive: true, isPK: true, category: "Dance" },
  { id: 6, title: "Art Stream", host: "Creative K", viewers: 432, thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Art" },
  { id: 7, title: "Talk Show", host: "Host Pro", viewers: 1123, thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Talk" },
  { id: 8, title: "Fitness Live", host: "FitGuru", viewers: 876, thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop", isLive: true, isPK: false, category: "Fitness" },
];

const mockPartyRooms: PartyRoom[] = [
  { id: "party-1", name: "🎭 Miss Anaya Khan 🎭", hostName: "Miss Anaya Khan", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", viewerCount: 168, speakerCount: 5, maxSpeakers: 8, isPrivate: false, isLive: true, category: "Chat", tags: ["chatting", "fun"], topViewers: ["https://i.pravatar.cc/40?u=1", "https://i.pravatar.cc/40?u=2", "https://i.pravatar.cc/40?u=3", "https://i.pravatar.cc/40?u=4"] },
  { id: "party-2", name: "👻 Saniya lieo Love 👻🌟", hostName: "Saniya lieo", hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", viewerCount: 148, speakerCount: 6, maxSpeakers: 8, isPrivate: false, isLive: true, category: "Dating", tags: ["couple", "dating"], topViewers: ["https://i.pravatar.cc/40?u=5", "https://i.pravatar.cc/40?u=6", "https://i.pravatar.cc/40?u=7"] },
  { id: "party-3", name: "💃 Mandeli Rao 🥳💃", hostName: "Mandeli Rao", hostAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", viewerCount: 263, speakerCount: 4, maxSpeakers: 6, isPrivate: false, isLive: true, category: "Music", tags: ["music", "party"], topViewers: ["https://i.pravatar.cc/40?u=8", "https://i.pravatar.cc/40?u=9", "https://i.pravatar.cc/40?u=10", "https://i.pravatar.cc/40?u=11"] },
  { id: "party-4", name: "🥳 Miss Pinky Pandey 🥳🥳", hostName: "Miss Pinky Pandey", hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", viewerCount: 426, speakerCount: 8, maxSpeakers: 12, isPrivate: false, isLive: true, category: "Chat", tags: ["new friends"], topViewers: ["https://i.pravatar.cc/40?u=12", "https://i.pravatar.cc/40?u=13", "https://i.pravatar.cc/40?u=14"] },
  { id: "party-5", name: "🥳 Miss Ninja Girl 🥳🥳🥳", hostName: "Miss Ninja Girl", hostAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100", viewerCount: 298, speakerCount: 3, maxSpeakers: 8, isPrivate: false, isLive: true, category: "Music", tags: ["music", "dance"], topViewers: ["https://i.pravatar.cc/40?u=15", "https://i.pravatar.cc/40?u=16", "https://i.pravatar.cc/40?u=17", "https://i.pravatar.cc/40?u=18"] },
  { id: "party-6", name: "🎤 Lady Andrew 🎤🎤", hostName: "Lady Andrew", hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", viewerCount: 368, speakerCount: 5, maxSpeakers: 8, isPrivate: false, isLive: true, category: "Talent", tags: ["local", "party"], topViewers: ["https://i.pravatar.cc/40?u=19", "https://i.pravatar.cc/40?u=20", "https://i.pravatar.cc/40?u=21"] },
];

export default function Live() {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSidebarItem, setActiveSidebarItem] = useState("home");
  const [selectedStream, setSelectedStream] = useState<typeof mockStreams[0] | null>(null);
  const [selectedPartyRoom, setSelectedPartyRoom] = useState<PartyRoom | null>(null);
  const [selectedPKBattle, setSelectedPKBattle] = useState<PKBattle | null>(null);
  const [showGoLive, setShowGoLive] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);

  const handleStreamClick = (stream: typeof mockStreams[0]) => {
    setSelectedStream(stream);
  };

  const handlePartyRoomClick = (room: PartyRoom) => {
    setSelectedPartyRoom(room);
  };

  const handleGoLive = (settings: any) => {
    console.log("Going live with settings:", settings);
    setShowGoLive(false);
  };

  const handleCreateParty = (settings: PartySettings) => {
    console.log("Creating party with settings:", settings);
    setShowCreateParty(false);
  };

  const handlePKBattleClick = (battle: PKBattle) => {
    setSelectedPKBattle(battle);
  };

  const showPartyRooms = activeCategory === "party" || activeCategory === "audio";
  const showPKBattles = activeCategory === "pk";

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Modals */}
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

        {selectedPartyRoom && (
          <PartyRoomViewer
            room={selectedPartyRoom}
            onClose={() => setSelectedPartyRoom(null)}
          />
        )}

        {showGoLive && (
          <GoLiveSheet
            onClose={() => setShowGoLive(false)}
            onGoLive={handleGoLive}
          />
        )}

        {showCreateParty && (
          <CreatePartySheet
            onClose={() => setShowCreateParty(false)}
            onCreate={handleCreateParty}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Desktop Header */}
          <header className="sticky top-0 z-40 glass border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search streams, hosts, or rooms..."
                    className="pl-10 h-11 bg-secondary/50 border-border/50 rounded-xl"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 ml-6">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-primary text-white shadow-lg shadow-primary/20"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-6">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                  <Bell className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20">
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6">
            {showPKBattles ? (
              <>
                {/* PK Battles Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Swords className="h-6 w-6 text-stream-gold" />
                      PK Battles
                    </h2>
                    <p className="text-sm text-muted-foreground">Watch live battles or join one!</p>
                  </div>
                  <Button
                    onClick={() => setShowGoLive(true)}
                    className="bg-gradient-to-r from-stream-coral to-stream-live text-white h-11 px-6 gap-2"
                  >
                    <Swords className="h-5 w-5" />
                    Start Battle
                  </Button>
                </div>

                {/* PK Battle List */}
                <div className="relative">
                  <PKBattleList 
                    onBattleClick={handlePKBattleClick}
                    onJoinBattle={() => setShowGoLive(true)}
                  />
                </div>
              </>
            ) : showPartyRooms ? (
              <>
                {/* Party Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Party Rooms</h2>
                    <p className="text-sm text-muted-foreground">{mockPartyRooms.length} rooms active</p>
                  </div>
                  <Button
                    onClick={() => setShowCreateParty(true)}
                    className="bg-gradient-primary text-white h-11 px-6 gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Create Room
                  </Button>
                </div>

                {/* Desktop Party Grid - 2 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PartyRoomList 
                    rooms={mockPartyRooms} 
                    onRoomClick={handlePartyRoomClick}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Featured Streamers - Desktop */}
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Featured Streamers</h2>
                    <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                      See all <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-2">
                    {featuredStreamers.map((streamer, index) => (
                      <div 
                        key={streamer.id} 
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div className="relative">
                          <Avatar className={cn(
                            "h-20 w-20 ring-3 ring-offset-2 ring-offset-background transition-all group-hover:scale-105",
                            streamer.isLive ? "ring-stream-live" : "ring-border"
                          )}>
                            <AvatarImage src={streamer.avatar} />
                            <AvatarFallback>{streamer.name[0]}</AvatarFallback>
                          </Avatar>
                          {streamer.isLive && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-stream-live px-3 py-0.5 text-[11px] font-bold text-white shadow-lg">
                              LIVE
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium">{streamer.name}</span>
                        {streamer.isLive && (
                          <span className="text-[11px] text-muted-foreground">{streamer.viewers.toLocaleString()} viewers</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Stream Grid - Desktop 4 columns */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">Live Now</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {mockStreams.map((stream) => (
                      <div
                        key={stream.id}
                        onClick={() => handleStreamClick(stream)}
                        className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
                      >
                        <img
                          src={stream.thumbnail}
                          alt={stream.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="h-7 w-7 text-white fill-white ml-1" />
                          </div>
                        </div>
                        
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

                        <div className="absolute right-2 top-2">
                          <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px] backdrop-blur-sm">
                            {stream.category}
                          </Badge>
                        </div>

                        <div className="absolute left-2 bottom-14">
                          <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px] backdrop-blur-sm">
                            <Users className="mr-1 h-3 w-3" />
                            {stream.viewers.toLocaleString()}
                          </Badge>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="line-clamp-1 text-sm font-semibold text-white mb-0.5">
                            {stream.title}
                          </p>
                          <p className="text-xs text-white/70">{stream.host}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar - Chat/Activity */}
        <aside className="hidden xl:flex flex-col w-80 border-l border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 h-screen">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold">Activity Feed</h3>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://i.pravatar.cc/40?u=${i + 100}`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">User{i + 1}</span>
                    <span className="text-muted-foreground"> started watching </span>
                    <span className="font-medium text-primary">Stream {i + 1}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{i + 1}m ago</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Modals */}
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

        {selectedPartyRoom && (
          <PartyRoomViewer
            room={selectedPartyRoom}
            onClose={() => setSelectedPartyRoom(null)}
          />
        )}

        {selectedPKBattle && (
          <PKBattleLiveRoom
            battle={selectedPKBattle}
            onClose={() => setSelectedPKBattle(null)}
          />
        )}

        {showGoLive && (
          <GoLiveSheet
            onClose={() => setShowGoLive(false)}
            onGoLive={handleGoLive}
          />
        )}

        {showCreateParty && (
          <CreatePartySheet
            onClose={() => setShowCreateParty(false)}
            onCreate={handleCreateParty}
          />
        )}
      </div>
    );
  }

  // Mobile Layout (existing)
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

      {/* PK Battles Section */}
      {showPKBattles ? (
        <div className="relative flex-1 pb-24">
          <PKBattleList 
            onBattleClick={handlePKBattleClick}
            onJoinBattle={() => setShowGoLive(true)}
          />
        </div>
      ) : showPartyRooms ? (
        <div className="px-4 py-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Party Rooms</h2>
              <p className="text-xs text-muted-foreground">{mockPartyRooms.length} rooms active</p>
            </div>
            <Button
              onClick={() => setShowCreateParty(true)}
              className="bg-gradient-primary text-white h-9 px-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
          <PartyRoomList rooms={mockPartyRooms} onRoomClick={handlePartyRoomClick} />
        </div>
      ) : (
        <>
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
                <div key={streamer.id} className={cn("flex flex-col items-center gap-2 animate-fade-in-up", `stagger-${index + 1}`)}>
                  <div className="relative">
                    <Avatar className={cn("h-16 w-16 ring-2 ring-offset-2 ring-offset-background transition-all", streamer.isLive ? "ring-stream-live ring-pulse" : "ring-border")}>
                      <AvatarImage src={streamer.avatar} />
                      <AvatarFallback>{streamer.name[0]}</AvatarFallback>
                    </Avatar>
                    {streamer.isLive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-stream-live px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">LIVE</span>
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
                className={cn("group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted cursor-pointer card-hover animate-fade-in-up", `stagger-${(index % 6) + 1}`)}
              >
                <img src={stream.thumbnail} alt={stream.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-7 w-7 text-white fill-white ml-1" />
                  </div>
                </div>
                <div className="absolute left-2 top-2 flex items-center gap-1.5">
                  <Badge className="bg-stream-live text-white border-0 px-2 py-0.5 text-[10px] font-bold shadow-lg">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />LIVE
                  </Badge>
                  {stream.isPK && (
                    <Badge className="bg-gradient-gold text-black border-0 px-2 py-0.5 text-[10px] font-bold shadow-lg">
                      <Swords className="mr-1 h-3 w-3" />PK
                    </Badge>
                  )}
                </div>
                <div className="absolute right-2 top-2">
                  <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px] backdrop-blur-sm">{stream.category}</Badge>
                </div>
                <div className="absolute left-2 bottom-14">
                  <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px] backdrop-blur-sm">
                    <Users className="mr-1 h-3 w-3" />{stream.viewers.toLocaleString()}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-white mb-0.5">{stream.title}</p>
                  <p className="text-xs text-white/70">{stream.host}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Go Live FAB */}
      {!showPKBattles && (
        <button
          onClick={() => showPartyRooms ? setShowCreateParty(true) : setShowGoLive(true)}
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-gradient-live shadow-xl shadow-stream-live/30 flex items-center justify-center press-effect z-30"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-live animate-pulse opacity-50" />
          {showPartyRooms ? <Mic2 className="h-6 w-6 text-white relative z-10" /> : <Radio className="h-6 w-6 text-white relative z-10" />}
        </button>
      )}

      {/* Modals */}
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

      {selectedPartyRoom && (
        <PartyRoomViewer room={selectedPartyRoom} onClose={() => setSelectedPartyRoom(null)} />
      )}

      {selectedPKBattle && (
        <PKBattleLiveRoom
          battle={selectedPKBattle}
          onClose={() => setSelectedPKBattle(null)}
        />
      )}

      {showGoLive && (
        <GoLiveSheet onClose={() => setShowGoLive(false)} onGoLive={handleGoLive} />
      )}

      {showCreateParty && (
        <CreatePartySheet onClose={() => setShowCreateParty(false)} onCreate={handleCreateParty} />
      )}
    </div>
  );
}
