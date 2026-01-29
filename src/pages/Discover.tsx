import { Search, TrendingUp, Music, Gamepad2, Palette, Utensils, Heart, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

const trendingHashtags = [
  { tag: "dance", count: "2.3M" },
  { tag: "music", count: "1.8M" },
  { tag: "funny", count: "1.5M" },
  { tag: "cooking", count: "980K" },
  { tag: "fitness", count: "756K" },
];

const categories = [
  { id: "music", label: "Music", icon: Music, color: "bg-purple-500" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, color: "bg-green-500" },
  { id: "art", label: "Art", icon: Palette, color: "bg-pink-500" },
  { id: "food", label: "Food", icon: Utensils, color: "bg-orange-500" },
];

const suggestedUsers = [
  { id: 1, name: "Sarah M.", username: "@sarahm", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", followers: "1.2M", isVerified: true },
  { id: 2, name: "Alex Chen", username: "@alexchen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", followers: "890K", isVerified: true },
  { id: 3, name: "Luna Star", username: "@lunastar", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", followers: "2.1M", isVerified: false },
];

const trendingVideos = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=400&fit=crop", views: "1.2M", likes: "89K" },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop", views: "890K", likes: "67K" },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop", views: "2.3M", likes: "156K" },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop", views: "567K", likes: "34K" },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=400&fit=crop", views: "1.8M", likes: "120K" },
  { id: 6, thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop", views: "430K", likes: "28K" },
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold mb-3">Discover</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users, videos, sounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="w-full justify-start gap-4 bg-transparent px-4 pb-0 h-auto">
            <TabsTrigger 
              value="foryou" 
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Heart className="mr-2 h-4 w-4" />
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="flex-1 space-y-6 p-4">
        {/* Categories */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">CATEGORIES</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className="flex flex-col items-center gap-2 rounded-xl bg-secondary p-4 transition-all hover:bg-secondary/80 active:scale-95"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${cat.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Trending Hashtags */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">TRENDING HASHTAGS</h2>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map((item) => (
              <Badge
                key={item.tag}
                variant="secondary"
                className="cursor-pointer px-3 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                #{item.tag}
                <span className="ml-1 text-xs text-muted-foreground">{item.count}</span>
              </Badge>
            ))}
          </div>
        </section>

        {/* Suggested Users */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">SUGGESTED CREATORS</h2>
            <Button variant="link" size="sm" className="text-primary h-auto p-0">
              See all
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {suggestedUsers.map((user) => (
              <div
                key={user.id}
                className="flex min-w-[140px] flex-col items-center gap-3 rounded-xl bg-secondary p-4"
              >
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-primary ring-offset-2 ring-offset-background">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                </div>
                <Button size="sm" className="w-full bg-gradient-primary hover:opacity-90">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Videos */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">TRENDING NOW</h2>
          <div className="grid grid-cols-3 gap-1">
            {trendingVideos.map((video) => (
              <div
                key={video.id}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted cursor-pointer"
              >
                <img
                  src={video.thumbnail}
                  alt="Video thumbnail"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="flex items-center gap-1 text-white">
                    <Heart className="h-3 w-3" />
                    <span className="text-xs">{video.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
