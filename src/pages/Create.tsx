import React from "react";
import { Camera, Upload, Video, Radio, Mic, Image, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const createOptions = [
  {
    id: "video",
    title: "Record Video",
    description: "Create with effects & music",
    icon: Video,
    gradient: "from-purple-500 to-pink-500",
    primary: true,
  },
  {
    id: "live",
    title: "Go Live",
    description: "Stream to your fans",
    icon: Radio,
    gradient: "from-red-500 to-orange-500",
    primary: true,
  },
  {
    id: "audio",
    title: "Audio Room",
    description: "Start a voice chat",
    icon: Mic,
    gradient: "from-green-500 to-teal-500",
    primary: false,
  },
  {
    id: "photo",
    title: "Post Photo",
    description: "Share moments",
    icon: Image,
    gradient: "from-blue-500 to-cyan-500",
    primary: false,
  },
  {
    id: "story",
    title: "Add Story",
    description: "24h moments",
    icon: Sparkles,
    gradient: "from-yellow-500 to-orange-500",
    primary: false,
  },
];

export default function Create() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <Link to="/discover" className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary press-effect">
          <X className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Create</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        {/* Hero Icon */}
        <div className="mb-8 relative animate-float">
          <div className="absolute inset-0 rounded-3xl bg-gradient-primary blur-2xl opacity-30" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-primary shadow-2xl shadow-primary/40">
            <Camera className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 animate-fade-in-up">What will you create?</h2>
        <p className="text-muted-foreground text-center mb-8 animate-fade-in-up stagger-1">Choose how you want to share</p>

        {/* Primary Options */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-6">
          {createOptions
            .filter((opt) => opt.primary)
            .map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-6 text-left transition-all press-effect card-hover animate-fade-in-up",
                    `stagger-${index + 1}`
                  )}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", option.gradient)} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10 text-white">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-lg">{option.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{option.description}</p>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Secondary Options */}
        <div className="w-full max-w-sm space-y-3">
          {createOptions
            .filter((opt) => !opt.primary)
            .map((option, index) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "cursor-pointer border-border bg-secondary/50 transition-all press-effect card-hover animate-fade-in-up",
                    `stagger-${index + 3}`
                  )}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", option.gradient)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Upload Button */}
        <div className="mt-8 w-full max-w-sm animate-fade-in-up stagger-6">
          <Button variant="outline" className="w-full gap-2 h-12 rounded-xl font-semibold" size="lg">
            <Upload className="h-5 w-5" />
            Upload from Gallery
          </Button>
        </div>
      </div>
    </div>
  );
}
