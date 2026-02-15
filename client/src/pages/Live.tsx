import { useState } from "react";
import { Radio, Search, Bell, Flame, Swords, Headphones, Users, ChevronRight, Play, Mic2, Plus, TrendingUp, Crown, Star, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LiveRoomViewer } from "@/components/live/LiveRoomViewer";
import { GoLiveSheet } from "@/components/live/GoLiveSheet";
import { PartyRoom } from "@/components/party/PartyRoomCard";
import { PartyRoomList } from "@/components/party/PartyRoomList";
import { PartyRoomViewer } from "@/components/party/PartyRoomViewer";
import { CreatePartySheet, PartySettings } from "@/components/party/CreatePartySheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { PKBattleList, PKBattleLiveRoom, PKBattle } from "@/components/pk";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

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

interface MappedStream {
  id: number;
  title: string;
  host: string;
  hostAvatar: string;
  viewers: number;
  thumbnail: string;
  isLive: boolean;
  isPK: boolean;
  category: string;
}

interface FeaturedStreamer {
  id: number;
  name: string;
  avatar: string;
  isLive: boolean;
  viewers: number;
}

function FeaturedStreamersSkeleton({ count, size }: { count: number; size: "sm" | "lg" }) {
  const h = size === "lg" ? "h-20 w-20" : "h-16 w-16";
  const textW = size === "lg" ? "w-14" : "w-12";
  return (
    <div className={cn("flex pb-2", size === "lg" ? "gap-6" : "gap-4")}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className={cn(h, "rounded-full")} />
          <Skeleton className={cn("h-3", textW)} />
        </div>
      ))}
    </div>
  );
}

function StreamGridSkeleton({ count, className }: { count: number; className: string }) {
  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyStreams() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Radio className="h-12 w-12 mb-4 opacity-50" />
      <p className="text-lg font-medium">No live streams right now</p>
      <p className="text-sm">Check back later or go live yourself!</p>
    </div>
  );
}

function EmptyPartyRooms() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Mic2 className="h-12 w-12 mb-4 opacity-50" />
      <p className="text-lg font-medium">No party rooms active</p>
      <p className="text-sm">Be the first to create one!</p>
    </div>
  );
}

function StreamCard({ stream, onClick, className }: { stream: MappedStream; onClick: () => void; className?: string }) {
  return (
    <div
      onClick={onClick}
      className={cn("group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted cursor-pointer", className)}
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
        <p className="line-clamp-1 text-sm font-semibold text-white mb-0.5">{stream.title}</p>
        <p className="text-xs text-white/70">{stream.host}</p>
      </div>
    </div>
  );
}

