import React from "react";
import { Search, TrendingUp, Music, Gamepad2, Palette, Utensils, Heart, Sparkles, Play, Film, Users, Flame, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";

const trendingHashtags = [
  { tag: "dance", count: "2.3M", color: "from-pink-500 to-rose-500" },
  { tag: "music", count: "1.8M", color: "from-purple-500 to-violet-500" },
  { tag: "funny", count: "1.5M", color: "from-yellow-500 to-amber-500" },
  { tag: "cooking", count: "980K", color: "from-orange-500 to-red-500" },
  { tag: "fitness", count: "756K", color: "from-green-500 to-emerald-500" },
  { tag: "travel", count: "654K", color: "from-blue-500 to-cyan-500" },
];

const categories = [
  { id: "trending", label: "Trending", icon: Flame, gradient: "from-orange-500 to-red-500" },
  { id: "music", label: "Music", icon: Music, gradient: "from-purple-500 to-pink-500" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, gradient: "from-green-500 to-emerald-500" },
  { id: "art", label: "Art", icon: Palette, gradient: "from-pink-500 to-rose-500" },
];

const suggestedUsers = [
  { id: 1, name: "Sarah M.", username: "@sarahm", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", followers: "1.2M", isVerified: true, isLive: true },
  { id: 2, name: "Alex Chen", username: "@alexchen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", followers: "890K", isVerified: true, isLive: false },
  { id: 3, name: "Luna Star", username: "@lunastar", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", followers: "2.1M", isVerified: true, isLive: true },
  { id: 4, name: "DJ Mike", username: "@djmike", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100", followers: "567K", isVerified: false, isLive: false },
];

const trendingVideos = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=500&fit=crop", views: "1.2M", creator: "sarah_m" },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=500&fit=crop", views: "890K", creator: "fitness_pro" },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=500&fit=crop", views: "2.3M", creator: "luna_star" },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=500&fit=crop", views: "567K", creator: "model_k" },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=500&fit=crop", views: "1.8M", creator: "alex_chen" },
  { id: 6, thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=500&fit=crop", views: "430K", creator: "jade_v" },
  { id: 7, thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=300&h=500&fit=crop", views: "2.1M", creator: "dance_luna" },
  { id: 8, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=500&fit=crop", views: "890K", creator: "dj_alex" },
  { id: 9, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=500&fit=crop", views: "1.5M", creator: "night_owl" },
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/30">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Discover</h1>
          
          {/* Search */}
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
        {/* Categories */}
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

        {/* Trending Hashtags */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Trending</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map((item, index) => (
              <button
                key={item.tag}
                className={cn(
                  "flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-2.5 transition-all press-effect animate-fade-in-up",
                  `stagger-${index + 1}`
                )}
              >
                <span className={cn("h-2 w-2 rounded-full bg-gradient-to-r", item.color)} />
                <span className="text-sm font-semibold">#{item.tag}</span>
                <span className="text-xs text-muted-foreground">{item.count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Suggested Creators */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Suggested Accounts</h2>
            <button className="text-xs text-primary font-semibold flex items-center gap-1 press-effect">
              See all
            </button>
          </div>
          <div className="space-y-3">
            {suggestedUsers.map((user, index) => (
              <div
                key={user.id}
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
                <Button size="sm" className="bg-stream-coral hover:bg-stream-coral/90 text-white rounded-lg font-semibold h-9 px-5 shadow-lg shadow-stream-coral/20">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Videos Grid */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Videos</h2>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {trendingVideos.map((video, index) => (
              <Link
                to="/"
                key={video.id}
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
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
