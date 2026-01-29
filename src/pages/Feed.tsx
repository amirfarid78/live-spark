import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Plus, MoreHorizontal, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Video {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  description: string;
  song: string;
  likes: string;
  comments: string;
  shares: string;
  thumbnail: string;
}

const mockVideos: Video[] = [
  {
    id: 1,
    user: { name: "Sarah M.", username: "@sarahm", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", isVerified: true },
    description: "Late night vibes only 🌙✨ Follow for more! #nightlife #vibes #trending",
    song: "Original Sound - Sarah M.",
    likes: "124.5K",
    comments: "2,341",
    shares: "892",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=1000&fit=crop",
  },
  {
    id: 2,
    user: { name: "Alex Chen", username: "@alexchen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", isVerified: true },
    description: "This beat is 🔥🔥🔥 #music #producer #fyp",
    song: "Midnight Groove - DJ Alex",
    likes: "89.2K",
    comments: "1,567",
    shares: "445",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=1000&fit=crop",
  },
  {
    id: 3,
    user: { name: "Luna Dance", username: "@lunadance", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", isVerified: false },
    description: "New choreography just dropped 💃 What do you think? #dance #tutorial #foryou",
    song: "Dance With Me - Luna",
    likes: "256.8K",
    comments: "5,892",
    shares: "1,234",
    thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&h=1000&fit=crop",
  },
  {
    id: 4,
    user: { name: "Chef Mike", username: "@chefmike", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100", isVerified: true },
    description: "5-minute pasta recipe that will blow your mind 🍝 #cooking #recipe #foodtok",
    song: "Cooking Vibes - Lofi Beats",
    likes: "67.3K",
    comments: "3,421",
    shares: "2,156",
    thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=1000&fit=crop",
  },
];

interface VideoCardProps {
  video: Video;
  isActive: boolean;
}

function VideoCard({ video, isActive }: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative h-full w-full snap-start snap-always bg-black">
      {/* Video/Image Background */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => setIsPaused(!isPaused)}
      >
        <img
          src={video.thumbnail}
          alt={video.description}
          className="h-full w-full object-cover"
        />
        
        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/50 animate-scale-in">
              <Play className="h-10 w-10 text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="video-overlay absolute inset-0 pointer-events-none" />

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Profile */}
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-white">
            <AvatarImage src={video.user.avatar} />
            <AvatarFallback>{video.user.name[0]}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full transition-all",
              isFollowing 
                ? "bg-secondary text-secondary-foreground" 
                : "bg-stream-coral text-white"
            )}
          >
            <Plus className={cn("h-4 w-4 transition-transform", isFollowing && "rotate-45")} strokeWidth={3} />
          </button>
        </div>

        {/* Like */}
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="flex flex-col items-center gap-1 press-effect"
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all",
            isLiked && "animate-bounce-in"
          )}>
            <Heart 
              className={cn(
                "h-7 w-7 transition-colors",
                isLiked ? "text-stream-coral fill-stream-coral" : "text-white"
              )} 
            />
          </div>
          <span className="text-xs font-semibold text-white">{video.likes}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-white">{video.comments}</span>
        </button>

        {/* Bookmark */}
        <button 
          onClick={() => setIsSaved(!isSaved)}
          className="flex flex-col items-center gap-1 press-effect"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Bookmark 
              className={cn(
                "h-7 w-7 transition-colors",
                isSaved ? "text-stream-gold fill-stream-gold" : "text-white"
              )} 
            />
          </div>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-white">{video.shares}</span>
        </button>

        {/* Spinning Music Disc */}
        <div className="relative h-12 w-12">
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 p-1",
            isActive && !isPaused && "animate-spin-slow"
          )} style={{ animationDuration: '3s' }}>
            <div className="h-full w-full rounded-full overflow-hidden ring-2 ring-white/30 ring-inset">
              <img src={video.user.avatar} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-black" />
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-20 left-4 right-20 z-10">
        {/* Username */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-white text-base">
            {video.user.username}
          </span>
          {video.user.isVerified && (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-white text-sm mb-3 line-clamp-2">
          {video.description}
        </p>

        {/* Song */}
        <div className="flex items-center gap-2">
          <Music2 className="h-4 w-4 text-white" />
          <div className="overflow-hidden">
            <p className="text-white text-sm whitespace-nowrap animate-marquee">
              {video.song}
            </p>
          </div>
        </div>
      </div>

      {/* Top controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm press-effect"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm press-effect">
          <MoreHorizontal className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function Feed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      setActiveIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {mockVideos.map((video, index) => (
        <div key={video.id} className="h-screen w-full">
          <VideoCard video={video} isActive={index === activeIndex} />
        </div>
      ))}
    </div>
  );
}
