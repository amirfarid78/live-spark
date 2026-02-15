import { Link, useNavigate } from "react-router-dom";
import { Settings, LogOut, UserPlus, Grid3X3, Heart, Bookmark, Building2, Store, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { FollowersSheet } from "@/components/profile/FollowersSheet";
import { WalletCards } from "@/components/profile/WalletCards";
import { LevelProgress } from "@/components/profile/LevelProgress";
import { QuickActions } from "@/components/profile/QuickActions";
import { VideoGrid } from "@/components/profile/VideoGrid";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import api from "@/lib/api";

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function Profile() {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [followersSheetOpen, setFollowersSheetOpen] = useState(false);
  const [followersTab, setFollowersTab] = useState<"followers" | "following">("followers");

  const { data: myVideos = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${user?.id}/videos`],
    enabled: !!user?.id,
  });

  const { data: likedVideos = [], isLoading: likedLoading } = useQuery<any[]>({
    queryKey: ['/api/users', user?.id, 'liked-videos'],
    queryFn: async () => {
      const res = await api.get(`/users/${user?.id}/liked-videos`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  const { data: savedVideos = [], isLoading: savedLoading } = useQuery<any[]>({
    queryKey: ['/api/users', user?.id, 'saved-videos'],
    queryFn: async () => {
      const res = await api.get(`/users/${user?.id}/saved-videos`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You've been signed out successfully" });
    navigate("/");
  };

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
          <p className="text-muted-foreground text-center mb-6">Create an account to start streaming, follow creators, and connect with the community</p>
          <div className="flex gap-3 w-full max-w-xs">
            <Button asChild className="flex-1 bg-gradient-to-r from-stream-purple to-stream-coral"><Link to="/signup">Sign Up</Link></Button>
            <Button asChild variant="outline" className="flex-1"><Link to="/login">Log In</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3"><h1 className="text-xl font-bold">Profile</h1></div>
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
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Profile</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect" onClick={() => navigate("/settings")} data-testid="button-settings">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 pb-24">
        <ProfileHeader
          profile={profile}
          userEmail={user?.email}
          onEditProfile={() => setEditProfileOpen(true)}
          onShare={() => toast({ title: "Share", description: "Share link copied!" })}
        />

        <ProfileStats
          following={profile?.followingCount || 0}
          followers={profile?.followersCount || 0}
          likes={profile?.likesCount || 0}
          onFollowersClick={() => { setFollowersTab("followers"); setFollowersSheetOpen(true); }}
          onFollowingClick={() => { setFollowersTab("following"); setFollowersSheetOpen(true); }}
          className="mt-5 mx-4 rounded-xl bg-card/50"
        />

        <div className="px-4 mt-5">
          <WalletCards
            coinsBalance={profile?.coinsBalance || 0}
            diamondsBalance={profile?.diamondsBalance || 0}
            onTopUp={() => toast({ title: "Top Up", description: "Opening coin store..." })}
            onWithdraw={() => toast({ title: "Withdraw", description: "Withdrawal coming soon!" })}
          />
        </div>

        <div className="px-4 mt-5">
          <LevelProgress level={profile?.level || "bronze"} currentXP={45} />
        </div>

        {/* Agency & Store Quick Links */}
        <div className="px-4 mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/agency")}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 press-effect transition-all hover:shadow-lg"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Agency</p>
              <p className="text-[10px] text-muted-foreground">Join or manage</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/store-management")}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 press-effect transition-all hover:shadow-lg"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">My Store</p>
              <p className="text-[10px] text-muted-foreground">Products & orders</p>
            </div>
          </button>
        </div>

        <div className="px-4 mt-5">
          <QuickActions followersCount={profile?.followersCount || 0} savedCount={0} />
        </div>

        <Tabs defaultValue="videos" className="mt-6">
          <TabsList className="w-full justify-around border-b border-border bg-transparent h-14 rounded-none sticky top-[57px] z-30 glass">
            <TabsTrigger value="videos" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2">
              <Grid3X3 className="h-5 w-5" /><span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2">
              <Heart className="h-5 w-5" /><span className="hidden sm:inline">Liked</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2">
              <Bookmark className="h-5 w-5" /><span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-0">
            <VideoGrid 
              videos={myVideos.map((v: any) => ({
                id: v.id,
                thumbnail: v.thumbnailUrl || "",
                views: formatCount(v.viewsCount || 0),
                likes: formatCount(v.likesCount || 0),
              }))} 
              columns={isMobile ? 3 : 4} 
            />
          </TabsContent>
          <TabsContent value="liked" className="mt-0" data-testid="tab-liked-videos">
            {likedLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <VideoGrid 
                videos={likedVideos.map((v: any) => ({
                  id: v.id,
                  thumbnail: v.thumbnailUrl || v.thumbnail_url || "",
                  views: formatCount(v.viewsCount || v.views_count || 0),
                  likes: formatCount(v.likesCount || v.likes_count || 0),
                }))} 
                columns={isMobile ? 3 : 4} 
              />
            )}
          </TabsContent>
          <TabsContent value="saved" className="mt-0" data-testid="tab-saved-videos">
            {savedLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <VideoGrid 
                videos={savedVideos.map((v: any) => ({
                  id: v.id,
                  thumbnail: v.thumbnailUrl || v.thumbnail_url || "",
                  views: formatCount(v.viewsCount || v.views_count || 0),
                  likes: formatCount(v.likesCount || v.likes_count || 0),
                }))} 
                columns={isMobile ? 3 : 4} 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EditProfileDialog 
        isOpen={editProfileOpen} 
        onClose={() => setEditProfileOpen(false)} 
        profile={profile}
      />

      <FollowersSheet
        isOpen={followersSheetOpen}
        onClose={() => setFollowersSheetOpen(false)}
        userId={user?.id || 0}
        initialTab={followersTab}
      />
    </div>
  );
}
