import { TrendingUp, Users, Heart, MessageCircle, Gift, Sparkles, ChevronRight, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const trendingHashtags = [
  { tag: "dance", posts: "2.3M" },
  { tag: "music", posts: "1.8M" },
  { tag: "funny", posts: "1.5M" },
  { tag: "cooking", posts: "980K" },
  { tag: "fitness", posts: "756K" },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "follow": return Users;
    case "like": return Heart;
    case "comment": return MessageCircle;
    case "gift": return Gift;
    default: return Sparkles;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "follow": return "text-blue-500 bg-blue-500/10";
    case "like": return "text-stream-coral bg-stream-coral/10";
    case "comment": return "text-green-500 bg-green-500/10";
    case "gift": return "text-stream-gold bg-stream-gold/10";
    default: return "text-primary bg-primary/10";
  }
};

export function DesktopRightSidebar() {
  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['/api/users/suggested'],
    queryFn: async () => {
      const res = await api.get('/users/suggested');
      return (res.data || []).slice(0, 4).map((u: any) => ({
        id: u.id,
        type: "follow",
        user: u.displayName || u.username || 'User',
        avatar: u.avatarUrl || '',
        action: "joined the platform",
        time: "recently",
      }));
    },
  });

  const { data: suggestedUsers = [], isLoading: suggestedLoading } = useQuery({
    queryKey: ['/api/users/suggested', 'desktop'],
    queryFn: async () => {
      const res = await api.get('/users/suggested');
      return (res.data || []).slice(0, 3).map((u: any) => ({
        id: u.id,
        name: u.displayName || u.username || 'User',
        username: `@${u.username}`,
        avatar: u.avatarUrl || '',
        followers: u.followersCount ? `${u.followersCount}` : '0',
        isVerified: u.isVerified || false,
      }));
    },
  });

  return (
    <aside className="hidden xl:flex flex-col w-80 border-l border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
      {/* Activity Feed */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Activity</h3>
          <button className="text-xs text-primary font-medium hover:underline">See all</button>
        </div>
        <div className="space-y-3">
          {activityLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3.5 w-32 mb-1.5" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </>
          ) : recentActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">No activity yet</p>
          ) : (
            recentActivity.map((item: any, index: number) => {
              const Icon = getActivityIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 cursor-pointer transition-all animate-fade-in-up",
                    `stagger-${index + 1}`
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.avatar} />
                      <AvatarFallback>{item.user?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className={cn("absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center", getActivityColor(item.type))}>
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{item.user}</span>{" "}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{item.time} ago</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Trending Hashtags */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingHashtags.map((item, index) => (
            <button
              key={item.tag}
              className={cn(
                "flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors animate-fade-in-up",
                `stagger-${index + 1}`
              )}
            >
              <span className="text-primary">#</span>
              {item.tag}
              <span className="text-[10px] text-muted-foreground ml-1">{item.posts}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Suggested for you</h3>
          <button className="text-xs text-primary font-medium hover:underline">See all</button>
        </div>
        <div className="space-y-3">
          {suggestedLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3.5 w-24 mb-1.5" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              ))}
            </>
          ) : suggestedUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">No suggestions</p>
          ) : (
            suggestedUsers.map((user: any, index: number) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 cursor-pointer transition-all animate-fade-in-up",
                  `stagger-${index + 1}`
                )}
              >
                <Avatar className="h-11 w-11">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    {user.isVerified && (
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{user.followers} followers</p>
                </div>
                <Button size="sm" className="h-8 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold">
                  Follow
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto p-5 border-t border-border/50">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Ads</a>
          <a href="#" className="hover:underline">Developers</a>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">2024 Snap Live</p>
      </div>
    </aside>
  );
}
