import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BarChart3, Rocket, Megaphone, Settings, 
  TrendingUp, Eye, Heart, Users, Coins, Play, Plus,
  Calendar, Target, Sparkles, ChevronRight, Clock,
  DollarSign, PieChart, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VideoStatsCard, VideoStatsSummary } from "@/components/creator/VideoStatsCard";
import { PromoteVideoSheet } from "@/components/creator/PromoteVideoSheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

// Mock data for video stats
const mockVideos = [
  {
    id: "1",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=400&fit=crop",
    title: "Summer vibes at the beach 🌊",
    views: 125000,
    likes: 12500,
    comments: 890,
    shares: 234,
    watchTime: "0:45",
    reach: 180000,
    trend: "up" as const,
    trendPercent: 24,
    postedAt: "2 days ago"
  },
  {
    id: "2",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop",
    title: "Dance challenge with friends 💃",
    views: 85000,
    likes: 8900,
    comments: 456,
    shares: 123,
    watchTime: "0:32",
    reach: 95000,
    trend: "up" as const,
    trendPercent: 15,
    postedAt: "5 days ago"
  },
  {
    id: "3",
    thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=300&h=400&fit=crop",
    title: "Behind the scenes vlog 🎬",
    views: 45000,
    likes: 4200,
    comments: 234,
    shares: 67,
    watchTime: "1:15",
    reach: 52000,
    trend: "down" as const,
    trendPercent: 8,
    postedAt: "1 week ago"
  },
  {
    id: "4",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop",
    title: "Outfit of the day ✨",
    views: 32000,
    likes: 3400,
    comments: 178,
    shares: 45,
    watchTime: "0:28",
    reach: 38000,
    trend: "stable" as const,
    trendPercent: 2,
    postedAt: "2 weeks ago"
  },
];

// Mock active campaigns
const activeCampaigns = [
  {
    id: "1",
    videoTitle: "Summer vibes at the beach 🌊",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=400&fit=crop",
    package: "Standard Boost",
    spent: 350,
    budget: 500,
    views: 18500,
    targetViews: 25000,
    status: "active",
    endsIn: "18 hours"
  },
  {
    id: "2",
    videoTitle: "Dance challenge with friends 💃",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop",
    package: "Premium Boost",
    spent: 1800,
    budget: 2000,
    views: 85000,
    targetViews: 100000,
    status: "active",
    endsIn: "36 hours"
  },
];

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export default function CreatorStudio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<typeof mockVideos[0] | undefined>();
  const [activeTab, setActiveTab] = useState("analytics");

  const handlePromoteVideo = (video: typeof mockVideos[0]) => {
    setSelectedVideo(video);
    setPromoteOpen(true);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6">
        <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Creator Studio</h2>
        <p className="text-muted-foreground text-center mb-6">
          Sign in to access your creator dashboard and analytics
        </p>
        <Button onClick={() => navigate("/login")} className="bg-gradient-primary">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Creator Studio</h1>
              <p className="text-xs text-muted-foreground">Manage your content & promotions</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="px-4 py-4 border-b border-border/50">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { icon: Eye, label: "Views (7d)", value: "287K", color: "from-purple-500 to-indigo-500" },
            { icon: Heart, label: "Likes", value: "28.6K", color: "from-pink-500 to-rose-500" },
            { icon: Users, label: "Followers", value: formatNumber(profile?.followers_count || 0), color: "from-blue-500 to-cyan-500" },
            { icon: Coins, label: "Earned", value: formatNumber(profile?.diamonds_balance || 0), color: "from-amber-500 to-orange-500" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="flex-shrink-0 border-0 shadow-lg min-w-[140px]">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-r",
                    stat.color
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full justify-around border-b border-border bg-transparent h-14 rounded-none sticky top-[57px] z-30 glass">
          <TabsTrigger 
            value="analytics" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="promote" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
          >
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Promote</span>
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
          >
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Campaigns</span>
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-0 p-4 pb-24 space-y-6">
          {/* Summary Stats */}
          <VideoStatsSummary
            totalViews={287000}
            totalLikes={28600}
            totalComments={1758}
            avgWatchTime="0:42"
            profileVisits={15200}
            newFollowers={892}
          />

          {/* Time Filter */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Play className="h-4 w-4" />
              Video Performance
            </h3>
            <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2">
              <Calendar className="h-3 w-3" />
              Last 7 days
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Video Stats List */}
          <div className="space-y-3">
            {mockVideos.map((video) => (
              <VideoStatsCard 
                key={video.id} 
                video={video}
                onClick={() => handlePromoteVideo(video)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Promote Tab */}
        <TabsContent value="promote" className="mt-0 p-4 pb-24 space-y-6">
          {/* Create New Campaign CTA */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-primary p-0.5 rounded-xl">
              <CardContent className="p-6 bg-card rounded-[10px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Boost Your Videos</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Reach more viewers and grow your audience with promotions
                </p>
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => {
                    setSelectedVideo(mockVideos[0]);
                    setPromoteOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* Select Video to Promote */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Select Video to Promote
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {mockVideos.map((video) => (
                <Card 
                  key={video.id}
                  className="border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
                  onClick={() => handlePromoteVideo(video)}
                >
                  <div className="relative aspect-[3/4]">
                    <img 
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-medium truncate">{video.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-white/80">
                        <Eye className="h-3 w-3" />
                        <span className="text-[10px]">{formatNumber(video.views)}</span>
                      </div>
                    </div>
                    <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Rocket className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Promotion Tips */}
          <Card className="border-0 bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Tips for Better Reach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Post during peak hours (6-9 PM)",
                "Use trending hashtags",
                "Engage with comments quickly",
                "Create eye-catching thumbnails"
              ].map((tip, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-0 p-4 pb-24 space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">2,150</p>
                <p className="text-xs text-muted-foreground">Coins Spent</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <PieChart className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-bold">103.5K</p>
                <p className="text-xs text-muted-foreground">Total Reach</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Active Campaigns
              </h3>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                {activeCampaigns.length} Running
              </Badge>
            </div>
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <Card key={campaign.id} className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={campaign.thumbnail}
                          alt={campaign.videoTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm truncate">{campaign.videoTitle}</p>
                            <p className="text-xs text-muted-foreground">{campaign.package}</p>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-0">
                            Active
                          </Badge>
                        </div>
                        
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Views Progress</span>
                            <span>{formatNumber(campaign.views)} / {formatNumber(campaign.targetViews)}</span>
                          </div>
                          <Progress 
                            value={(campaign.views / campaign.targetViews) * 100} 
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center justify-between mt-3 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Coins className="h-3 w-3 text-amber-500" />
                            <span>{campaign.spent}/{campaign.budget}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Ends in {campaign.endsIn}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Past Campaigns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Campaign History
              </h3>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
            </div>
            <Card className="border-0 bg-secondary/50">
              <CardContent className="p-8 text-center">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Completed campaigns will appear here
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Promote Sheet */}
      <PromoteVideoSheet
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        video={selectedVideo ? {
          id: selectedVideo.id,
          title: selectedVideo.title,
          thumbnail: selectedVideo.thumbnail
        } : undefined}
        userCoins={profile?.coins_balance || 0}
      />
    </div>
  );
}
