import { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface FollowersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  initialTab: "followers" | "following";
}

export function FollowersSheet({ isOpen, onClose, userId, initialTab }: FollowersSheetProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const queryClient = useQueryClient();

  const { data: followers = [], isLoading: followersLoading } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "followers"],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/followers`);
      return res.data;
    },
    enabled: isOpen && activeTab === "followers",
  });

  const { data: following = [], isLoading: followingLoading } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "following"],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/following`);
      return res.data;
    },
    enabled: isOpen && activeTab === "following",
  });

  const followMutation = useMutation({
    mutationFn: async ({ targetId, action }: { targetId: number; action: "follow" | "unfollow" }) => {
      if (action === "follow") {
        await api.post(`/users/${targetId}/follow`);
      } else {
        await api.delete(`/users/${targetId}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "followers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "following"] });
    },
  });

  const users = activeTab === "followers" ? followers : following;
  const isLoading = activeTab === "followers" ? followersLoading : followingLoading;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg h-[70vh] bg-background rounded-t-3xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("followers")}
              className={cn(
                "font-bold text-lg pb-1 border-b-2 transition-colors",
                activeTab === "followers" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              )}
              data-testid="tab-followers"
            >
              Followers
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={cn(
                "font-bold text-lg pb-1 border-b-2 transition-colors",
                activeTab === "following" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              )}
              data-testid="tab-following"
            >
              Following
            </button>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center" data-testid="button-close-followers">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <UserPlus className="h-10 w-10 mb-3 opacity-50" />
              <p className="font-semibold">No {activeTab} yet</p>
            </div>
          ) : (
            users.map((u: any) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                data-testid={`user-item-${u.id}`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={u.avatarUrl || u.avatar_url} />
                  <AvatarFallback>{(u.displayName || u.display_name || u.username || "U")[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold truncate">{u.displayName || u.display_name || u.username}</span>
                    {(u.isVerified || u.is_verified) && (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white flex-shrink-0">
                        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">@{u.username}</p>
                </div>
                {activeTab === "following" && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => followMutation.mutate({ targetId: u.id, action: "unfollow" })}
                    className="rounded-xl"
                    data-testid={`button-unfollow-${u.id}`}
                  >
                    Following
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
