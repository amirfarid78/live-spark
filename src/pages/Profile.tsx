import React from "react";
import { Settings, Share2, Edit2, Grid3X3, Heart, Bookmark, Coins, Users, UserPlus, Trophy, ChevronRight, Sparkles, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Following", value: "234" },
  { label: "Followers", value: "12.5K" },
  { label: "Likes", value: "89.2K" },
];

const badges = [
  { icon: Star, label: "Top Creator", color: "from-yellow-400 to-orange-500" },
  { icon: Gift, label: "Generous", color: "from-pink-400 to-rose-500" },
  { icon: Sparkles, label: "Verified", color: "from-purple-400 to-indigo-500" },
];

const userVideos = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=400&fit=crop", views: "12K", likes: "1.2K" },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop", views: "8.5K", likes: "890" },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=300&h=400&fit=crop", views: "23K", likes: "2.3K" },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop", views: "5.2K", likes: "456" },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop", views: "15K", likes: "1.5K" },
  { id: 6, thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=400&fit=crop", views: "9.8K", likes: "980" },
];

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Profile</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <div className="px-4 py-6">
        {/* Avatar & Stats */}
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" alt="User" />
              <AvatarFallback className="text-3xl">JD</AvatarFallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-white shadow-lg press-effect">
              <Edit2 className="h-4 w-4" />
            </button>
            {/* Level Badge */}
            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-xs font-bold text-black shadow-lg ring-2 ring-background">
              28
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-1 justify-around pt-3">
            {stats.map((stat, index) => (
              <button 
                key={stat.label} 
                className={cn(
                  "text-center press-effect animate-fade-in-up",
                  `stagger-${index + 1}`
                )}
              >
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">John Doe</h2>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">@johndoe</p>
          <p className="mt-3 text-sm leading-relaxed">
            🎬 Content Creator | 🎮 Gamer | 🎵 Music Lover
            <br />
            Making awesome content every day! ✨
          </p>
          
          {/* Badges */}
          <div className="mt-3 flex gap-2">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.label}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 text-white text-xs font-medium animate-fade-in-up",
                    badge.color,
                    `stagger-${index + 1}`
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {badge.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <Button className="flex-1 bg-gradient-primary hover:opacity-90 rounded-xl h-11 font-semibold shadow-lg shadow-primary/20">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl h-11 font-semibold">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Wallet Card */}
        <Card className="mt-5 overflow-hidden border-0 shadow-xl animate-fade-in-up">
          <div className="bg-gradient-primary p-0.5 rounded-xl">
            <CardContent className="flex items-center justify-between p-4 bg-card rounded-[10px]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Coin Balance</p>
                  <p className="text-2xl font-bold text-gradient">12,450</p>
                </div>
              </div>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 rounded-xl font-semibold shadow-lg shadow-primary/20">
                Top Up
              </Button>
            </CardContent>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { icon: Trophy, label: "Badges", count: "12" },
            { icon: Users, label: "Friends", count: "234" },
            { icon: UserPlus, label: "Invite", count: "" },
            { icon: Bookmark, label: "Saved", count: "45" },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl bg-secondary p-4 transition-all press-effect card-hover animate-fade-in-up",
                  `stagger-${index + 1}`
                )}
              >
                <div className="relative">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                  {item.count && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white px-1">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="videos" className="flex-1">
        <TabsList className="w-full justify-around border-b border-border bg-transparent h-14 rounded-none sticky top-[57px] z-30 glass">
          <TabsTrigger 
            value="videos" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
          >
            <Grid3X3 className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="liked" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
          >
            <Heart className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
          >
            <Bookmark className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-0 pb-24">
          <div className="grid grid-cols-3 gap-0.5">
            {userVideos.map((video, index) => (
              <div
                key={video.id}
                className={cn(
                  "group relative aspect-[3/4] cursor-pointer overflow-hidden bg-muted animate-fade-in-up",
                  `stagger-${(index % 6) + 1}`
                )}
              >
                <img
                  src={video.thumbnail}
                  alt="Video"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="flex items-center gap-2 text-white">
                    <div className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px] font-medium">{video.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span className="text-[10px] font-medium">{video.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="liked" className="mt-0 flex items-center justify-center py-16 pb-24">
          <div className="text-center text-muted-foreground animate-fade-in">
            <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-semibold">Liked videos will appear here</p>
            <p className="text-sm mt-1">Videos you've liked will be saved here</p>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-0 flex items-center justify-center py-16 pb-24">
          <div className="text-center text-muted-foreground animate-fade-in">
            <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-semibold">Saved videos will appear here</p>
            <p className="text-sm mt-1">Bookmark videos to watch later</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
