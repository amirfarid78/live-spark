import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Hash, Play, Users, TrendingUp, 
  Calendar, Music2, MoreVertical, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { api } from "@/lib/api";

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export default function HashtagPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  // Fetch hashtag details with videos
  const { data: hashtagData, isLoading } = useQuery({
    queryKey: ['hashtag', name],
    queryFn: () => api.get(`/hashtags/name/${name}/videos`),
    enabled: !!name,
  });

  const hashtag = hashtagData?.hashtag;
  const videos = hashtagData?.videos || [];
  const totalVideos = hashtagData?.total || 0;

  const handleParticipate = () => {
    // Navigate to video recorder with hashtag pre-selected
    navigate(`/create?hashtag=${name}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Hash className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  if (!hashtag) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Hash className="w-16 h-16 text-gray-500 mb-4" />
        <p className="text-gray-400">Hashtag not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  const isChallenge = hashtag.is_challenge;
  const isTrending = hashtag.trending_score > 50;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <span className="text-base font-medium">Hashtag</span>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Challenge/Hashtag Banner */}
      {hashtag.cover_url && (
        <div className="relative w-full aspect-[2/1] overflow-hidden">
          <img 
            src={hashtag.cover_url} 
            alt={hashtag.display_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
      )}

      {/* Hashtag Info */}
      <div className={cn(
        "px-4 pt-6 pb-4",
        hashtag.cover_url && "-mt-16 relative z-10"
      )}>
        <div className="flex items-start gap-4">
          {/* Hashtag icon */}
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg",
            isChallenge 
              ? "bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30"
              : "bg-gradient-to-br from-purple-600 to-pink-500 shadow-purple-500/30"
          )}>
            {isChallenge ? (
              <Flame className="w-10 h-10 text-white" />
            ) : (
              <Hash className="w-10 h-10 text-white" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">
              {hashtag.display_name || `#${hashtag.name}`}
            </h1>
            {hashtag.description && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {hashtag.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-xl font-bold">{formatNumber(hashtag.views_count || 0)}</p>
            <p className="text-xs text-gray-400">views</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{formatNumber(hashtag.usage_count || 0)}</p>
            <p className="text-xs text-gray-400">videos</p>
          </div>
          {isChallenge && hashtag.challenge_end_date && (
            <div className="text-center">
              <div className="flex items-center gap-1 text-orange-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(hashtag.challenge_end_date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-400">ends</p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mt-4">
          {isChallenge && (
            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Challenge
            </span>
          )}
          {hashtag.is_featured && (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
              Featured
            </span>
          )}
          {isTrending && (
            <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
        </div>

        {/* Associated Sound */}
        {hashtag.associated_sound_id && (
          <Link
            to={`/sound/${hashtag.associated_sound_id}`}
            className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Challenge Sound</p>
              <p className="text-xs text-gray-400">Use this sound to participate</p>
            </div>
            <Play className="w-5 h-5 text-gray-400" />
          </Link>
        )}

        {/* Participate button */}
        <Button 
          className={cn(
            "w-full mt-6 font-semibold",
            isChallenge 
              ? "bg-gradient-to-r from-orange-500 to-red-500"
              : "bg-gradient-to-r from-pink-500 to-purple-600"
          )}
          onClick={handleParticipate}
        >
          {isChallenge ? "Join Challenge" : "Create video"}
        </Button>
      </div>

      {/* Videos section */}
      <div className="flex-1 px-4 pb-20">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold">
            {isChallenge ? "Entries" : "Videos"} ({formatNumber(totalVideos)})
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{formatNumber(hashtag.usage_count || 0)} creators</span>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Play className="w-12 h-12 mb-3" />
            <p>No videos yet</p>
            <p className="text-sm mt-1">Be the first to use this hashtag!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {videos.map((video: any) => (
              <Link
                key={video.id}
                to={`/video/${video.id}`}
                className="relative aspect-[9/16] rounded-md overflow-hidden bg-gray-800 group"
              >
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                {/* Views overlay */}
                <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs">
                  <Play className="w-3 h-3 fill-white" />
                  <span>{formatNumber(video.views_count || 0)}</span>
                </div>
                {/* Creator avatar */}
                {video.user && (
                  <div className="absolute bottom-1 right-1">
                    <Avatar className="w-5 h-5 border border-white/30">
                      <AvatarImage src={video.user.avatar_url} />
                      <AvatarFallback className="text-[8px]">
                        {video.user.display_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
