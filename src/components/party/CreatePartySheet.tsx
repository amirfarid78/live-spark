import React, { useState } from "react";
import { X, Camera, Lock, Globe, Users, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CreatePartySheetProps {
  onClose: () => void;
  onCreate: (settings: PartySettings) => void;
}

export interface PartySettings {
  name: string;
  description: string;
  coverImage?: string;
  isPrivate: boolean;
  passcode?: string;
  category: string;
  maxSpeakers: number;
}

const categories = [
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "dating", label: "Dating", icon: "💕" },
  { id: "talent", label: "Talent Show", icon: "⭐" },
  { id: "chill", label: "Chill", icon: "☕" },
];

const backgrounds = [
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400",
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400",
];

export function CreatePartySheet({ onClose, onCreate }: CreatePartySheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("chat");
  const [selectedBg, setSelectedBg] = useState(backgrounds[0]);
  const [maxSpeakers, setMaxSpeakers] = useState(8);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({
      name,
      description,
      coverImage: selectedBg,
      isPrivate,
      passcode: isPrivate ? passcode : undefined,
      category: selectedCategory,
      maxSpeakers,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background animate-slide-in-up">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button onClick={onClose} className="p-2 -ml-2 press-effect">
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Create Party Room</h1>
        <Button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="bg-gradient-primary text-white px-4 h-9"
        >
          Start
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Cover Image Selection */}
        <div className="px-4 py-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Room Background
          </label>
          <div className="grid grid-cols-3 gap-2">
            {backgrounds.map((bg, i) => (
              <button
                key={i}
                onClick={() => setSelectedBg(bg)}
                className={cn(
                  "aspect-video rounded-xl overflow-hidden ring-2 transition-all",
                  selectedBg === bg ? "ring-stream-purple scale-95" : "ring-transparent"
                )}
              >
                <img src={bg} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button className="mt-2 w-full h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-sm text-muted-foreground press-effect">
            <Camera className="h-4 w-4" />
            Upload Custom
          </button>
        </div>

        {/* Room Name */}
        <div className="px-4 py-2">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Room Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter room name..."
            maxLength={50}
            className="h-12 bg-muted/50 border-border/50"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{name.length}/50</p>
        </div>

        {/* Description */}
        <div className="px-4 py-2">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Welcome Message
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Say something to welcome your guests..."
            maxLength={100}
            className="min-h-[80px] bg-muted/50 border-border/50 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/100</p>
        </div>

        {/* Category Selection */}
        <div className="px-4 py-4">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 rounded-xl transition-all press-effect",
                  selectedCategory === cat.id
                    ? "bg-stream-purple/20 ring-2 ring-stream-purple"
                    : "bg-muted/50"
                )}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Room Type */}
        <div className="px-4 py-4">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Room Type
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPrivate(false)}
              className={cn(
                "flex-1 flex items-center gap-3 p-4 rounded-xl transition-all",
                !isPrivate
                  ? "bg-stream-cyan/20 ring-2 ring-stream-cyan"
                  : "bg-muted/50"
              )}
            >
              <Globe className="h-5 w-5 text-stream-cyan" />
              <div className="text-left">
                <p className="text-sm font-medium">Public</p>
                <p className="text-xs text-muted-foreground">Anyone can join</p>
              </div>
            </button>
            <button
              onClick={() => setIsPrivate(true)}
              className={cn(
                "flex-1 flex items-center gap-3 p-4 rounded-xl transition-all",
                isPrivate
                  ? "bg-stream-gold/20 ring-2 ring-stream-gold"
                  : "bg-muted/50"
              )}
            >
              <Lock className="h-5 w-5 text-stream-gold" />
              <div className="text-left">
                <p className="text-sm font-medium">Private</p>
                <p className="text-xs text-muted-foreground">Passcode required</p>
              </div>
            </button>
          </div>

          {/* Passcode Input */}
          {isPrivate && (
            <div className="mt-3 animate-fade-in">
              <Input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 4-6 digit passcode"
                className="h-12 bg-muted/50 border-border/50 text-center text-lg tracking-widest"
              />
            </div>
          )}
        </div>

        {/* Speaker Slots */}
        <div className="px-4 py-4">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Speaker Seats
          </label>
          <div className="flex gap-2">
            {[4, 6, 8, 12].map((num) => (
              <button
                key={num}
                onClick={() => setMaxSpeakers(num)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
                  maxSpeakers === num
                    ? "bg-stream-purple text-white"
                    : "bg-muted/50"
                )}
              >
                {num} seats
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
