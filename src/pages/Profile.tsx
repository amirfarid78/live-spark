import { Settings, Share2, Edit2, Grid3X3, Heart, Bookmark, Coins, Users, UserPlus, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Following", value: "234" },
  { label: "Followers", value: "12.5K" },
  { label: "Likes", value: "89.2K" },
];

const userVideos = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=400&fit=crop", views: "12K" },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop", views: "8.5K" },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=300&h=400&fit=crop", views: "23K" },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop", views: "5.2K" },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop", views: "15K" },
  { id: 6, thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=400&fit=crop", views: "9.8K" },
];

export default function Profile() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Profile</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <div className="px-4 py-6">
        {/* Avatar & Stats */}
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" alt="User" />
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Edit2 className="h-4 w-4" />
            </button>
            {/* Level Badge */}
            <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-stream-gold to-yellow-500 text-xs font-bold text-black shadow-lg">
              28
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-1 justify-around pt-2">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">John Doe</h2>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">@johndoe</p>
          <p className="mt-2 text-sm">
            🎬 Content Creator | 🎮 Gamer | 🎵 Music Lover
            <br />
            Making awesome content every day! ✨
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <Button className="flex-1 bg-gradient-primary hover:opacity-90">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
        </div>

        {/* Wallet Card */}
        <Card className="mt-4 bg-gradient-to-br from-stream-purple to-stream-coral border-0 text-white">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Coin Balance</p>
                <p className="text-xl font-bold">12,450</p>
              </div>
            </div>
            <Button size="sm" className="bg-white text-primary hover:bg-white/90">
              Top Up
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { icon: Trophy, label: "Badges" },
            { icon: Users, label: "Friends" },
            { icon: UserPlus, label: "Invite" },
            { icon: Bookmark, label: "Saved" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary p-3 transition-colors hover:bg-secondary/80"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="videos" className="flex-1">
        <TabsList className="w-full justify-around border-b border-border bg-transparent h-12 rounded-none">
          <TabsTrigger 
            value="videos" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Grid3X3 className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="liked" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Heart className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Bookmark className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-0">
          <div className="grid grid-cols-3 gap-0.5">
            {userVideos.map((video) => (
              <div
                key={video.id}
                className="group relative aspect-[3/4] cursor-pointer overflow-hidden bg-muted"
              >
                <img
                  src={video.thumbnail}
                  alt="Video"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <div className="flex items-center gap-1 text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">{video.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="liked" className="mt-0 flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Heart className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Liked videos will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-0 flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Bookmark className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Saved videos will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
