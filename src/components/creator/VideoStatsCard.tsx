import { Eye, Heart, MessageCircle, Share2, TrendingUp, TrendingDown, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VideoStats {
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

interface VideoStatsCardProps {
  video: VideoStats;
  onClick?: () => void;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export function VideoStatsCard({ video, onClick }: VideoStatsCardProps) {
  return (
    <Card 
      className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-32 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate mb-2">{video.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{video.postedAt}</p>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <Eye className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs font-bold">{formatNumber(video.views)}</p>
              <p className="text-[10px] text-muted-foreground">Views</p>
            </div>
            <div className="text-center">
              <Heart className="h-4 w-4 mx-auto text-pink-500 mb-1" />
              <p className="text-xs font-bold">{formatNumber(video.likes)}</p>
              <p className="text-[10px] text-muted-foreground">Likes</p>
            </div>
            <div className="text-center">
              <MessageCircle className="h-4 w-4 mx-auto text-blue-500 mb-1" />
              <p className="text-xs font-bold">{formatNumber(video.comments)}</p>
              <p className="text-[10px] text-muted-foreground">Comments</p>
            </div>
            <div className="text-center">
              <Share2 className="h-4 w-4 mx-auto text-green-500 mb-1" />
              <p className="text-xs font-bold">{formatNumber(video.shares)}</p>
              <p className="text-[10px] text-muted-foreground">Shares</p>
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={cn(
          "flex flex-col items-center justify-center px-3",
          video.trend === "up" ? "text-green-500" : video.trend === "down" ? "text-red-500" : "text-muted-foreground"
        )}>
          {video.trend === "up" ? (
            <TrendingUp className="h-5 w-5" />
          ) : video.trend === "down" ? (
            <TrendingDown className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5 flex items-center justify-center">−</div>
          )}
          <span className="text-xs font-bold mt-1">
            {video.trend === "up" ? "+" : video.trend === "down" ? "-" : ""}
            {video.trendPercent}%
          </span>
        </div>
      </div>
    </Card>
  );
}

// Summary Stats Component
interface StatsSummaryProps {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgWatchTime: string;
  profileVisits: number;
  newFollowers: number;
}

export function VideoStatsSummary({ 
  totalViews, 
  totalLikes, 
  totalComments, 
  avgWatchTime,
  profileVisits,
  newFollowers 
}: StatsSummaryProps) {
  const stats = [
    { icon: Eye, label: "Total Views", value: formatNumber(totalViews), color: "from-purple-500 to-indigo-500" },
    { icon: Heart, label: "Total Likes", value: formatNumber(totalLikes), color: "from-pink-500 to-rose-500" },
    { icon: MessageCircle, label: "Comments", value: formatNumber(totalComments), color: "from-blue-500 to-cyan-500" },
    { icon: Clock, label: "Avg Watch", value: avgWatchTime, color: "from-amber-500 to-orange-500" },
    { icon: Users, label: "Profile Visits", value: formatNumber(profileVisits), color: "from-green-500 to-emerald-500" },
    { icon: TrendingUp, label: "New Followers", value: formatNumber(newFollowers), color: "from-violet-500 to-purple-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className={cn(
                "w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-r",
                stat.color
              )}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
