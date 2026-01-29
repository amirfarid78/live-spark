import React from "react";
import { Search, TrendingUp, Music, Gamepad2, Palette, Utensils, Heart, Sparkles, Play, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";

const trendingHashtags = [
  { tag: "dance", count: "2.3M", color: "bg-pink-500/10 text-pink-500" },
  { tag: "music", count: "1.8M", color: "bg-purple-500/10 text-purple-500" },
  { tag: "funny", count: "1.5M", color: "bg-yellow-500/10 text-yellow-500" },
  { tag: "cooking", count: "980K", color: "bg-orange-500/10 text-orange-500" },
  { tag: "fitness", count: "756K", color: "bg-green-500/10 text-green-500" },
];

const categories = [
  { id: "music", label: "Music", icon: Music, gradient: "from-purple-500 to-pink-500" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, gradient: "from-green-500 to-emerald-500" },
  { id: "art", label: "Art", icon: Palette, gradient: "from-pink-500 to-rose-500" },
  { id: "food", label: "Food", icon: Utensils, gradient: "from-orange-500 to-amber-500" },
];

const suggestedUsers = [
  { id: 1, name: "Sarah M.", username: "@sarahm", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", followers: "1.2M", isVerified: true },
  { id: 2, name: "Alex Chen", username: "@alexchen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", followers: "890K", isVerified: true },
  { id: 3, name: "Luna Star", username: "@lunastar", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", followers: "2.1M", isVerified: false },
];

const trendingVideos = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=500&fit=crop", views: "1.2M", likes: "89K" },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=500&fit=crop", views: "890K", likes: "67K" },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=500&fit=crop", views: "2.3M", likes: "156K" },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=500&fit=crop", views: "567K", likes: "34K" },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=500&fit=crop", views: "1.8M", likes: "120K" },
  { id: 6, thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=500&fit=crop", views: "430K", likes: "28K" },
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Discover</h1>
            <Link 
              to="/feed"
              className="flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 press-effect"
            >
              <Film className="h-4 w-4" />
              Feed
            </Link>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users, videos, sounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-secondary border-0 rounded-2xl text-base"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="w-full justify-start gap-1 bg-transparent px-4 pb-0 h-auto">
            <TabsTrigger 
              value="foryou" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent font-medium"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent font-medium"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent font-medium"
            >
              <Heart className="mr-2 h-4 w-4" />
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="flex-1 space-y-6 px-4 py-5 pb-24">
        {/* Categories */}
        <section className="animate-fade-in-up">
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categories</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={cn(
                    "flex flex-col items-center gap-2.5 rounded-2xl bg-secondary p-4 transition-all press-effect card-hover animate-fade-in-up",
                    `stagger-${index + 1}`
                  )}
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", cat.gradient)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Trending Hashtags */}
        <section className="animate-fade-in-up stagger-2">
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trending Hashtags</h2>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map((item, index) => (
              <Badge
                key={item.tag}
                variant="secondary"
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:scale-105 press-effect border-0",
                  item.color
                )}
              >
                #{item.tag}
                <span className="ml-2 opacity-70 text-xs">{item.count}</span>
              </Badge>
            ))}
          </div>
        </section>

        {/* Suggested Users */}
        <section className="animate-fade-in-up stagger-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Suggested Creators</h2>
            <Button variant="link" size="sm" className="text-primary h-auto p-0 text-xs font-medium">
              See all
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {suggestedUsers.map((user, index) => (
              <div
                key={user.id}
                className={cn(
                  "flex min-w-[150px] flex-col items-center gap-3 rounded-2xl bg-secondary p-5 card-hover animate-fade-in-up",
                  `stagger-${index + 1}`
                )}
              >
                <div className="relative">
                  <Avatar className="h-18 w-18 ring-4 ring-primary/20 ring-offset-2 ring-offset-secondary">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                </div>
                <Button size="sm" className="w-full bg-gradient-primary hover:opacity-90 rounded-xl font-semibold shadow-lg shadow-primary/20">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Videos */}
        <section className="animate-fade-in-up stagger-4">
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trending Now</h2>
          <div className="grid grid-cols-3 gap-1.5">
            {trendingVideos.map((video, index) => (
              <Link
                to="/feed"
                key={video.id}
                className={cn(
                  "group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted cursor-pointer animate-fade-in-up",
                  `stagger-${(index % 6) + 1}`
                )}
              >
                <img
                  src={video.thumbnail}
                  alt="Video thumbnail"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-white">
                    <Play className="h-3 w-3" fill="white" />
                    <span className="text-xs font-medium">{video.views}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white">
                    <Heart className="h-3 w-3" />
                    <span className="text-xs font-medium">{video.likes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
