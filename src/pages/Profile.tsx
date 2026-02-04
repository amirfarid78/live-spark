import { Link, useNavigate } from "react-router-dom";
import { Settings, LogOut, UserPlus, Grid3X3, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { WalletCards } from "@/components/profile/WalletCards";
import { LevelProgress } from "@/components/profile/LevelProgress";
import { QuickActions } from "@/components/profile/QuickActions";
import { VideoGrid } from "@/components/profile/VideoGrid";

const userVideos = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=400&fit=crop", views: "12K", likes: "1.2K", isPinned: true },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop", views: "8.5K", likes: "890" },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=300&h=400&fit=crop", views: "23K", likes: "2.3K" },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop", views: "5.2K", likes: "456" },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop", views: "15K", likes: "1.5K" },
  { id: 6, thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=400&fit=crop", views: "9.8K", likes: "980" },
  { id: 7, thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop", views: "18K", likes: "1.8K" },
  { id: 8, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=400&fit=crop", views: "32K", likes: "3.2K" },
];

export default function Profile() {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You've been signed out successfully" });
    navigate("/");
  };

  // Not logged in state
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <UserPlus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Join Snap Live</h2>
          <p className="text-muted-foreground text-center mb-6">
            Create an account to start streaming, follow creators, and connect with the community
          </p>
          <div className="flex gap-3 w-full max-w-xs">
            <Button asChild className="flex-1 bg-gradient-to-r from-stream-purple to-stream-coral">
              <Link to="/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Profile</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="flex-1 pb-24">
        {/* Profile Header with Cover */}
        <ProfileHeader 
          profile={profile}
          userEmail={user?.email}
          onEditProfile={() => toast({ title: "Edit Profile", description: "Profile editing coming soon!" })}
          onShare={() => toast({ title: "Share", description: "Share link copied!" })}
        />

        {/* Stats */}
        <ProfileStats 
          following={profile?.following_count || 0}
          followers={profile?.followers_count || 0}
          likes={profile?.likes_count || 0}
          className="mt-5 mx-4 rounded-xl bg-card/50"
        />

        {/* Wallet Cards */}
        <div className="px-4 mt-5">
          <WalletCards 
            coinsBalance={profile?.coins_balance || 0}
            diamondsBalance={profile?.diamonds_balance || 0}
            onTopUp={() => toast({ title: "Top Up", description: "Opening coin store..." })}
            onWithdraw={() => toast({ title: "Withdraw", description: "Withdrawal coming soon!" })}
          />
        </div>

        {/* Level Progress */}
        <div className="px-4 mt-5">
          <LevelProgress 
            level={profile?.level || "bronze"}
            currentXP={45}
          />
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-5">
          <QuickActions 
            followersCount={profile?.followers_count || 0}
            savedCount={0}
          />
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="videos" className="mt-6">
          <TabsList className="w-full justify-around border-b border-border bg-transparent h-14 rounded-none sticky top-[57px] z-30 glass">
            <TabsTrigger 
              value="videos" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
            >
              <Grid3X3 className="h-5 w-5" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
            >
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">Liked</span>
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2"
            >
              <Bookmark className="h-5 w-5" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-0">
            <VideoGrid 
              videos={userVideos}
              columns={isMobile ? 3 : 4}
            />
          </TabsContent>

          <TabsContent value="liked" className="mt-0 flex items-center justify-center py-16">
            <div className="text-center text-muted-foreground animate-fade-in">
              <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-semibold">Liked videos will appear here</p>
              <p className="text-sm mt-1">Videos you've liked will be saved here</p>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-0 flex items-center justify-center py-16">
            <div className="text-center text-muted-foreground animate-fade-in">
              <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Bookmark className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-semibold">Saved videos will appear here</p>
              <p className="text-sm mt-1">Bookmark videos to watch later</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