export default function Live() {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSidebarItem, setActiveSidebarItem] = useState("home");
  const [selectedStream, setSelectedStream] = useState<MappedStream | null>(null);
  const [selectedPartyRoom, setSelectedPartyRoom] = useState<PartyRoom | null>(null);
  const [selectedPKBattle, setSelectedPKBattle] = useState<PKBattle | null>(null);
  const [showGoLive, setShowGoLive] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);

  const { data: featuredStreamers = [], isLoading: isFeaturedLoading } = useQuery<FeaturedStreamer[]>({
    queryKey: ['/api/live/featured'],
    queryFn: async () => {
      const res = await api.get('/live/featured');
      return (res.data || []).map((s: any) => ({
        id: s.id,
        name: s.host?.displayName || s.host?.username || 'Unknown',
        avatar: s.host?.avatarUrl || '',
        isLive: s.status === 'live',
        viewers: s.viewerCount || 0,
      }));
    },
  });

  const categoryParam = activeCategory !== 'all' && activeCategory !== 'pk' && activeCategory !== 'party' && activeCategory !== 'audio' ? activeCategory : undefined;

  const { data: streams = [], isLoading: isStreamsLoading } = useQuery<MappedStream[]>({
    queryKey: ['/api/live/streams', categoryParam],
    queryFn: async () => {
      const params = categoryParam ? `?category=${categoryParam}` : '';
      const res = await api.get(`/live/streams${params}`);
      return (res.data || []).map((s: any) => ({
        id: s.id,
        title: s.title || '',
        host: s.host?.displayName || s.host?.username || 'Unknown',
        hostAvatar: s.host?.avatarUrl || '',
        viewers: s.viewerCount || 0,
        thumbnail: s.thumbnailUrl || '',
        isLive: s.status === 'live',
        isPK: s.isPK || false,
        category: s.category || '',
      }));
    },
  });

  const { data: partyRooms = [], isLoading: isPartyLoading } = useQuery<PartyRoom[]>({
    queryKey: ['/api/party-rooms'],
    queryFn: async () => {
      const res = await api.get('/party-rooms');
      return (res.data || []).map((r: any) => ({
        id: String(r.id),
        name: r.name || '',
        hostName: r.host?.displayName || r.host?.username || 'Unknown',
        hostAvatar: r.host?.avatarUrl || '',
        viewerCount: r.viewerCount || 0,
        speakerCount: r.speakerCount || 0,
        maxSpeakers: r.maxSpeakers || 8,
        isPrivate: r.isPrivate || false,
        isLive: true,
        category: r.category || '',
        tags: r.tags || [],
      }));
    },
  });

  const handleStreamClick = (stream: MappedStream) => {
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

  const renderFeaturedStreamers = (size: "sm" | "lg") => {
    const avatarSize = size === "lg" ? "h-20 w-20" : "h-16 w-16";
    const gapSize = size === "lg" ? "gap-6" : "gap-4";
    const nameClass = size === "lg" ? "text-sm font-medium" : "text-xs font-medium truncate max-w-[64px]";

    if (isFeaturedLoading) {
      return <FeaturedStreamersSkeleton count={size === "lg" ? 7 : 5} size={size} />;
    }

    if (featuredStreamers.length === 0) {
      return (
        <div className={cn("flex items-center justify-center text-muted-foreground", size === "lg" ? "py-8" : "py-6")}>
          <p className={size === "lg" ? "text-sm" : "text-xs"}>No featured streamers right now</p>
        </div>
      );
    }

    return (
      <div className={cn("flex overflow-x-auto hide-scrollbar pb-2", gapSize)}>
        {featuredStreamers.map((streamer, index) => (
          <div
            key={streamer.id}
            className={cn(
              "flex flex-col items-center gap-2 cursor-pointer group",
              size === "sm" && cn("animate-fade-in-up", `stagger-${index + 1}`)
            )}
          >
            <div className="relative">
              <Avatar className={cn(
                avatarSize,
                "ring-offset-2 ring-offset-background transition-all",
                size === "lg" ? "ring-3 group-hover:scale-105" : "ring-2",
                streamer.isLive ? (size === "lg" ? "ring-stream-live" : "ring-stream-live ring-pulse") : "ring-border"
              )}>
                <AvatarImage src={streamer.avatar} />
                <AvatarFallback>{streamer.name[0]}</AvatarFallback>
              </Avatar>
              {streamer.isLive && (
                <span className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-stream-live font-bold text-white shadow-lg",
                  size === "lg" ? "px-3 py-0.5 text-[11px]" : "px-2 py-0.5 text-[10px]"
                )}>
                  LIVE
                </span>
              )}
            </div>
            <span className={nameClass}>{streamer.name}</span>
            {size === "lg" && streamer.isLive && (
              <span className="text-[11px] text-muted-foreground">{streamer.viewers.toLocaleString()} viewers</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDesktopPartyContent = () => {
    if (isPartyLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      );
    }
    if (partyRooms.length === 0) {
      return <EmptyPartyRooms />;
    }
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PartyRoomList rooms={partyRooms} onRoomClick={handlePartyRoomClick} />
      </div>
    );
  };

  const renderDesktopStreamContent = () => {
    if (isStreamsLoading) {
      return <StreamGridSkeleton count={8} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" />;
    }
    if (streams.length === 0) {
      return <EmptyStreams />;
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {streams.map((stream) => (
          <StreamCard
            key={stream.id}
            stream={stream}
            onClick={() => handleStreamClick(stream)}
            className="transition-all hover:scale-[1.02] hover:shadow-xl"
          />
        ))}
      </div>
    );
  };

  const renderMobilePartyContent = () => {
    if (isPartyLoading) {
      return (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      );
    }
    if (partyRooms.length === 0) {
      return <EmptyPartyRooms />;
    }
    return <PartyRoomList rooms={partyRooms} onRoomClick={handlePartyRoomClick} />;
  };

  const renderMobileStreamContent = () => {
    if (isStreamsLoading) {
      return <StreamGridSkeleton count={6} className="grid grid-cols-2 gap-3 px-4 pb-24" />;
    }
    if (streams.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 pb-24 text-muted-foreground">
          <Radio className="h-10 w-10 mb-3 opacity-50" />
          <p className="text-sm font-medium">No live streams right now</p>
          <p className="text-xs">Check back later!</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-3 px-4 pb-24">
        {streams.map((stream, index) => (
          <StreamCard
            key={stream.id}
            stream={stream}
            onClick={() => handleStreamClick(stream)}
            className={cn("card-hover animate-fade-in-up", `stagger-${(index % 6) + 1}`)}
          />
        ))}
      </div>
    );
  };

  const renderModals = () => (
    <>
      {selectedStream && (
        <LiveRoomViewer
          streamId={selectedStream.id.toString()}
          hostName={selectedStream.host}
          hostAvatar={selectedStream.hostAvatar}
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
    </>
  );

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {renderModals()}

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 glass border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search streams, hosts, or rooms..."
                    className="pl-10 h-11 bg-secondary/50 border-border/50 rounded-xl"
                  />
                </div>
              </div>

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

          <div className="p-6">
            {showPKBattles ? (
              <>
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
                <div className="relative">
                  <PKBattleList
                    onBattleClick={handlePKBattleClick}
                    onJoinBattle={() => setShowGoLive(true)}
                  />
                </div>
              </>
            ) : showPartyRooms ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Party Rooms</h2>
                    <p className="text-sm text-muted-foreground">{partyRooms.length} rooms active</p>
                  </div>
                  <Button
                    onClick={() => setShowCreateParty(true)}
                    className="bg-gradient-primary text-white h-11 px-6 gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Create Room
                  </Button>
                </div>
                {renderDesktopPartyContent()}
              </>
            ) : (
              <>
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Featured Streamers</h2>
                    <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                      See all <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  {renderFeaturedStreamers("lg")}
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-4">Live Now</h2>
                  {renderDesktopStreamContent()}
                </section>
              </>
            )}
          </div>
        </main>

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
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
              <p className="text-xs text-muted-foreground">{partyRooms.length} rooms active</p>
            </div>
            <Button
              onClick={() => setShowCreateParty(true)}
              className="bg-gradient-primary text-white h-9 px-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
          {renderMobilePartyContent()}
        </div>
      ) : (
        <>
          <section className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Featured</h2>
              <button className="text-xs text-primary font-medium flex items-center gap-1 press-effect">
                See all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {renderFeaturedStreamers("sm")}
          </section>

          {renderMobileStreamContent()}
        </>
      )}

      {!showPKBattles && (
        <button
          onClick={() => showPartyRooms ? setShowCreateParty(true) : setShowGoLive(true)}
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-gradient-live shadow-xl shadow-stream-live/30 flex items-center justify-center press-effect z-30"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-live animate-pulse opacity-50" />
          {showPartyRooms ? <Mic2 className="h-6 w-6 text-white relative z-10" /> : <Radio className="h-6 w-6 text-white relative z-10" />}
        </button>
      )}

      {renderModals()}
    </div>
  );
}
