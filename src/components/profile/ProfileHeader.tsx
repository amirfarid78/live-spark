import { useState } from "react";
import { Camera, Edit2, Share2, MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/hooks/useProfile";
import { format } from "date-fns";

interface ProfileHeaderProps {
  profile: Profile | null;
  userEmail?: string;
  onEditProfile?: () => void;
  onShare?: () => void;
}

const badges = [
  { icon: "⭐", label: "Top Creator", color: "from-amber-400 to-orange-500" },
  { icon: "🎁", label: "Generous", color: "from-pink-400 to-rose-500" },
  { icon: "✨", label: "Verified", color: "from-purple-400 to-indigo-500" },
];

const levelConfig = {
  bronze: { emoji: "🥉", color: "from-amber-600 to-amber-800", next: "silver", threshold: 100 },
  silver: { emoji: "🥈", color: "from-slate-300 to-slate-500", next: "gold", threshold: 500 },
  gold: { emoji: "🥇", color: "from-yellow-400 to-amber-500", next: "platinum", threshold: 2000 },
  platinum: { emoji: "🏆", color: "from-cyan-400 to-blue-500", next: "diamond", threshold: 10000 },
  diamond: { emoji: "💎", color: "from-purple-400 to-pink-500", next: null, threshold: null },
};

export function ProfileHeader({ profile, userEmail, onEditProfile, onShare }: ProfileHeaderProps) {
  const [coverLoaded, setCoverLoaded] = useState(false);
  
  const currentLevel = profile?.level || "bronze";
  const levelInfo = levelConfig[currentLevel];
  const joinDate = profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : null;

  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="relative h-32 sm:h-44 lg:h-56 overflow-hidden bg-gradient-primary">
        {profile?.cover_url ? (
          <img
            src={profile.cover_url}
            alt="Cover"
            className={cn(
              "w-full h-full object-cover transition-opacity duration-500",
              coverLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setCoverLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-accent/60">
            {/* Animated particles */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-float-slow" />
          </div>
        )}
        
        {/* Cover Edit Button */}
        <button className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60 transition-colors press-effect">
          <Camera className="h-4 w-4" />
        </button>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Avatar & Info Section */}
      <div className="relative px-4 sm:px-6 -mt-14 sm:-mt-16 lg:-mt-20">
        <div className="flex items-end gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36 ring-4 ring-background shadow-xl">
              <AvatarImage 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.display_name || 'User'}`} 
                alt={profile?.display_name || "User"} 
              />
              <AvatarFallback className="text-3xl sm:text-4xl lg:text-5xl bg-secondary">
                {(profile?.display_name || userEmail || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Edit Avatar Button */}
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-primary text-white shadow-lg press-effect">
              <Edit2 className="h-4 w-4" />
            </button>
            
            {/* Level Badge */}
            <div className={cn(
              "absolute -top-1 -right-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-sm sm:text-base font-bold shadow-lg ring-2 ring-background bg-gradient-to-r",
              levelInfo.color
            )}>
              {levelInfo.emoji}
            </div>
          </div>

          {/* Name & Username */}
          <div className="flex-1 min-w-0 pb-1 sm:pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                {profile?.display_name || "User"}
              </h1>
              {profile?.is_verified && (
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary text-white flex-shrink-0">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">@{profile?.username || "user"}</p>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-4 text-sm sm:text-base leading-relaxed max-w-2xl">
          {profile?.bio || "No bio yet. Tap Edit Profile to add one!"}
        </p>

        {/* Meta Info */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
          {joinDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {joinDate}
            </span>
          )}
          {profile?.is_online && (
            <span className="flex items-center gap-1 text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Online now
            </span>
          )}
        </div>

        {/* Badges */}
        {profile?.is_verified && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <div 
                key={badge.label}
                className={cn(
                  "flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1.5 text-white text-xs font-medium animate-fade-in-up shadow-sm",
                  badge.color,
                  `stagger-${index + 1}`
                )}
              >
                <span>{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <Button 
            onClick={onEditProfile}
            className="flex-1 sm:flex-none bg-gradient-primary hover:opacity-90 rounded-xl h-11 px-6 font-semibold shadow-lg shadow-primary/20"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button 
            variant="outline" 
            onClick={onShare}
            className="flex-1 sm:flex-none rounded-xl h-11 px-6 font-semibold"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
