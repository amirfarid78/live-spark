import React, { useState, useRef, useEffect, useCallback } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Plus, Search, Radio, Users, MapPin, Sparkles, Play, Volume2, VolumeX, MoreHorizontal, User, LogIn, TrendingUp, ChevronRight, ChevronUp, ChevronDown, Gift, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CommentsSheet } from "@/components/video/CommentsSheet";
import { ShareSheet } from "@/components/video/ShareSheet";
import { GiftSheet } from "@/components/video/GiftSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVideoFeed, useVideoLike, useVideoSave } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import api from "@/lib/api";

interface Video {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  description: string;
  song: string;
  likes: string;
  likesCount: number;
  comments: string;
  commentsCount: number;
  shares: string;
  sharesCount: number;
  thumbnail: string;
  videoUrl: string;
  isLive?: boolean;
  hashtags?: string[];
  isLiked: boolean;
  isSaved: boolean;
}



const feedTabs = [
  { id: "following", label: "Following" },
  { id: "foryou", label: "For You" },
  { id: "live", label: "LIVE", isLive: true },
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onAuthRequired: () => void;
  isAuthenticated: boolean;
  onOpenComments: (videoId: string, commentCount: string) => void;
  onOpenShare: (videoId: string) => void;
  onLike: (videoId: string) => void;
  onSave: (videoId: string) => void;
  onDownload: (videoUrl: string, videoId: string) => void;
  onOpenGift?: (videoId: string) => void;
}

