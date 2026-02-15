import { useState } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    username: string | null;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  } | null;
}

export function EditProfileDialog({ isOpen, onClose, profile }: EditProfileDialogProps) {
  const { updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ displayName, username, bio });
    setSaving(false);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full" data-testid="button-close-edit">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-bold text-lg">Edit Profile</h2>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-xl bg-gradient-primary"
          data-testid="button-save-profile"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <Avatar className="h-24 w-24 ring-4 ring-primary/20">
            <AvatarImage src={profile?.avatarUrl || ""} />
            <AvatarFallback className="text-2xl">{(displayName || "U")[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 space-y-5">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Display Name</label>
          <Input 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="h-12 rounded-xl"
            data-testid="input-display-name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Username</label>
          <Input 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
            className="h-12 rounded-xl"
            data-testid="input-username"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Bio</label>
          <Textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="rounded-xl min-h-[100px] resize-none"
            maxLength={150}
            data-testid="input-bio"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/150</p>
        </div>
      </div>
    </div>
  );
}
