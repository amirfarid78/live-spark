import { Camera, Upload, Video, Radio, Mic, Image, Music, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const createOptions = [
  {
    id: "video",
    title: "Record Video",
    description: "Create a short video with effects & music",
    icon: Video,
    gradient: "from-purple-500 to-pink-500",
    primary: true,
  },
  {
    id: "live",
    title: "Go Live",
    description: "Start a live stream and connect with fans",
    icon: Radio,
    gradient: "from-red-500 to-orange-500",
    primary: true,
  },
  {
    id: "audio",
    title: "Audio Room",
    description: "Create a voice chat room",
    icon: Mic,
    gradient: "from-green-500 to-teal-500",
    primary: false,
  },
  {
    id: "photo",
    title: "Post Photo",
    description: "Share a photo or carousel",
    icon: Image,
    gradient: "from-blue-500 to-cyan-500",
    primary: false,
  },
  {
    id: "story",
    title: "Add Story",
    description: "Share a moment that disappears in 24h",
    icon: Sparkles,
    gradient: "from-yellow-500 to-orange-500",
    primary: false,
  },
];

export default function Create() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
          <Camera className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Create Something</h1>
        <p className="mt-2 text-muted-foreground">Choose what you want to share</p>
      </div>

      {/* Primary Options */}
      <div className="mb-6 grid w-full max-w-md gap-4 grid-cols-2">
        {createOptions
          .filter((opt) => opt.primary)
          .map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-90`} />
                <div className="relative z-10 text-white">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">{option.title}</h3>
                  <p className="mt-1 text-xs text-white/80">{option.description}</p>
                </div>
              </button>
            );
          })}
      </div>

      {/* Secondary Options */}
      <div className="w-full max-w-md space-y-3">
        {createOptions
          .filter((opt) => !opt.primary)
          .map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.id}
                className="cursor-pointer border-border bg-card transition-all hover:bg-secondary active:scale-[0.99]"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${option.gradient}`}>
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
      <div className="mt-8 w-full max-w-md">
        <Button variant="outline" className="w-full gap-2" size="lg">
          <Upload className="h-5 w-5" />
          Upload from Gallery
        </Button>
      </div>
    </div>
  );
}
