import { TrendingUp, Users, Heart, MessageCircle, Gift, Sparkles, ChevronRight, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const activityFeed = [
  { id: 1, type: "follow", user: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", action: "followed you", time: "2m" },
  { id: 2, type: "like", user: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", action: "liked your video", time: "5m" },
  { id: 3, type: "comment", user: "Luna Star", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", action: "commented on your post", time: "12m" },
  { id: 4, type: "gift", user: "DJ Mike", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100", action: "sent you a gift", time: "1h" },
];

const trendingHashtags = [
  { tag: "dance", posts: "2.3M" },
  { tag: "music", posts: "1.8M" },
  { tag: "funny", posts: "1.5M" },
  { tag: "cooking", posts: "980K" },
  { tag: "fitness", posts: "756K" },
];

const suggestedUsers = [
  { id: 1, name: "Emma Rose", username: "@emmarose", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100", followers: "890K", isVerified: true },
  { id: 2, name: "Chris K", username: "@chrisk", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", followers: "567K", isVerified: false },
  { id: 3, name: "Jade W", username: "@jadew", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", followers: "1.2M", isVerified: true },
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
  return (
    <aside className="hidden xl:flex flex-col w-80 border-l border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
      {/* Activity Feed */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Activity</h3>
          <button className="text-xs text-primary font-medium hover:underline">See all</button>
        </div>
        <div className="space-y-3">
          {activityFeed.map((item, index) => {
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
                    <AvatarFallback>{item.user[0]}</AvatarFallback>
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
          })}
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
          {suggestedUsers.map((user, index) => (
            <div
              key={user.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 cursor-pointer transition-all animate-fade-in-up",
                `stagger-${index + 1}`
              )}
            >
              <Avatar className="h-11 w-11">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
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
          ))}
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
        <p className="text-[10px] text-muted-foreground mt-2">© 2024 Snap Live</p>
      </div>
    </aside>
  );
}
