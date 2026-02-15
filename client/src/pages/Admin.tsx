import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  Video,
  Radio,
  Building2,
  Shield,
  Crown,
  Check,
  X,
  Trash2,
  Edit,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface AdminStats {
  totalUsers: number;
  totalVideos: number;
  totalStreams: number;
  totalAgencies: number;
}

interface AdminUser {
  id: number;
  email: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  bio?: string | null;
  level: string;
  isVerified: boolean;
  coinsBalance: number;
  diamondsBalance: number;
  [key: string]: any;
}

interface AdminVideo {
  id: number;
  description?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  views: number;
  likes: number;
  userId: number;
  user?: { displayName: string; username: string; avatar?: string | null };
  [key: string]: any;
}

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editCoins, setEditCoins] = useState("");
  const [editDiamonds, setEditDiamonds] = useState("");

  const statsQuery = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: () => api.get("/admin/stats").then((r) => r.data),
    retry: false,
  });

  const usersQuery = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: () => api.get("/admin/users").then((r) => r.data),
    retry: false,
  });

  const videosQuery = useQuery<AdminVideo[]>({
    queryKey: ["/api/admin/videos"],
    queryFn: () => api.get("/admin/videos").then((r) => r.data),
    retry: false,
    enabled: activeTab === "content",
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      api.patch(`/admin/users/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api.post(`/admin/users/${id}/role`, { role }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/admin/videos/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Video deleted successfully" });
      setDeleteVideoId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete video", variant: "destructive" });
    },
  });

  const is403 =
    statsQuery.error &&
    (statsQuery.error as any)?.response?.status === 403;

  if (is403) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold" data-testid="text-access-denied">
          Admin access required
        </h1>
        <p className="text-muted-foreground text-center">
          You do not have permission to access this page.
        </p>
        <Button
          data-testid="button-back-home"
          variant="outline"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
      </div>
    );
  }

  const stats = statsQuery.data;

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users },
    { label: "Total Videos", value: stats?.totalVideos ?? 0, icon: Video },
    { label: "Total Streams", value: stats?.totalStreams ?? 0, icon: Radio },
    { label: "Total Agencies", value: stats?.totalAgencies ?? 0, icon: Building2 },
  ];

  function openEditDialog(user: AdminUser) {
    setEditUser(user);
    setEditCoins(String(user.coinsBalance ?? 0));
    setEditDiamonds(String(user.diamondsBalance ?? 0));
  }

  function saveBalances() {
    if (!editUser) return;
    updateUserMutation.mutate({
      id: editUser.id,
      data: {
        coinsBalance: parseInt(editCoins) || 0,
        diamondsBalance: parseInt(editDiamonds) || 0,
      },
    });
    setEditUser(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 p-4 max-w-7xl mx-auto">
          <Button
            data-testid="button-back"
            size="icon"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <Card key={s.label} data-testid={`card-stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsQuery.isLoading ? (
                  <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                ) : (
                  <div className="text-2xl font-bold" data-testid={`text-stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
                    {s.value.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-admin">
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="h-4 w-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">
              <Video className="h-4 w-4 mr-1" />
              Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            {usersQuery.isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {usersQuery.data?.map((user) => (
                  <Card key={user.id} data-testid={`card-user-${user.id}`}>
                    <CardContent className="flex flex-wrap items-center gap-3 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>
                          {(user.displayName || user.username || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate" data-testid={`text-name-${user.id}`}>
                            {user.displayName || user.username}
                          </span>
                          {user.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-0.5" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate" data-testid={`text-username-${user.id}`}>
                          @{user.username}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-xs text-muted-foreground text-right">
                          <div data-testid={`text-coins-${user.id}`}>Coins: {user.coinsBalance ?? 0}</div>
                          <div data-testid={`text-diamonds-${user.id}`}>Diamonds: {user.diamondsBalance ?? 0}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Label htmlFor={`verified-${user.id}`} className="text-xs text-muted-foreground">
                            Verified
                          </Label>
                          <Switch
                            id={`verified-${user.id}`}
                            data-testid={`switch-verified-${user.id}`}
                            checked={!!user.isVerified}
                            onCheckedChange={(checked) =>
                              updateUserMutation.mutate({
                                id: user.id,
                                data: { isVerified: checked },
                              })
                            }
                          />
                        </div>

                        <Select
                          value={user.level || "bronze"}
                          onValueChange={(value) =>
                            updateUserMutation.mutate({
                              id: user.id,
                              data: { level: value },
                            })
                          }
                        >
                          <SelectTrigger
                            className="w-28"
                            data-testid={`select-level-${user.id}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bronze">Bronze</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="diamond">Diamond</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          onValueChange={(value) =>
                            setRoleMutation.mutate({
                              id: user.id,
                              role: value,
                            })
                          }
                        >
                          <SelectTrigger
                            className="w-28"
                            data-testid={`select-role-${user.id}`}
                          >
                            <SelectValue placeholder="Set role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="creator">Creator</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-edit-balance-${user.id}`}
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {usersQuery.data?.length === 0 && (
                  <p className="text-center text-muted-foreground p-8">
                    No users found
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            {videosQuery.isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {videosQuery.data?.map((video) => (
                  <Card key={video.id} data-testid={`card-video-${video.id}`}>
                    <CardContent className="p-4 space-y-3">
                      {video.thumbnailUrl && (
                        <div className="aspect-video rounded-md overflow-hidden bg-muted">
                          <img
                            src={video.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-sm font-medium line-clamp-2" data-testid={`text-video-desc-${video.id}`}>
                          {video.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={video.user?.avatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {(video.user?.displayName || "?").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground" data-testid={`text-video-creator-${video.id}`}>
                            {video.user?.displayName || video.user?.username || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span data-testid={`text-video-views-${video.id}`}>{video.views ?? 0} views</span>
                          <span data-testid={`text-video-likes-${video.id}`}>{video.likes ?? 0} likes</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive"
                        data-testid={`button-delete-video-${video.id}`}
                        onClick={() => setDeleteVideoId(video.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {videosQuery.data?.length === 0 && (
                  <p className="text-center text-muted-foreground p-8 col-span-full">
                    No videos found
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog
        open={deleteVideoId !== null}
        onOpenChange={(open) => !open && setDeleteVideoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={() => deleteVideoId && deleteVideoMutation.mutate(deleteVideoId)}
            >
              {deleteVideoMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={editUser !== null}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Balance - {editUser?.displayName || editUser?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-coins">Coins Balance</Label>
              <Input
                id="edit-coins"
                data-testid="input-edit-coins"
                type="number"
                value={editCoins}
                onChange={(e) => setEditCoins(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-diamonds">Diamonds Balance</Label>
              <Input
                id="edit-diamonds"
                data-testid="input-edit-diamonds"
                type="number"
                value={editDiamonds}
                onChange={(e) => setEditDiamonds(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-testid="button-cancel-edit"
              onClick={() => setEditUser(null)}
            >
              Cancel
            </Button>
            <Button
              data-testid="button-save-balance"
              onClick={saveBalances}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
