import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Plus, MoreHorizontal, Play, Pause, Volume2, VolumeX, Search, Radio, Users, MapPin, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
  isLive?: boolean;
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
  {
    id: 5,
    user: { name: "ProGamer", username: "@progamer", avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100", isVerified: true },
    description: "Insane clutch in ranked! 🎮🔥 #gaming #esports #clutch",
    song: "Gaming Anthem - Beat Drop",
    likes: "342.1K",
    comments: "8,234",
    shares: "3,567",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=1000&fit=crop",
    isLive: true,
  },
];

const feedTabs = [
  { id: "following", label: "Following", icon: Users },
  { id: "foryou", label: "For You", icon: Sparkles },
  { id: "nearby", label: "Nearby", icon: MapPin },
  { id: "live", label: "Live", icon: Radio },
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
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }
  };

  return (
    <div className="relative h-full w-full snap-start snap-always bg-black">
      {/* Video/Image Background */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => setIsPaused(!isPaused)}
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={video.thumbnail}
          alt={video.description}
          className="h-full w-full object-cover"
        />
        
        {/* Double tap heart animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart 
              className="h-32 w-32 text-white animate-bounce-in" 
              fill="white"
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }}
            />
          </div>
        )}
        
        {/* Pause indicator */}
        {isPaused && !showHeart && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm animate-scale-in">
              <Play className="h-10 w-10 text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="video-overlay absolute inset-0 pointer-events-none" />

      {/* Live Badge */}
      {video.isLive && (
        <div className="absolute left-4 top-20 z-20">
          <div className="flex items-center gap-2 rounded-full bg-stream-live/90 backdrop-blur-sm px-3 py-1.5 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold text-white">LIVE</span>
            <span className="text-xs text-white/80">12.3K</span>
          </div>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4 z-10">
        {/* Profile */}
        <div className="relative mb-2">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-xl">
              <AvatarImage src={video.user.avatar} />
              <AvatarFallback>{video.user.name[0]}</AvatarFallback>
            </Avatar>
            {video.user.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-black">
                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={cn(
              "absolute -bottom-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full transition-all shadow-lg",
              isFollowing 
                ? "bg-white/20 backdrop-blur-sm" 
                : "bg-stream-coral"
            )}
          >
            <Plus className={cn(
              "h-4 w-4 text-white transition-transform", 
              isFollowing && "rotate-45"
            )} strokeWidth={3} />
          </button>
        </div>

        {/* Like */}
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="flex flex-col items-center gap-1 press-effect"
        >
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full transition-all",
            isLiked ? "scale-110" : "bg-white/10 backdrop-blur-sm"
          )}>
            <Heart 
              className={cn(
                "h-7 w-7 transition-all",
                isLiked ? "text-stream-coral fill-stream-coral scale-110" : "text-white"
              )} 
            />
          </div>
          <span className="text-[11px] font-semibold text-white drop-shadow-md">{video.likes}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-[11px] font-semibold text-white drop-shadow-md">{video.comments}</span>
        </button>

        {/* Bookmark */}
        <button 
          onClick={() => setIsSaved(!isSaved)}
          className="flex flex-col items-center gap-1 press-effect"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Bookmark 
              className={cn(
                "h-6 w-6 transition-all",
                isSaved ? "text-stream-gold fill-stream-gold" : "text-white"
              )} 
            />
          </div>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1 press-effect">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-[11px] font-semibold text-white drop-shadow-md">{video.shares}</span>
        </button>

        {/* Spinning Music Disc */}
        <div className="relative h-11 w-11 mt-1">
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 p-[3px] shadow-xl",
            isActive && !isPaused && "animate-spin-slow"
          )}>
            <div className="h-full w-full rounded-full overflow-hidden ring-1 ring-white/20">
              <img src={video.user.avatar} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-3 w-3 rounded-full bg-gray-900 ring-1 ring-white/30" />
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-20 left-4 right-20 z-10">
        {/* Username */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-white text-[15px] drop-shadow-lg">
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
        <p className="text-white text-[13px] mb-3 line-clamp-2 drop-shadow-lg leading-relaxed">
          {video.description}
        </p>

        {/* Song */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full py-1.5 px-3 w-fit">
          <Music2 className="h-3.5 w-3.5 text-white" />
          <div className="overflow-hidden max-w-[200px]">
            <p className="text-white text-xs font-medium whitespace-nowrap">
              {video.song}
            </p>
          </div>
        </div>
      </div>

      {/* Top controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pt-safe">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md press-effect"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md press-effect">
          <Search className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function Feed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("foryou");
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
    <div className="relative h-screen w-full bg-black">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-safe">
        <div className="flex items-center justify-center gap-1 py-3 px-4">
          {feedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2 text-sm font-semibold transition-all press-effect",
                activeTab === tab.id 
                  ? "text-white" 
                  : "text-white/60"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-white" />
              )}
              {tab.id === "live" && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-stream-live animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Feed */}
      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {mockVideos.map((video, index) => (
          <div key={video.id} className="h-screen w-full">
            <VideoCard video={video} isActive={index === activeIndex} />
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="flex items-center justify-around py-2 pb-safe bg-black/80 backdrop-blur-lg border-t border-white/10">
          <Link to="/" className="flex flex-col items-center gap-0.5 px-6 py-2 text-white press-effect">
            <Sparkles className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link to="/discover" className="flex flex-col items-center gap-0.5 px-6 py-2 text-white/60 press-effect">
            <Search className="h-6 w-6" />
            <span className="text-[10px] font-medium">Discover</span>
          </Link>
          <Link to="/create" className="flex flex-col items-center justify-center -mt-4">
            <div className="flex h-12 w-14 items-center justify-center rounded-xl bg-white overflow-hidden">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-stream-cyan via-white to-stream-coral">
                <Plus className="h-7 w-7 text-black" strokeWidth={2.5} />
              </div>
            </div>
          </Link>
          <Link to="/messages" className="flex flex-col items-center gap-0.5 px-6 py-2 text-white/60 press-effect relative">
            <MessageCircle className="h-6 w-6" />
            <span className="text-[10px] font-medium">Inbox</span>
            <span className="absolute top-1 right-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-stream-coral text-[9px] font-bold text-white px-1">
              3
            </span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-0.5 px-6 py-2 text-white/60 press-effect">
            <div className="h-6 w-6 rounded-full bg-white/20 overflow-hidden ring-1 ring-white/30">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50" alt="" className="h-full w-full object-cover" />
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
