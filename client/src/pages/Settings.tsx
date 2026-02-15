import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Monitor,
  Globe,
  HelpCircle,
  Loader2,
  ChevronRight,
  Trash2,
  LogOut,
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Info,
  Eraser,
  Mail,
  Phone,
  AtSign,
  KeyRound,
  Eye,
  MessageCircle,
  Repeat2,
  Scissors,
  Download,
  Video,
  Play,
  Wifi,
  Languages,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Settings {
  privateAccount: boolean;
  allowComments: string;
  allowDuets: string;
  allowStitch: string;
  allowMessages: string;
  suggestToOthers: boolean;
  allowDownloads: boolean;
  pushNotifications: boolean;
  liveNotifications: boolean;
  messageNotifications: boolean;
  commentNotifications: boolean;
  followerNotifications: boolean;
  likeNotifications: boolean;
  mentionNotifications: boolean;
  videoQuality: string;
  autoplayVideos: boolean;
  dataSaver: boolean;
  language: string;
  restrictedMode: boolean;
  screenTimeReminder: boolean;
  darkMode: string;
}

const defaultSettings: Settings = {
  privateAccount: false,
  allowComments: "everyone",
  allowDuets: "everyone",
  allowStitch: "everyone",
  allowMessages: "everyone",
  suggestToOthers: true,
  allowDownloads: true,
  pushNotifications: true,
  liveNotifications: true,
  messageNotifications: true,
  commentNotifications: true,
  followerNotifications: true,
  likeNotifications: true,
  mentionNotifications: true,
  videoQuality: "auto",
  autoplayVideos: true,
  dataSaver: false,
  language: "en",
  restrictedMode: false,
  screenTimeReminder: false,
  darkMode: "system",
};

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 pt-6 pb-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  onClick,
  testId,
}: {
  icon?: React.ElementType;
  label: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  testId?: string;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3 w-full text-left",
        onClick && "hover-elevate active-elevate-2 cursor-pointer"
      )}
      onClick={onClick}
      data-testid={testId}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center">
        {children}
        {onClick && !children && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </Wrapper>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const {
    data: settings,
    isLoading,
  } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      try {
        const res = await api.get("/settings");
        return res.data;
      } catch {
        return defaultSettings;
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      const res = await api.patch("/settings", patch);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings updated", description: "Your preferences have been saved." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSetting = (key: keyof Settings, value: boolean | string) => {
    mutation.mutate({ [key]: value });
  };

  const handleSignOut = async () => {
    setLogoutDialogOpen(false);
    await signOut();
    toast({ title: "Signed out", description: "You have been signed out successfully." });
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleteDialogOpen(false);
    try {
      await api.delete("/auth/account");
      await signOut();
      toast({ title: "Account deleted", description: "Your account has been permanently deleted." });
      navigate("/");
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({ title: "Cache cleared", description: "Local cache has been cleared successfully." });
  };

  const current = settings || defaultSettings;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-settings" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
          {mutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
          )}
        </div>
      </header>

      <div className={cn("flex-1 pb-24 overflow-y-auto", !isMobile && "max-w-2xl mx-auto w-full")}>
        {/* Account Settings */}
        <SectionHeader icon={User} title="Account" />
        <div className="bg-card/50 mx-4 rounded-xl overflow-hidden">
          <SettingRow
            icon={Mail}
            label="Email"
            description={user?.email || "Not set"}
            testId="setting-email"
            onClick={() =>
              toast({ title: "Email", description: "Email change is managed through your account provider." })
            }
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={Phone}
            label="Phone"
            description={user?.phoneNumber || "Not linked"}
            testId="setting-phone"
            onClick={() =>
              toast({ title: "Phone", description: "Phone management coming soon." })
            }
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={AtSign}
            label="Username"
            description={user?.username || "Not set"}
            testId="setting-username"
            onClick={() =>
              toast({ title: "Username", description: "Username change coming soon." })
            }
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={KeyRound}
            label="Password"
            description="Change your password"
            testId="setting-password"
            onClick={() =>
              toast({ title: "Password", description: "Password reset coming soon." })
            }
          />
        </div>

        {/* Privacy */}
        <SectionHeader icon={Lock} title="Privacy" />
        <div className="bg-card/50 mx-4 rounded-xl overflow-hidden">
          <SettingRow
            icon={Eye}
            label="Private account"
            description="Only approved followers can see your content"
            testId="setting-private-account"
          >
            <Switch
              checked={current.privateAccount}
              onCheckedChange={(val) => updateSetting("privateAccount", val)}
              data-testid="switch-private-account"
            />
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={MessageCircle}
            label="Who can comment"
            testId="setting-allow-comments"
          >
            <Select
              value={current.allowComments}
              onValueChange={(val) => updateSetting("allowComments", val)}
            >
              <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-allow-comments">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="no_one">No one</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={Repeat2}
            label="Who can duet"
            testId="setting-allow-duets"
          >
            <Select
              value={current.allowDuets}
              onValueChange={(val) => updateSetting("allowDuets", val)}
            >
              <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-allow-duets">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="no_one">No one</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={Scissors}
            label="Who can stitch"
            testId="setting-allow-stitch"
          >
            <Select
              value={current.allowStitch}
              onValueChange={(val) => updateSetting("allowStitch", val)}
            >
              <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-allow-stitch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="no_one">No one</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={MessageCircle}
            label="Who can message"
            testId="setting-allow-messages"
          >
            <Select
              value={current.allowMessages}
              onValueChange={(val) => updateSetting("allowMessages", val)}
            >
              <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-allow-messages">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="no_one">No one</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={Users}
            label="Suggest account to others"
            description="Let others find you through suggestions"
            testId="setting-suggest-to-others"
          >
            <Switch
              checked={current.suggestToOthers}
              onCheckedChange={(val) => updateSetting("suggestToOthers", val)}
              data-testid="switch-suggest-to-others"
            />
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={Download}
            label="Allow downloads"
            description="Let others download your videos"
            testId="setting-allow-downloads"
          >
            <Switch
              checked={current.allowDownloads}
              onCheckedChange={(val) => updateSetting("allowDownloads", val)}
              data-testid="switch-allow-downloads"
            />
          </SettingRow>
        </div>

        {/* Notifications */}
        <SectionHeader icon={Bell} title="Notifications" />
        <div className="bg-card/50 mx-4 rounded-xl overflow-hidden">
          <SettingRow
            label="Push notifications"
            description="Receive push notifications"
            testId="setting-push-notifications"
          >
            <Switch
              checked={current.pushNotifications}
              onCheckedChange={(val) => updateSetting("pushNotifications", val)}
              data-testid="switch-push-notifications"
            />
          </SettingRow>
          <Separator className="ml-4" />
          <SettingRow
            label="Live notifications"
            description="When someone you follow goes live"
            testId="setting-live-notifications"
          >
            <Switch
              checked={current.liveNotifications}
              onCheckedChange={(val) => updateSetting("liveNotifications", val)}
              data-testid="switch-live-notifications"
            />
          </SettingRow>
          <Separator className="ml-4" />
          <SettingRow
            label="Message notifications"
            description="New direct messages"
            testId="setting-message-notifications"
          >
            <Switch
              checked={current.messageNotifications}
              onCheckedChange={(val) => updateSetting("messageNotifications", val)}
              data-testid="switch-message-notifications"
            />
          </SettingRow>
          <Separator className="ml-4" />
          <SettingRow
            label="Comment notifications"
            description="Comments on your videos"
            testId="setting-comment-notifications"
          >
            <Switch
              checked={current.commentNotifications}
              onCheckedChange={(val) => updateSetting("commentNotifications", val)}
              data-testid="switch-comment-notifications"
            />
          </SettingRow>
          <Separator className="ml-4" />
          <SettingRow
            label="Follower notifications"
            description="New followers"
            testId="setting-follower-notifications"
          >
            <Switch
              checked={current.followerNotifications}
              onCheckedChange={(val) => updateSetting("followerNotifications", val)}
              data-testid="switch-follower-notifications"
            />
          </SettingRow>
          <Separator className="ml-4" />
          <SettingRow
            label="Like notifications"
            description="Likes on your content"
            testId="setting-like-notifications"
          >
            <Switch
              checked={current.likeNotifications}
              onCheckedChange={(val) => updateSetting("likeNotifications", val)}
              data-testid="switch-like-notifications"
            />
          </SettingRow>
          <Separator className="ml-4" />
          <SettingRow
            label="Mention notifications"
            description="When someone mentions you"
            testId="setting-mention-notifications"
          >
            <Switch
              checked={current.mentionNotifications}
              onCheckedChange={(val) => updateSetting("mentionNotifications", val)}
              data-testid="switch-mention-notifications"
            />
          </SettingRow>
        </div>

        {/* Content Preferences */}
        <SectionHeader icon={Monitor} title="Content Preferences" />
        <div className="bg-card/50 mx-4 rounded-xl overflow-hidden">
          <SettingRow
            icon={Video}
            label="Video quality"
            description="Adjust video playback quality"
            testId="setting-video-quality"
          >
            <Select
              value={current.videoQuality}
              onValueChange={(val) => updateSetting("videoQuality", val)}
            >
              <SelectTrigger className="w-24 h-8 text-xs" data-testid="select-video-quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={Play}
            label="Autoplay videos"
            description="Automatically play videos in feed"
            testId="setting-autoplay"
          >
            <Switch
              checked={current.autoplayVideos}
              onCheckedChange={(val) => updateSetting("autoplayVideos", val)}
              data-testid="switch-autoplay"
            />
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={Wifi}
            label="Data saver"
            description="Reduce data usage on mobile networks"
            testId="setting-data-saver"
          >
            <Switch
              checked={current.dataSaver}
              onCheckedChange={(val) => updateSetting("dataSaver", val)}
              data-testid="switch-data-saver"
            />
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={Languages}
            label="Content language"
            testId="setting-content-language"
          >
            <Select
              value={current.language}
              onValueChange={(val) => updateSetting("language", val)}
            >
              <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-content-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="ml-12" />
          <SettingRow
            icon={Shield}
            label="Restricted mode"
            description="Limit the appearance of content that may not be appropriate"
            testId="setting-restricted-mode"
          >
            <Switch
              checked={current.restrictedMode}
              onCheckedChange={(val) => updateSetting("restrictedMode", val)}
              data-testid="switch-restricted-mode"
            />
          </SettingRow>
        </div>

        {/* Display */}
        <SectionHeader icon={Globe} title="Display" />
        <div className="bg-card/50 mx-4 rounded-xl overflow-hidden">
          <SettingRow
            label="Dark mode"
            description="Choose your preferred theme"
            testId="setting-dark-mode"
          >
            <Select
              value={current.darkMode}
              onValueChange={(val) => updateSetting("darkMode", val)}
            >
              <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-dark-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">
                  <span className="flex items-center gap-1.5">
                    <Laptop className="h-3 w-3" /> System
                  </span>
                </SelectItem>
                <SelectItem value="dark">
                  <span className="flex items-center gap-1.5">
                    <Moon className="h-3 w-3" /> Dark
                  </span>
                </SelectItem>
                <SelectItem value="light">
                  <span className="flex items-center gap-1.5">
                    <Sun className="h-3 w-3" /> Light
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="ml-4" />
          <SettingRow
            icon={Languages}
            label="App language"
            testId="setting-app-language"
          >
            <Select
              value={current.language}
              onValueChange={(val) => updateSetting("language", val)}
            >
              <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-app-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>

        {/* About & Support */}
        <SectionHeader icon={HelpCircle} title="About & Support" />
        <div className="bg-card/50 mx-4 rounded-xl overflow-hidden">
          <SettingRow
            icon={FileText}
            label="Terms of Service"
            testId="setting-terms"
            onClick={() =>
              toast({ title: "Terms of Service", description: "Opening Terms of Service..." })
            }
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={Shield}
            label="Privacy Policy"
            testId="setting-privacy-policy"
            onClick={() =>
              toast({ title: "Privacy Policy", description: "Opening Privacy Policy..." })
            }
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={Users}
            label="Community Guidelines"
            testId="setting-community-guidelines"
            onClick={() =>
              toast({
                title: "Community Guidelines",
                description: "Opening Community Guidelines...",
              })
            }
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={AlertTriangle}
            label="Report a problem"
            testId="setting-report-problem"
            onClick={() =>
              toast({ title: "Report", description: "Report form coming soon." })
            }
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={Info}
            label="App info"
            description="Version 1.0.0"
            testId="setting-app-info"
            onClick={() =>
              toast({ title: "App Info", description: "Snap Live v1.0.0" })
            }
          />
        </div>

        {/* Account Actions */}
        <SectionHeader icon={User} title="Account Actions" />
        <div className="bg-card/50 mx-4 rounded-xl overflow-hidden">
          <SettingRow
            icon={Eraser}
            label="Clear cache"
            description="Free up storage space"
            testId="setting-clear-cache"
            onClick={handleClearCache}
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={LogOut}
            label="Log out"
            testId="setting-logout"
            onClick={() => setLogoutDialogOpen(true)}
          />
          <Separator className="ml-12" />
          <SettingRow
            icon={Trash2}
            label="Delete account"
            description="Permanently delete your account and data"
            testId="setting-delete-account"
            onClick={() => setDeleteDialogOpen(true)}
          />
        </div>

        <div className="px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">Snap Live v1.0.0</p>
        </div>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-logout">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} data-testid="button-confirm-logout">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all of your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