function VideoCard({ video, isActive, onAuthRequired, isAuthenticated, onOpenComments, onOpenShare, onLike, onSave, onDownload, onOpenGift }: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [isSaved, setIsSaved] = useState(video.isSaved);
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync with prop changes
  useEffect(() => {
    setIsLiked(video.isLiked);
    setIsSaved(video.isSaved);
    setLikesCount(video.likesCount);
  }, [video.isLiked, video.isSaved, video.likesCount]);

  // Auto-play/pause based on active state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      setIsPaused(false);
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {
        videoEl.muted = true;
        setIsMuted(true);
        videoEl.play().catch(() => {});
      });
    } else {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  }, [isActive]);

  // Handle tap-to-pause/resume
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !isActive) return;

    if (isPaused) {
      videoEl.pause();
    } else {
      videoEl.play().catch(() => {});
    }
  }, [isPaused, isActive]);

  const handleAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      onAuthRequired();
    } else {
      action();
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike(video.id);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    // Optimistic update
    setIsSaved(!isSaved);
    onSave(video.id);
  };

  const handleDoubleTap = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(likesCount + 1);
      setShowHeart(true);
      onLike(video.id);
      setTimeout(() => setShowHeart(false), 800);
    }
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="relative h-full w-full snap-start snap-always bg-black">
      {/* Video/Image Background */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlayPause}
        onDoubleClick={handleDoubleTap}
      >
        {video.videoUrl ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnail}
            className="h-full w-full object-cover"
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={video.thumbnail}
            alt={video.description}
            className="h-full w-full object-cover"
          />
        )}
        
        {/* Double tap heart animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart 
              className="h-28 w-28 text-stream-coral animate-bounce-in" 
              fill="currentColor"
              style={{ filter: 'drop-shadow(0 0 30px rgba(249, 115, 22, 0.6))' }}
            />
          </div>
        )}
        
        {/* Pause indicator */}
        {isPaused && !showHeart && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/30 backdrop-blur-md animate-scale-in">
              <Play className="h-10 w-10 text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="video-overlay absolute inset-0 pointer-events-none" />

      {/* Live Badge */}
      {video.isLive && (
        <div className="absolute left-4 top-24 z-20">
          <div className="flex items-center gap-2 rounded-lg bg-stream-live px-3 py-1.5 shadow-lg shadow-stream-live/50">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">LIVE</span>
          </div>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-2 bottom-32 flex flex-col items-center gap-3 z-10">
        {/* Profile */}
        <div className="relative mb-1">
          <Avatar className="h-12 w-12 ring-[2.5px] ring-white shadow-xl">
            <AvatarImage src={video.user.avatar} />
            <AvatarFallback>{video.user.name[0]}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => handleAuthAction(() => setIsFollowing(!isFollowing))}
            className={cn(
              "absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full transition-all shadow-lg",
              isFollowing ? "bg-white/20 backdrop-blur-sm" : "bg-stream-coral"
            )}
          >
            <Plus className={cn("h-3.5 w-3.5 text-white transition-transform", isFollowing && "rotate-45")} strokeWidth={3} />
          </button>
        </div>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <Heart className={cn("h-8 w-8 transition-all", isLiked ? "text-stream-coral fill-stream-coral scale-110" : "text-white drop-shadow-lg")} />
          </div>
          <span className="text-[11px] font-semibold text-white">{formatCount(likesCount)}</span>
        </button>

        {/* Comment */}
        <button onClick={() => onOpenComments(video.id, video.comments)} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <MessageCircle className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
          <span className="text-[11px] font-semibold text-white">{video.comments}</span>
        </button>

        {/* Bookmark */}
        <button onClick={handleSave} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <Bookmark className={cn("h-7 w-7 transition-all", isSaved ? "text-stream-gold fill-stream-gold" : "text-white drop-shadow-lg")} />
          </div>
        </button>

        {/* Gift */}
        <button onClick={() => handleAuthAction(() => onOpenGift?.(video.id))} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <Gift className="h-7 w-7 text-white drop-shadow-lg" />
          </div>
        </button>

        {/* Share */}
        <button onClick={() => onOpenShare(video.id)} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <Share2 className="h-7 w-7 text-white drop-shadow-lg" />
          </div>
          <span className="text-[11px] font-semibold text-white">{video.shares}</span>
        </button>

        {/* Download */}
        {video.videoUrl && (
          <button onClick={() => onDownload(video.videoUrl, video.id)} className="flex flex-col items-center gap-0.5 press-effect">
            <div className="flex h-11 w-11 items-center justify-center">
              <Download className="h-7 w-7 text-white drop-shadow-lg" />
            </div>
          </button>
        )}

        {/* Spinning Music Disc */}
        <div className="relative h-10 w-10 mt-2">
          <div className={cn("absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-black p-[3px] shadow-xl", isActive && !isPaused && "animate-spin-slow")}>
            <div className="h-full w-full rounded-full overflow-hidden">
              <img src={video.user.avatar} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-2.5 w-2.5 rounded-full bg-black" />
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-20 left-3 right-16 z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-bold text-white text-[15px]">{video.user.username}</span>
          {video.user.isVerified && (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#20D5EC]">
              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <p className="text-white text-[13px] mb-2 line-clamp-2 leading-[1.4]">{video.description}</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-full py-1 px-2.5">
            <Music2 className="h-3 w-3 text-white" />
            <span className="text-white text-[11px] font-medium">{video.song}</span>
          </div>
        </div>
      </div>

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/live" className="flex h-9 w-9 items-center justify-center rounded-full press-effect">
            <Radio className="h-6 w-6 text-white drop-shadow-lg" />
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm press-effect">
              {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm press-effect">
              <Search className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Auth Prompt Modal
function AuthPrompt({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-background rounded-t-3xl lg:rounded-3xl p-6 pb-safe animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 lg:hidden" />
        
        <div className="text-center mb-6">
          <img 
            src={logo} 
            alt="Snap Live" 
            className="h-16 w-16 rounded-2xl mx-auto mb-4 shadow-lg"
          />
          <h2 className="text-xl font-bold mb-2">Join Snap Live</h2>
          <p className="text-muted-foreground">Sign up to like, comment, follow creators and more!</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/signup')}
            className="w-full h-14 rounded-2xl bg-gradient-primary hover:opacity-90 text-white font-semibold text-lg"
          >
            Create Account
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/login')}
            className="w-full h-14 rounded-2xl font-semibold text-lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In
          </Button>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-4 py-3 text-muted-foreground text-sm"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

// Desktop Video Player Component - Centered vertical video with side actions
function DesktopVideoPlayer({ 
  video, 
  onPrev, 
  onNext, 
  hasPrev, 
  hasNext,
  onOpenComments,
  onOpenShare,
  onAuthRequired,
  isAuthenticated,
  onLike,
  onSave,
  onDownload,
  onOpenGift
}: {
  video: Video;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onOpenComments: (videoId: string, commentCount: string) => void;
  onOpenShare: (videoId: string) => void;
  onAuthRequired: () => void;
  isAuthenticated: boolean;
  onLike: (videoId: string) => void;
  onSave: (videoId: string) => void;
  onDownload: (videoUrl: string, videoId: string) => void;
  onOpenGift: (videoId: string) => void;
}) {
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [isSaved, setIsSaved] = useState(video.isSaved);
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync state when video changes
  useEffect(() => {
    setIsLiked(video.isLiked);
    setIsSaved(video.isSaved);
    setLikesCount(video.likesCount);
  }, [video.id, video.isLiked, video.isSaved, video.likesCount]);

  // Auto-play when video changes
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.currentTime = 0;
    if (!isPaused) {
      videoEl.play().catch(() => {
        videoEl.muted = true;
        videoEl.play().catch(() => {});
      });
    }
  }, [video.id]);

  // Handle play/pause
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isPaused) {
      videoEl.pause();
    } else {
      videoEl.play().catch(() => {});
    }
  }, [isPaused]);

  // Handle mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      onAuthRequired();
    } else {
      action();
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike(video.id);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    setIsSaved(!isSaved);
    onSave(video.id);
  };

  return (
    <div className="flex items-center justify-center gap-6 h-full">
      {/* Video Container - Phone-like aspect ratio */}
      <div className="relative w-[380px] h-[680px] rounded-3xl overflow-hidden bg-black shadow-2xl shadow-black/50 ring-1 ring-white/10">
        {/* Mute button */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
          {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
        </button>

        {/* Video Content */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={() => setIsPaused(!isPaused)}
        >
          {video.videoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnail}
              className="h-full w-full object-cover"
              loop
              muted={isMuted}
              playsInline
              autoPlay
            />
          ) : (
            <img
              src={video.thumbnail}
              alt={video.description}
              className="h-full w-full object-cover"
            />
          )}
          
          {/* Pause indicator */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                <Play className="h-10 w-10 text-white ml-1" fill="white" />
              </div>
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Live Badge */}
        {video.isLive && (
          <div className="absolute left-4 top-4 z-20">
            <div className="flex items-center gap-2 rounded-lg bg-stream-live px-3 py-1.5 shadow-lg">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold text-white">LIVE</span>
            </div>
          </div>
        )}

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-11 w-11 ring-2 ring-white/50">
              <AvatarImage src={video.user.avatar} />
              <AvatarFallback>{video.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">{video.user.name}</span>
                {video.user.isVerified && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-sm text-white/70">{video.user.username}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-white text-sm mb-3 line-clamp-2">{video.description}</p>

          {/* Hashtags */}
          {video.hashtags && video.hashtags.length > 0 && (
            <div className="flex gap-2">
              {video.hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/10 text-white border-0 backdrop-blur-sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex flex-col items-center gap-4">
        {/* Gift */}
        <button 
          onClick={() => handleAuthAction(() => onOpenGift(video.id))}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 shadow-lg transition-transform group-hover:scale-110">
            <Gift className="h-6 w-6 text-white" />
          </div>
        </button>

        {/* Like */}
        <button 
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all group-hover:scale-110",
            isLiked ? "bg-stream-coral" : "bg-secondary"
          )}>
            <Heart className={cn("h-6 w-6", isLiked ? "text-white fill-white" : "text-muted-foreground")} />
          </div>
          <span className="text-xs text-muted-foreground">{formatCount(likesCount)}</span>
        </button>

        {/* Comment */}
        <button 
          onClick={() => onOpenComments(video.id, video.comments)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary transition-transform group-hover:scale-110">
            <MessageCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">{video.comments}</span>
        </button>

        {/* Save */}
        <button 
          onClick={handleSave}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all group-hover:scale-110",
            isSaved ? "bg-stream-gold" : "bg-secondary"
          )}>
            <Bookmark className={cn("h-6 w-6", isSaved ? "text-white fill-white" : "text-muted-foreground")} />
          </div>
        </button>

        {/* Share */}
        <button 
          onClick={() => onOpenShare(video.id)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary transition-transform group-hover:scale-110">
            <Share2 className="h-6 w-6 text-muted-foreground" />
          </div>
        </button>

        {/* Download */}
        {video.videoUrl && (
          <button 
            onClick={() => onDownload(video.videoUrl, video.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary transition-transform group-hover:scale-110">
              <Download className="h-6 w-6 text-muted-foreground" />
            </div>
          </button>
        )}

        {/* User Avatar */}
        <Avatar className="h-12 w-12 ring-2 ring-primary/50 cursor-pointer hover:scale-110 transition-transform">
          <AvatarImage src={video.user.avatar} />
          <AvatarFallback>{video.user.name[0]}</AvatarFallback>
        </Avatar>
      </div>

      {/* Navigation Arrows */}
      <div className="flex flex-col gap-3 ml-4">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all",
            hasPrev 
              ? "bg-secondary hover:bg-secondary/80 cursor-pointer" 
              : "bg-secondary/30 cursor-not-allowed"
          )}
        >
          <ChevronUp className={cn("h-6 w-6", hasPrev ? "text-foreground" : "text-muted-foreground/50")} />
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all",
            hasNext 
              ? "bg-secondary hover:bg-secondary/80 cursor-pointer" 
              : "bg-secondary/30 cursor-not-allowed"
          )}
        >
          <ChevronDown className={cn("h-6 w-6", hasNext ? "text-foreground" : "text-muted-foreground/50")} />
        </button>
      </div>
    </div>
  );
}

export default function Feed() {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("foryou");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftVideoId, setGiftVideoId] = useState<string>("");
  const [giftRecipientId, setGiftRecipientId] = useState<number | undefined>();
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [selectedCommentCount, setSelectedCommentCount] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const navigate = useNavigate();
  const { user } = useAuth();

  // API hooks
  const { data: feedData, isLoading: feedLoading, refetch: refetchFeed } = useVideoFeed(1);
  const likeMutation = useVideoLike();
  const saveMutation = useVideoSave();
  const viewedVideosRef = useRef<Set<string>>(new Set());

  // Map API data to Video format
  const videos: Video[] = (feedData?.items || feedData?.data || (Array.isArray(feedData) ? feedData : []))?.map((v: any) => ({
    id: String(v.id),
    user: {
      name: v.user?.displayName || v.user?.display_name || v.user?.username || 'User',
      username: `@${v.user?.username || 'user'}`,
      avatar: v.user?.avatarUrl || v.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.userId || v.user_id}`,
      isVerified: v.user?.isVerified || v.user?.is_verified || false,
    },
    description: v.description || v.caption || '',
    song: v.songName || v.music_name || v.music_title || 'Original Sound',
    likes: formatCount(v.likesCount || v.likes_count || 0),
    likesCount: v.likesCount || v.likes_count || 0,
    comments: formatCount(v.commentsCount || v.comments_count || 0),
    commentsCount: v.commentsCount || v.comments_count || 0,
    shares: formatCount(v.sharesCount || v.shares_count || 0),
    sharesCount: v.sharesCount || v.shares_count || 0,
    thumbnail: v.thumbnailUrl || v.thumbnail_url || '',
    videoUrl: v.videoUrl || v.video_url || '',
    isLive: false,
    hashtags: v.hashtags || [],
    isLiked: v.isLiked || v.is_liked || false,
    isSaved: v.isSaved || v.is_saved || false,
  })) ?? [];

  // Handle like
  const handleLike = useCallback((videoId: string) => {
    likeMutation.mutate(videoId, {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update like. Please try again.",
          variant: "destructive",
        });
      },
    });
  }, [likeMutation]);

  // Handle save
  const handleSave = useCallback((videoId: string) => {
    saveMutation.mutate(videoId, {
      onSuccess: (data: any) => {
        toast({
          title: data?.saved ? "Saved" : "Removed",
          description: data?.saved ? "Video saved to your collection" : "Video removed from saved",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to save video. Please try again.",
          variant: "destructive",
        });
      },
    });
  }, [saveMutation]);

  // View tracking with 2-second debounce
  useEffect(() => {
    if (videos.length === 0) return;
    const currentVideo = videos[activeIndex];
    if (!currentVideo || viewedVideosRef.current.has(currentVideo.id)) return;
    
    const timer = setTimeout(() => {
      viewedVideosRef.current.add(currentVideo.id);
      api.post(`/videos/${currentVideo.id}/view`).catch(() => {});
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [activeIndex, videos]);

  // Handle download
  const handleDownload = useCallback(async (videoUrl: string, videoId: string) => {
    if (!videoUrl) {
      toast({
        title: "Error",
        description: "Video not available for download",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({ title: "Downloading...", description: "Your video is being downloaded" });
      
      // Fetch the video
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `livespark-${videoId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "Downloaded!", description: "Video saved to your device" });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download video. Try again later.",
        variant: "destructive",
      });
    }
  }, []);

  const handleOpenComments = (videoId: string, commentCount: string) => {
    setSelectedVideoId(videoId);
    setSelectedCommentCount(commentCount);
    setCommentsOpen(true);
  };

  const handleOpenShare = (videoId: string) => {
    setSelectedVideoId(videoId);
    setShareOpen(true);
    api.post(`/videos/${videoId}/share`).catch(() => {});
  };

  const handleGift = useCallback((videoId: string) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    setGiftVideoId(videoId);
    const video = videos.find(v => v.id === videoId);
    setGiftRecipientId(video ? parseInt(video.id) : undefined);
    setGiftOpen(true);
  }, [user, videos]);

  // IntersectionObserver to detect which video is in view
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      }
    );

    // Observe all video containers
    videoRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMobile, videoRefs.current.size]);

  const handlePrevVideo = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNextVideo = () => {
    if (activeIndex < videos.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  // Keyboard navigation for desktop
  useEffect(() => {
    if (isMobile) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevVideo();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNextVideo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, activeIndex]);

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

  // Desktop Layout
  if (!isMobile) {
    if (feedLoading) {
      return (
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </div>
      );
    }

    if (videos.length === 0) {
      return (
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">No videos yet</p>
            <p className="text-muted-foreground">Be the first to create content!</p>
          </div>
        </div>
      );
    }

    const currentVideo = videos[activeIndex];

    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Comments Sheet */}
        <CommentsSheet 
          isOpen={commentsOpen} 
          onClose={() => setCommentsOpen(false)}
          videoId={Number(selectedVideoId) || 0}
          commentCount={selectedCommentCount}
        />

        {/* Share Sheet */}
        <ShareSheet 
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          videoId={Number(selectedVideoId) || 0}
        />

        {/* Gift Sheet */}
        <GiftSheet
          isOpen={giftOpen}
          onClose={() => setGiftOpen(false)}
          videoId={parseInt(giftVideoId) || 0}
          recipientId={giftRecipientId}
        />

        {/* Auth Prompt Modal */}
        {showAuthPrompt && <AuthPrompt onClose={() => setShowAuthPrompt(false)} />}

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-6">
          <DesktopVideoPlayer
            video={currentVideo}
            onPrev={handlePrevVideo}
            onNext={handleNextVideo}
            hasPrev={activeIndex > 0}
            hasNext={activeIndex < videos.length - 1}
            onOpenComments={handleOpenComments}
            onOpenShare={handleOpenShare}
            onAuthRequired={() => setShowAuthPrompt(true)}
            isAuthenticated={!!user}
            onLike={handleLike}
            onSave={handleSave}
            onDownload={handleDownload}
            onOpenGift={handleGift}
          />
        </div>

        {/* Login Button - Fixed bottom right */}
        {!user && (
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              onClick={() => navigate('/login')}
              className="bg-gradient-primary text-white rounded-full h-12 px-6 gap-2 shadow-lg shadow-primary/30"
            >
              <LogIn className="h-5 w-5" />
              Login
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Mobile Layout (Original)
  return (
    <div className="relative h-screen w-full bg-black">
      {/* Comments Sheet */}
      <CommentsSheet 
        isOpen={commentsOpen} 
        onClose={() => setCommentsOpen(false)}
        videoId={Number(selectedVideoId) || 0}
        commentCount={selectedCommentCount}
      />

      {/* Share Sheet */}
      <ShareSheet 
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        videoId={Number(selectedVideoId) || 0}
      />

      {/* Gift Sheet */}
      <GiftSheet
        isOpen={giftOpen}
        onClose={() => setGiftOpen(false)}
        videoId={parseInt(giftVideoId) || 0}
        recipientId={giftRecipientId}
      />

      {/* Auth Prompt Modal */}
      {showAuthPrompt && <AuthPrompt onClose={() => setShowAuthPrompt(false)} />}

      {/* Top Navigation Tabs */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-safe">
        <div className="flex items-center justify-center gap-5 py-3">
          {feedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "live") {
                  navigate("/live");
                } else if (tab.id === "following" && !user) {
                  setShowAuthPrompt(true);
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={cn(
                "relative py-1 text-[15px] font-semibold transition-all press-effect",
                activeTab === tab.id ? "text-white" : "text-white/50"
              )}
            >
              <span className="flex items-center gap-1">
                {tab.label}
                {tab.isLive && <span className="h-1.5 w-1.5 rounded-full bg-stream-live animate-pulse" />}
              </span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Feed */}
      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar overscroll-y-contain" style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}>
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="h-screen w-full"
            data-index={index}
            ref={(el) => {
              if (el) videoRefs.current.set(index, el);
              else videoRefs.current.delete(index);
            }}
          >
            <VideoCard 
              video={video} 
              isActive={index === activeIndex}
              onAuthRequired={() => setShowAuthPrompt(true)}
              isAuthenticated={!!user}
              onOpenComments={handleOpenComments}
              onOpenShare={handleOpenShare}
              onLike={handleLike}
              onSave={handleSave}
              onDownload={handleDownload}
              onOpenGift={handleGift}
            />
          </div>
        ))}
      </div>

    </div>
  );
}
