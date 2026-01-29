import React, { useState } from "react";
import { Camera, Mic, Settings, Sparkles, Users, Swords, Music, MessageSquare, FlipHorizontal, Zap, Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface GoLiveSheetProps {
  onClose: () => void;
  onGoLive: (settings: LiveSettings) => void;
}

interface LiveSettings {
  title: string;
  category: string;
  isPrivate: boolean;
  allowGifts: boolean;
  enablePK: boolean;
}

const categories = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "music", label: "Music", icon: Music },
  { id: "gaming", label: "Gaming", icon: Sparkles },
  { id: "talent", label: "Talent", icon: Zap },
];

export function GoLiveSheet({ onClose, onGoLive }: GoLiveSheetProps) {
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("chat");
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowGifts, setAllowGifts] = useState(true);
  const [enablePK, setEnablePK] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const handleGoLive = () => {
    onGoLive({
      title: title || "Live Stream",
      category: selectedCategory,
      isPrivate,
      allowGifts,
      enablePK,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera Preview (Mock) */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-muted-foreground/20 flex items-center justify-center mx-auto mb-4">
              <Camera className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm">Camera preview</p>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 press-effect"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 press-effect"
          >
            <FlipHorizontal className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 press-effect"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Right Side Filters */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        <button className="h-12 w-12 rounded-full bg-black/40 flex items-center justify-center text-white press-effect">
          <Sparkles className="h-5 w-5" />
        </button>
        <button className="h-12 w-12 rounded-full bg-black/40 flex items-center justify-center text-white press-effect">
          <Mic className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Settings Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl rounded-t-3xl p-6 pb-safe animate-slide-up">
        {/* Title Input */}
        <div className="mb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your stream a title..."
            className="h-12 rounded-xl bg-muted border-0 text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {/* Categories */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Category</p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all press-effect",
                    isActive
                      ? "bg-gradient-primary text-white shadow-lg shadow-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Toggles */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Private room</span>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-stream-gold" />
              <span className="text-sm font-medium">Allow gifts</span>
            </div>
            <Switch checked={allowGifts} onCheckedChange={setAllowGifts} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Swords className="h-5 w-5 text-stream-coral" />
              <span className="text-sm font-medium">Open for PK battles</span>
            </div>
            <Switch checked={enablePK} onCheckedChange={setEnablePK} />
          </div>
        </div>

        {/* Go Live Button */}
        <Button
          onClick={handleGoLive}
          className="w-full h-14 rounded-2xl bg-gradient-live text-white font-bold text-lg shadow-xl shadow-stream-live/40 hover:opacity-90 press-effect"
        >
          <Radio className="h-5 w-5 mr-2" />
          Go Live
        </Button>
      </div>
    </div>
  );
}
