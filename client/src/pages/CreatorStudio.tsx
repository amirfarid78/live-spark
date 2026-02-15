import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, BarChart3, Rocket, Megaphone, Settings, 
  TrendingUp, Eye, Heart, Users, Coins, Play, Plus,
  Calendar, Target, Sparkles, ChevronRight, Clock,
  DollarSign, PieChart, Filter, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoStatsCard, VideoStatsSummary } from "@/components/creator/VideoStatsCard";
import { PromoteVideoSheet } from "@/components/creator/PromoteVideoSheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import api from "@/lib/api";

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}

interface MappedVideo {
  id: string;
  thumbnail: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: string;
  reach: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
  postedAt: string;
}

export default function CreatorStudio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MappedVideo | undefined>();
  const [activeTab, setActiveTab] = useState("analytics");

  const { data: creatorStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/creator/stats"],
    queryFn: async () => {
      const res = await api.get("/creator/stats");
      return res.data;
    },
    enabled: !!user,
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const res = await api.get("/campaigns");
      return res.data;
    },
    enabled: !!user,
  });

  const { data: walletData } = useQuery({
    queryKey: ["/api/wallet/balance"],
    queryFn: async () => {
      const res = await api.get("/wallet/balance");
      return res.data;
    },
    enabled: !!user,
  });

  const mappedVideos: MappedVideo[] = (creatorStats?.videos || []).map((v: any) => ({
    id: String(v.id),
    thumbnail: v.thumbnailUrl || "/placeholder.svg",
    title: v.description || "Untitled Video",
    views: v.views || 0,
    likes: v.likes || 0,
    comments: v.comments || 0,
    shares: v.shares || 0,
    watchTime: "0:30",
    reach: Math.round((v.views || 0) * 1.2),
    trend: (v.views || 0) > 1000 ? "up" as const : (v.views || 0) > 100 ? "stable" as const : "down" as const,
    trendPercent: Math.min(Math.round(Math.random() * 30), 99),
    postedAt: v.createdAt ? timeAgo(v.createdAt) : "recently",
  }));

  const activeCampaignsList = (campaigns || []).filter((c: any) => c.status === "active");
  const completedCampaignsList = (campaigns || []).filter((c: any) => c.status === "completed");

  const totalCampaignSpent = (campaigns || []).reduce((sum: number, c: any) => sum + (c.spent || 0), 0);
  const totalCampaignReach = (campaigns || []).reduce((sum: number, c: any) => sum + (c.views || 0), 0);

  const handlePromoteVideo = (video: MappedVideo) => {
    setSelectedVideo(video);
    setPromoteOpen(true);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6">
        <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2" data-testid="text-creator-studio-title">Creator Studio</h2>
        <p className="text-muted-foreground text-center mb-6">
          Sign in to access your creator dashboard and analytics
        </p>
        <Button onClick={() => navigate("/login")} className="bg-gradient-primary" data-testid="button-sign-in">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl"
              onClick={() => navigate(-1)}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Creator Studio</h1>
              <p className="text-xs text-muted-foreground">Manage your content & promotions</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" data-testid="button-settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-4 border-b border-border/50">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="flex-shrink-0 border-0 shadow-lg min-w-[140px]">
                <CardContent className="p-3 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-12 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            [
              { icon: Eye, label: "Views (7d)", value: formatNumber(creatorStats?.totalViews || 0), color: "from-purple-500 to-indigo-500" },
              { icon: Heart, label: "Likes", value: formatNumber(creatorStats?.totalLikes || 0), color: "from-pink-500 to-rose-500" },
              { icon: Users, label: "Followers", value: formatNumber(profile?.followersCount || 0), color: "from-blue-500 to-cyan-500" },
              { icon: Coins, label: "Earned", value: formatNumber(creatorStats?.diamondsEarned || 0), color: "from-amber-500 to-orange-500" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="flex-shrink-0 border-0 shadow-lg min-w-[140px]" data-testid={`card-stat-${stat.label}`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-r",
                      stat.color
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold" data-testid={`text-stat-value-${stat.label}`}>{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full justify-around border-b border-border bg-transparent h-14 rounded-none sticky top-[57px] z-30 glass">
          <TabsTrigger 
            value="analytics" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
            data-testid="tab-analytics"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="promote" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
            data-testid="tab-promote"
          >
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Promote</span>
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
            data-testid="tab-campaigns"
          >
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Campaigns</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-0 p-4 pb-24 space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Skeleton className="w-10 h-10 rounded-xl mx-auto mb-3" />
                    <Skeleton className="h-6 w-16 mx-auto mb-1" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <VideoStatsSummary
              totalViews={creatorStats?.totalViews || 0}
              totalLikes={creatorStats?.totalLikes || 0}
              totalComments={creatorStats?.totalComments || 0}
              avgWatchTime="0:42"
              profileVisits={Math.round((creatorStats?.totalViews || 0) * 0.05)}
              newFollowers={profile?.followersCount || 0}
            />
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Play className="h-4 w-4" />
              Video Performance
            </h3>
            <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2" data-testid="button-time-filter">
              <Calendar className="h-3 w-3" />
              Last 7 days
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-3">
            {statsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-lg">
                  <div className="flex gap-4 p-4">
                    <Skeleton className="w-24 h-32 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/4 mb-3" />
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="text-center">
                            <Skeleton className="h-4 w-4 mx-auto mb-1" />
                            <Skeleton className="h-3 w-8 mx-auto" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : mappedVideos.length === 0 ? (
              <Card className="border-0 bg-secondary/50">
                <CardContent className="p-8 text-center">
                  <Video className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground" data-testid="text-no-videos">
                    No videos yet. Start creating to see your analytics!
                  </p>
                </CardContent>
              </Card>
            ) : (
              mappedVideos.map((video) => (
                <VideoStatsCard 
                  key={video.id} 
                  video={video}
                  onClick={() => handlePromoteVideo(video)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="promote" className="mt-0 p-4 pb-24 space-y-6">
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
                  disabled={mappedVideos.length === 0}
                  onClick={() => {
                    if (mappedVideos.length > 0) {
                      setSelectedVideo(mappedVideos[0]);
                      setPromoteOpen(true);
                    }
                  }}
                  data-testid="button-create-campaign"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </CardContent>
            </div>
          </Card>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Select Video to Promote
            </h3>
            {statsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg overflow-hidden">
                    <Skeleton className="aspect-[3/4] w-full" />
                  </Card>
                ))}
              </div>
            ) : mappedVideos.length === 0 ? (
              <Card className="border-0 bg-secondary/50">
                <CardContent className="p-8 text-center">
                  <Video className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground" data-testid="text-no-videos-promote">
                    Upload videos to start promoting them
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {mappedVideos.map((video) => (
                  <Card 
                    key={video.id}
                    className="border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
                    onClick={() => handlePromoteVideo(video)}
                    data-testid={`card-promote-video-${video.id}`}
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
            )}
          </div>

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

        <TabsContent value="campaigns" className="mt-0 p-4 pb-24 space-y-6">
          {campaignsLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                    <Skeleton className="h-7 w-16 mx-auto mb-1" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg" data-testid="card-coins-spent">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold" data-testid="text-coins-spent">{formatNumber(totalCampaignSpent)}</p>
                  <p className="text-xs text-muted-foreground">Coins Spent</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg" data-testid="card-total-reach">
                <CardContent className="p-4 text-center">
                  <PieChart className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <p className="text-2xl font-bold" data-testid="text-total-reach">{formatNumber(totalCampaignReach)}</p>
                  <p className="text-xs text-muted-foreground">Total Reach</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Active Campaigns
              </h3>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500" data-testid="badge-running-count">
                {activeCampaignsList.length} Running
              </Badge>
            </div>
            <div className="space-y-4">
              {campaignsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="w-16 h-20 rounded-xl flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2 mb-3" />
                          <Skeleton className="h-2 w-full mb-2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : activeCampaignsList.length === 0 ? (
                <Card className="border-0 bg-secondary/50">
                  <CardContent className="p-8 text-center">
                    <Megaphone className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground" data-testid="text-no-active-campaigns">
                      No active campaigns. Promote a video to get started!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activeCampaignsList.map((campaign: any) => (
                  <Card key={campaign.id} className="border-0 shadow-lg overflow-hidden" data-testid={`card-campaign-${campaign.id}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={campaign.thumbnailUrl || "/placeholder.svg"}
                            alt={campaign.videoTitle || "Campaign"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm truncate">{campaign.videoTitle || campaign.name || "Campaign"}</p>
                              <p className="text-xs text-muted-foreground">{campaign.package || campaign.type || "Boost"}</p>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500 border-0">
                              Active
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Views Progress</span>
                              <span>{formatNumber(campaign.views || 0)} / {formatNumber(campaign.targetViews || campaign.budget || 0)}</span>
                            </div>
                            <Progress 
                              value={campaign.targetViews ? ((campaign.views || 0) / campaign.targetViews) * 100 : 0} 
                              className="h-2"
                            />
                          </div>

                          <div className="flex items-center justify-between mt-3 text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Coins className="h-3 w-3 text-amber-500" />
                              <span>{campaign.spent || 0}/{campaign.budget || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{campaign.endsIn ? `Ends in ${campaign.endsIn}` : "Running"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Campaign History
              </h3>
              <Button variant="ghost" size="sm" className="h-8 gap-1" data-testid="button-filter-history">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
            </div>
            {completedCampaignsList.length === 0 ? (
              <Card className="border-0 bg-secondary/50">
                <CardContent className="p-8 text-center">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground" data-testid="text-no-campaign-history">
                    Completed campaigns will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedCampaignsList.map((campaign: any) => (
                  <Card key={campaign.id} className="border-0 shadow-lg overflow-hidden" data-testid={`card-history-campaign-${campaign.id}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={campaign.thumbnailUrl || "/placeholder.svg"}
                            alt={campaign.videoTitle || "Campaign"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{campaign.videoTitle || campaign.name || "Campaign"}</p>
                          <p className="text-xs text-muted-foreground">{campaign.package || campaign.type || "Boost"}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{formatNumber(campaign.views || 0)} views</span>
                            <span>{campaign.spent || 0} coins</span>
                          </div>
                        </div>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <PromoteVideoSheet
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        video={selectedVideo ? {
          id: selectedVideo.id,
          title: selectedVideo.title,
          thumbnail: selectedVideo.thumbnail
        } : undefined}
        userCoins={profile?.coinsBalance || 0}
      />
    </div>
  );
}
