import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Plus, Search, Radio, Users, MapPin, Sparkles, Play, Volume2, VolumeX, MoreHorizontal, Home, User, LogIn, TrendingUp, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CommentsSheet } from "@/components/video/CommentsSheet";
import { ShareSheet } from "@/components/video/ShareSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/logo.png";

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
  { id: "following", label: "Following" },
  { id: "foryou", label: "For You" },
  { id: "live", label: "LIVE", isLive: true },
];

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onAuthRequired: () => void;
  isAuthenticated: boolean;
  onOpenComments: (videoId: number, commentCount: string) => void;
  onOpenShare: (videoId: number) => void;
}

function VideoCard({ video, isActive, onAuthRequired, isAuthenticated, onOpenComments, onOpenShare }: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(false);

  const handleAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      onAuthRequired();
    } else {
      action();
    }
  };

  const handleDoubleTap = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!isLiked) {
      setIsLiked(true);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
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
        <button onClick={() => handleAuthAction(() => setIsLiked(!isLiked))} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <Heart className={cn("h-8 w-8 transition-all", isLiked ? "text-stream-coral fill-stream-coral scale-110" : "text-white drop-shadow-lg")} />
          </div>
          <span className="text-[11px] font-semibold text-white">{video.likes}</span>
        </button>

        {/* Comment */}
        <button onClick={() => onOpenComments(video.id, video.comments)} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <MessageCircle className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
          <span className="text-[11px] font-semibold text-white">{video.comments}</span>
        </button>

        {/* Bookmark */}
        <button onClick={() => handleAuthAction(() => setIsSaved(!isSaved))} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <Bookmark className={cn("h-7 w-7 transition-all", isSaved ? "text-stream-gold fill-stream-gold" : "text-white drop-shadow-lg")} />
          </div>
        </button>

        {/* Share */}
        <button onClick={() => onOpenShare(video.id)} className="flex flex-col items-center gap-0.5 press-effect">
          <div className="flex h-11 w-11 items-center justify-center">
            <Share2 className="h-7 w-7 text-white drop-shadow-lg" />
          </div>
          <span className="text-[11px] font-semibold text-white">{video.shares}</span>
        </button>

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
      <div className="absolute bottom-24 left-3 right-16 z-10">
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
            <button onClick={() => setIsMuted(!isMuted)} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm press-effect">
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-background rounded-t-3xl p-6 pb-safe animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
        
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

// Desktop Video Card Component
function DesktopVideoCard({ video, onOpenComments, onOpenShare, onAuthRequired, isAuthenticated }: {
  video: Video;
  onOpenComments: (videoId: number, commentCount: string) => void;
  onOpenShare: (videoId: number) => void;
  onAuthRequired: () => void;
  isAuthenticated: boolean;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      onAuthRequired();
    } else {
      action();
    }
  };

  return (
    <div className="flex gap-4 p-4 border-b border-border/50 hover:bg-secondary/30 transition-colors animate-fade-in-up">
      {/* Video Thumbnail */}
      <div className="relative w-[280px] aspect-[9/16] rounded-xl overflow-hidden bg-muted flex-shrink-0 group cursor-pointer">
        <img
          src={video.thumbnail}
          alt={video.description}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="h-7 w-7 text-white ml-1" fill="white" />
          </div>
        </div>
        {video.isLive && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full bg-stream-live px-2.5 py-1 shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-bold text-white">LIVE</span>
            </div>
          </div>
        )}
        {/* Music info */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full py-1 px-2.5 w-fit">
            <Music2 className="h-3 w-3 text-white" />
            <span className="text-white text-[10px] font-medium truncate max-w-[150px]">{video.song}</span>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="flex-1 py-2">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-11 w-11 ring-2 ring-primary/20">
            <AvatarImage src={video.user.avatar} />
            <AvatarFallback>{video.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px]">{video.user.name}</span>
              {video.user.isVerified && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{video.user.username}</span>
          </div>
          <Button 
            size="sm" 
            className="bg-stream-coral hover:bg-stream-coral/90 text-white rounded-lg font-semibold h-9 px-5"
            onClick={() => handleAuthAction(() => {})}
          >
            Follow
          </Button>
        </div>

        {/* Description */}
        <p className="text-[15px] mb-4 leading-relaxed">{video.description}</p>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => handleAuthAction(() => setIsLiked(!isLiked))}
            className="flex items-center gap-2 text-sm font-medium hover:text-stream-coral transition-colors"
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-stream-coral text-stream-coral")} />
            {video.likes}
          </button>
          <button 
            onClick={() => onOpenComments(video.id, video.comments)}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            {video.comments}
          </button>
          <button 
            onClick={() => handleAuthAction(() => setIsSaved(!isSaved))}
            className="flex items-center gap-2 text-sm font-medium hover:text-stream-gold transition-colors"
          >
            <Bookmark className={cn("h-5 w-5", isSaved && "fill-stream-gold text-stream-gold")} />
            Save
          </button>
          <button 
            onClick={() => onOpenShare(video.id)}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <Share2 className="h-5 w-5" />
            {video.shares}
          </button>
        </div>
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
  const [selectedVideoId, setSelectedVideoId] = useState<number>(0);
  const [selectedCommentCount, setSelectedCommentCount] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOpenComments = (videoId: number, commentCount: string) => {
    setSelectedVideoId(videoId);
    setSelectedCommentCount(commentCount);
    setCommentsOpen(true);
  };

  const handleOpenShare = (videoId: number) => {
    setSelectedVideoId(videoId);
    setShareOpen(true);
  };

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
    return (
      <div className="min-h-screen bg-background">
        {/* Comments Sheet */}
        <CommentsSheet 
          isOpen={commentsOpen} 
          onClose={() => setCommentsOpen(false)}
          videoId={selectedVideoId}
          commentCount={selectedCommentCount}
        />

        {/* Share Sheet */}
        <ShareSheet 
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          videoId={selectedVideoId}
        />

        {/* Auth Prompt Modal */}
        {showAuthPrompt && <AuthPrompt onClose={() => setShowAuthPrompt(false)} />}

        {/* Desktop Header */}
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">For You</h1>
              <p className="text-sm text-muted-foreground">Discover trending content</p>
            </div>
            <div className="flex gap-2">
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
                    "px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-gradient-primary text-white shadow-lg shadow-primary/20"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.label}
                    {tab.isLive && <span className="h-1.5 w-1.5 rounded-full bg-stream-live animate-pulse" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Desktop Video Feed */}
        <div className="max-w-4xl mx-auto">
          {mockVideos.map((video, index) => (
            <DesktopVideoCard
              key={video.id}
              video={video}
              onOpenComments={handleOpenComments}
              onOpenShare={handleOpenShare}
              onAuthRequired={() => setShowAuthPrompt(true)}
              isAuthenticated={!!user}
            />
          ))}
        </div>
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
        videoId={selectedVideoId}
        commentCount={selectedCommentCount}
      />

      {/* Share Sheet */}
      <ShareSheet 
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        videoId={selectedVideoId}
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
      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar" style={{ scrollSnapType: 'y mandatory' }}>
        {mockVideos.map((video, index) => (
          <div key={video.id} className="h-screen w-full">
            <VideoCard 
              video={video} 
              isActive={index === activeIndex}
              onAuthRequired={() => setShowAuthPrompt(true)}
              isAuthenticated={!!user}
              onOpenComments={handleOpenComments}
              onOpenShare={handleOpenShare}
            />
          </div>
        ))}
      </div>

      {/* Bottom Navigation - TikTok Style */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="relative bg-black border-t border-white/5">
          <div className="flex items-center justify-around h-[50px] pb-safe">
            <Link to="/" className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 press-effect">
              <Home className="h-6 w-6 text-white" fill="white" />
              <span className="text-[10px] font-semibold text-white">Home</span>
            </Link>
            
            <Link to="/discover" className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 press-effect">
              <Search className="h-6 w-6 text-white/60" />
              <span className="text-[10px] font-medium text-white/60">Discover</span>
            </Link>

            <Link to="/create" className="flex items-center justify-center py-2 px-4">
              <div className="relative">
                <div className="absolute inset-0 flex rounded-lg overflow-hidden">
                  <div className="w-1/2 bg-stream-cyan" />
                  <div className="w-1/2 bg-stream-coral" />
                </div>
                <div className="relative flex h-8 w-12 items-center justify-center bg-white rounded-lg m-[2px]">
                  <Plus className="h-5 w-5 text-black" strokeWidth={2.5} />
                </div>
              </div>
            </Link>

            <Link to="/messages" className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 press-effect relative">
              <MessageCircle className="h-6 w-6 text-white/60" />
              <span className="text-[10px] font-medium text-white/60">Inbox</span>
              <span className="absolute top-1 right-1/4 flex h-4 min-w-4 items-center justify-center rounded-full bg-stream-coral text-[9px] font-bold text-white px-1">
                3
              </span>
            </Link>

            <Link to="/profile" className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 press-effect">
              <div className="h-6 w-6 rounded-full overflow-hidden ring-1 ring-white/50">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50" 
                  alt="" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <span className="text-[10px] font-medium text-white/60">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
