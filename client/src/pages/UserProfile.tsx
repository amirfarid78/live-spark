import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Share2, MoreHorizontal, Grid3X3, Heart, Play, CheckCircle2, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = parseInt(id || "0");

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    enabled: userId > 0,
  });

  const { data: userVideos = [], isLoading: videosLoading } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "videos"],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/videos`);
      return res.data;
    },
    enabled: userId > 0,
  });

  const { data: likedVideos = [] } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "liked-videos"],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/liked-videos`);
      return res.data;
    },
    enabled: userId > 0 && currentUser?.id === userId,
  });

  const { data: followers = [] } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "followers"],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/followers`);
      return res.data;
    },
    enabled: userId > 0,
  });

  const { data: following = [] } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "following"],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/following`);
      return res.data;
    },
    enabled: userId > 0,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (profile?.isFollowing) {
        await api.delete(`/users/${userId}/follow`);
      } else {
        await api.post(`/users/${userId}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "followers"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to update follow", variant: "destructive" });
    },
  });

  const handleMessage = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    try {
      const res = await api.post("/conversations/direct", { targetUserId: userId });
      navigate("/messages", { state: { chatId: res.data.id, chatName: profile?.displayName || profile?.username } });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Could not start conversation", variant: "destructive" });
    }
  };

  const [showFollowersList, setShowFollowersList] = useState(false);
  const [followListTab, setFollowListTab] = useState<"followers" | "following">("followers");

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-5 w-32" />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-semibold">User not found</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          This account doesn't exist
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="button-back-profile">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg leading-tight" data-testid="text-profile-username">
                {profile.username}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({ title: "Copied", description: "Profile link copied" });
            }} data-testid="button-share-profile">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-more-profile">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 pb-24 overflow-y-auto">
        <div className="flex flex-col items-center pt-6 pb-4 px-4">
          <div className="relative mb-3">
            <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-offset-background ring-border">
              <AvatarImage src={profile.avatarUrl} alt={profile.displayName || profile.username} />
              <AvatarFallback className="text-2xl">{(profile.displayName || profile.username || "U")[0]}</AvatarFallback>
            </Avatar>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                <CheckCircle2 className="h-4 w-4 text-white" fill="currentColor" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold flex items-center gap-1.5" data-testid="text-display-name">
            {profile.displayName || profile.username}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="text-handle">@{profile.username}</p>

          {profile.bio && (
            <p className="text-sm text-center mt-3 max-w-xs leading-relaxed" data-testid="text-bio">{profile.bio}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-8 py-3">
          <button
            onClick={() => { setFollowListTab("following"); setShowFollowersList(true); }}
            className="text-center press-effect"
            data-testid="button-following-count"
          >
            <p className="text-lg font-bold">{formatCount(profile.followingCount || following.length || 0)}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
          <button
            onClick={() => { setFollowListTab("followers"); setShowFollowersList(true); }}
            className="text-center press-effect"
            data-testid="button-followers-count"
          >
            <p className="text-lg font-bold">{formatCount(profile.followersCount || followers.length || 0)}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <div className="text-center" data-testid="text-likes-count">
            <p className="text-lg font-bold">{formatCount(profile.likesCount || 0)}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
        </div>

        {!isOwnProfile && (
          <div className="flex items-center justify-center gap-3 py-4 px-4">
            <Button
              data-testid="button-follow-user"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={cn(
                "rounded-lg font-semibold h-10 px-8 min-w-[120px]",
                profile.isFollowing
                  ? "bg-secondary text-foreground"
                  : "bg-stream-coral text-white"
              )}
              variant={profile.isFollowing ? "outline" : "default"}
            >
              {followMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : profile.isFollowing ? (
                "Following"
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Follow
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="rounded-lg font-semibold h-10 px-6"
              onClick={handleMessage}
              data-testid="button-message-user"
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Message
            </Button>
          </div>
        )}

        {isOwnProfile && (
          <div className="flex items-center justify-center gap-3 py-4 px-4">
            <Button
              variant="outline"
              className="rounded-lg font-semibold h-10 px-8"
              onClick={() => navigate("/profile")}
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
          </div>
        )}

        <Tabs defaultValue="videos" className="mt-2">
          <TabsList className="w-full justify-around border-b border-border bg-transparent h-12 rounded-none">
            <TabsTrigger value="videos" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2" data-testid="tab-videos">
              <Grid3X3 className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full gap-2" data-testid="tab-liked">
              <Heart className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-0">
            {videosLoading ? (
              <div className="grid grid-cols-3 gap-0.5 p-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4]" />
                ))}
              </div>
            ) : userVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Grid3X3 className="h-12 w-12 mb-3 opacity-40" />
                <p className="font-medium">No videos yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 p-0.5">
                {userVideos.map((video: any) => (
                  <button
                    key={video.id}
                    className="relative aspect-[3/4] bg-muted overflow-hidden group"
                    data-testid={`video-thumbnail-${video.id}`}
                  >
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <video src={video.videoUrl} className="h-full w-full object-cover" muted preload="metadata" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-white text-xs">
                      <Play className="h-3 w-3" fill="white" />
                      <span className="font-semibold">{formatCount(video.viewsCount || 0)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-0">
            {isOwnProfile || currentUser?.id === userId ? (
              likedVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Heart className="h-12 w-12 mb-3 opacity-40" />
                  <p className="font-medium">No liked videos</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                  {likedVideos.map((video: any) => (
                    <button
                      key={video.id}
                      className="relative aspect-[3/4] bg-muted overflow-hidden group"
                      data-testid={`liked-video-${video.id}`}
                    >
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <video src={video.videoUrl} className="h-full w-full object-cover" muted preload="metadata" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-white text-xs">
                        <Play className="h-3 w-3" fill="white" />
                        <span className="font-semibold">{formatCount(video.viewsCount || 0)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Heart className="h-12 w-12 mb-3 opacity-40" />
                <p className="font-medium">Liked videos are private</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showFollowersList && (
        <div className="fixed inset-0 z-50 bg-background animate-fade-in flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Button variant="ghost" size="icon" onClick={() => setShowFollowersList(false)} data-testid="button-close-followers">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-bold text-lg">{profile.displayName || profile.username}</h2>
          </div>
          <Tabs value={followListTab} onValueChange={(v) => setFollowListTab(v as "followers" | "following")}>
            <TabsList className="w-full justify-around bg-transparent border-b rounded-none h-12">
              <TabsTrigger value="followers" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full" data-testid="tab-followers-list">
                Followers {followers.length > 0 && `(${followers.length})`}
              </TabsTrigger>
              <TabsTrigger value="following" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full" data-testid="tab-following-list">
                Following {following.length > 0 && `(${following.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="followers" className="flex-1 overflow-y-auto mt-0">
              {followers.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">No followers yet</div>
              ) : (
                followers.map((u: any) => (
                  <UserListItem key={u.id} user={u} onNavigate={() => { setShowFollowersList(false); navigate(`/user/${u.id}`); }} />
                ))
              )}
            </TabsContent>
            <TabsContent value="following" className="flex-1 overflow-y-auto mt-0">
              {following.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Not following anyone yet</div>
              ) : (
                following.map((u: any) => (
                  <UserListItem key={u.id} user={u} onNavigate={() => { setShowFollowersList(false); navigate(`/user/${u.id}`); }} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function UserListItem({ user, onNavigate }: { user: any; onNavigate: () => void }) {
  return (
    <button
      onClick={onNavigate}
      className="flex items-center gap-3 px-4 py-3 w-full hover-elevate transition-colors"
      data-testid={`user-list-item-${user.id}`}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatarUrl} />
        <AvatarFallback>{(user.displayName || user.username || "U")[0]}</AvatarFallback>
      </Avatar>
      <div className="text-left flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold truncate">{user.displayName || user.username}</span>
          {user.isVerified && (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary shrink-0">
              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
      </div>
    </button>
  );
}
