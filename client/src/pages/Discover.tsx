import { Search, TrendingUp, Music, Gamepad2, Palette, Flame, Play, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import api from "@/lib/api";

const categories = [
  { id: "trending", label: "Trending", icon: Flame, gradient: "from-orange-500 to-red-500" },
  { id: "music", label: "Music", icon: Music, gradient: "from-purple-500 to-pink-500" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, gradient: "from-green-500 to-emerald-500" },
  { id: "art", label: "Art", icon: Palette, gradient: "from-pink-500 to-rose-500" },
];

const gradientColors = [
  "from-pink-500 to-rose-500",
  "from-purple-500 to-violet-500",
  "from-yellow-500 to-amber-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-500",
  "from-blue-500 to-cyan-500",
];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function Discover() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<number>>(new Set());
  const [pendingFollows, setPendingFollows] = useState<Set<number>>(new Set());

  const { data: hashtagsData, isLoading: hashtagsLoading } = useQuery({
    queryKey: ["/api/hashtags/trending"],
    queryFn: async () => {
      const res = await api.get("/hashtags/trending");
      return res.data;
    },
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users/suggested"],
    queryFn: async () => {
      const res = await api.get("/users/suggested");
      return res.data;
    },
  });

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos/trending"],
    queryFn: async () => {
      const res = await api.get("/videos/trending");
      return res.data;
    },
  });

  const followMutation = useMutation({
    mutationFn: async ({ userId, isFollowed }: { userId: number; isFollowed: boolean }) => {
      setPendingFollows(prev => new Set(prev).add(userId));
      if (isFollowed) {
        await api.delete(`/users/${userId}/follow`);
      } else {
        await api.post(`/users/${userId}/follow`);
      }
    },
    onSuccess: (_, { userId, isFollowed }) => {
      setFollowedUsers((prev) => {
        const next = new Set(prev);
        if (isFollowed) {
          next.delete(userId);
        } else {
          next.add(userId);
        }
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/suggested"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update follow status");
    },
    onSettled: (_, __, { userId }) => {
      setPendingFollows(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    },
  });

  const handleFollowToggle = (userId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isFollowed = followedUsers.has(userId);
    followMutation.mutate({ userId, isFollowed });
  };

  const trendingHashtags = (hashtagsData || []).map((h: any, i: number) => ({
    tag: h.name || h.displayName,
    count: formatNumber(h.viewCount || h.usageCount || 0),
    color: gradientColors[i % gradientColors.length],
  }));

  const suggestedUsers = (usersData || []).map((u: any) => ({
    id: u.id,
    name: u.displayName || u.username,
    username: `@${u.username}`,
    avatar: u.avatarUrl || "",
    followers: formatNumber(u.followersCount || 0),
    isVerified: u.isVerified || false,
    isLive: u.isOnline || false,
  }));

  const trendingVideos = (videosData || []).map((v: any) => ({
    id: v.id,
    thumbnail: v.thumbnailUrl || "",
    views: formatNumber(v.viewsCount || 0),
    creator: v.user?.username || "",
  }));

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center gap-6 px-6 py-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Discover</h1>
              <p className="text-sm text-muted-foreground">Find trending content and creators</p>
            </div>
            
            <div className={cn(
              "relative w-96 transition-all duration-200",
              searchFocused && "w-[500px]"
            )}>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search creators, hashtags, sounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="pl-12 h-12 bg-secondary/80 border-0 rounded-xl text-base font-medium placeholder:text-muted-foreground/70"
              />
            </div>
          </div>
        </header>

        <div className="p-6">
          <section className="mb-8">
            <div className="flex gap-4">
              {categories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-6 py-4 transition-all press-effect bg-gradient-to-r text-white shadow-lg hover:scale-105 animate-fade-in-up",
                      cat.gradient,
                      `stagger-${index + 1}`
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-base font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trending Hashtags
                  </h2>
                  <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                    See all <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hashtagsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-28 rounded-full" />
                    ))
                  ) : trendingHashtags.length === 0 ? (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-hashtags">No trending hashtags yet</p>
                  ) : (
                    trendingHashtags.map((item: any, index: number) => (
                      <button
                        key={item.tag}
                        data-testid={`button-hashtag-${item.tag}`}
                        className={cn(
                          "flex items-center gap-2 rounded-full bg-secondary/80 px-5 py-3 transition-all press-effect hover:bg-secondary animate-fade-in-up",
                          `stagger-${index + 1}`
                        )}
                      >
                        <span className={cn("h-3 w-3 rounded-full bg-gradient-to-r", item.color)} />
                        <span className="text-sm font-semibold">#{item.tag}</span>
                        <span className="text-xs text-muted-foreground">{item.count}</span>
                      </button>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-4">Trending Videos</h2>
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                  {videosLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                    ))
                  ) : trendingVideos.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-full" data-testid="text-no-videos">No trending videos yet</p>
                  ) : (
                    trendingVideos.map((video: any, index: number) => (
                      <Link
                        to="/"
                        key={video.id}
                        data-testid={`link-video-${video.id}`}
                        className={cn(
                          "group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted cursor-pointer animate-fade-in-up",
                          `stagger-${(index % 6) + 1}`
                        )}
                      >
                        <img
                          src={video.thumbnail}
                          alt="Video thumbnail"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="h-6 w-6 text-white ml-1" fill="white" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
                          <Play className="h-3.5 w-3.5" fill="white" />
                          <span className="text-xs font-semibold">{video.views}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="xl:col-span-1">
              <div className="sticky top-24">
                <section className="bg-card/50 rounded-2xl p-5 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Suggested Accounts</h2>
                    <button className="text-sm text-primary font-medium hover:underline">
                      See all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {usersLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <Skeleton className="h-14 w-14 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-9 w-20 rounded-lg" />
                        </div>
                      ))
                    ) : suggestedUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground" data-testid="text-no-users">No suggested accounts yet</p>
                    ) : (
                      suggestedUsers.map((user: any, index: number) => (
                        <div
                          key={user.id}
                          data-testid={`card-user-${user.id}`}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer animate-fade-in-up",
                            `stagger-${index + 1}`
                          )}
                        >
                          <div className="relative">
                            <Avatar className={cn(
                              "h-14 w-14 ring-2 ring-offset-2 ring-offset-background",
                              user.isLive ? "ring-stream-live" : "ring-transparent"
                            )}>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            {user.isLive && (
                              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-stream-live px-2 py-0.5 text-[9px] font-bold text-white shadow-lg">
                                LIVE
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[15px] truncate">{user.name}</span>
                              {user.isVerified && (
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary shrink-0">
                                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.followers} followers</p>
                          </div>
                          <Button
                            size="sm"
                            data-testid={`button-follow-${user.id}`}
                            onClick={() => handleFollowToggle(user.id)}
                            disabled={pendingFollows.has(user.id)}
                            variant={followedUsers.has(user.id) ? "outline" : "default"}
                            className={cn(
                              "rounded-lg font-semibold h-9 px-5",
                              followedUsers.has(user.id)
                                ? "border-stream-coral text-stream-coral"
                                : "bg-stream-coral hover:bg-stream-coral/90 text-white"
                            )}
                          >
                            {pendingFollows.has(user.id) ? "..." : followedUsers.has(user.id) ? "Following" : "Follow"}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/30">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Discover</h1>
          
          <div className={cn(
            "relative transition-all duration-200",
            searchFocused && "scale-[1.02]"
          )}>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-12 h-12 bg-secondary/80 border-0 rounded-2xl text-base font-medium placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 pb-24 overflow-y-auto">
        <section className="px-4 pt-5 pb-2">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl px-5 py-3 transition-all press-effect whitespace-nowrap animate-fade-in-up bg-gradient-to-r text-white shadow-lg",
                    cat.gradient,
                    `stagger-${index + 1}`
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Trending</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtagsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full" />
              ))
            ) : trendingHashtags.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-hashtags-mobile">No trending hashtags yet</p>
            ) : (
              trendingHashtags.map((item: any, index: number) => (
                <button
                  key={item.tag}
                  data-testid={`button-hashtag-mobile-${item.tag}`}
                  className={cn(
                    "flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-2.5 transition-all press-effect animate-fade-in-up",
                    `stagger-${index + 1}`
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full bg-gradient-to-r", item.color)} />
                  <span className="text-sm font-semibold">#{item.tag}</span>
                  <span className="text-xs text-muted-foreground">{item.count}</span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Suggested Accounts</h2>
            <button className="text-xs text-primary font-semibold flex items-center gap-1 press-effect">
              See all
            </button>
          </div>
          <div className="space-y-3">
            {usersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-9 w-20 rounded-lg" />
                </div>
              ))
            ) : suggestedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-users-mobile">No suggested accounts yet</p>
            ) : (
              suggestedUsers.map((user: any, index: number) => (
                <div
                  key={user.id}
                  data-testid={`card-user-mobile-${user.id}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 animate-fade-in-up press-effect",
                    `stagger-${index + 1}`
                  )}
                >
                  <div className="relative">
                    <Avatar className={cn(
                      "h-14 w-14 ring-2 ring-offset-2 ring-offset-background",
                      user.isLive ? "ring-stream-live" : "ring-transparent"
                    )}>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    {user.isLive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-stream-live px-2 py-0.5 text-[9px] font-bold text-white shadow-lg">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[15px] truncate">{user.name}</span>
                      {user.isVerified && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary shrink-0">
                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.username}</p>
                  </div>
                  <Button
                    size="sm"
                    data-testid={`button-follow-mobile-${user.id}`}
                    onClick={() => handleFollowToggle(user.id)}
                    disabled={pendingFollows.has(user.id)}
                    variant={followedUsers.has(user.id) ? "outline" : "default"}
                    className={cn(
                      "rounded-lg font-semibold h-9 px-5 shadow-lg",
                      followedUsers.has(user.id)
                        ? "border-stream-coral text-stream-coral shadow-none"
                        : "bg-stream-coral hover:bg-stream-coral/90 text-white shadow-stream-coral/20"
                    )}
                  >
                    {pendingFollows.has(user.id) ? "..." : followedUsers.has(user.id) ? "Following" : "Follow"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Videos</h2>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {videosLoading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
              ))
            ) : trendingVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full" data-testid="text-no-videos-mobile">No trending videos yet</p>
            ) : (
              trendingVideos.slice(0, 9).map((video: any, index: number) => (
                <Link
                  to="/"
                  key={video.id}
                  data-testid={`link-video-mobile-${video.id}`}
                  className={cn(
                    "group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted cursor-pointer animate-fade-in-up",
                    `stagger-${(index % 6) + 1}`
                  )}
                >
                  <img
                    src={video.thumbnail}
                    alt="Video thumbnail"
                    className="h-full w-full object-cover transition-transform duration-300 group-active:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white">
                    <Play className="h-3 w-3" fill="white" />
                    <span className="text-[11px] font-semibold">{video.views}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
