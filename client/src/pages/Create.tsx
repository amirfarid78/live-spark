import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Video, Radio, Mic, Image, Sparkles, X, Loader2, Check, Hash, Music, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { VideoRecorder } from "@/components/create/VideoRecorder";
import { VideoEditor } from "@/components/create/VideoEditor";

const createOptions = [
  {
    id: "record",
    title: "Record Video",
    description: "Camera with effects & filters",
    icon: Camera,
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

type CreateStep = "select" | "recording" | "editing" | "upload" | "details" | "publishing";

export default function Create() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<CreateStep>("select");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadedVideoPath, setUploadedVideoPath] = useState<string | null>(null);
  const [uploadedThumbnailPath, setUploadedThumbnailPath] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [songName, setSongName] = useState("");

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      setUploadedVideoPath(response.objectPath);
    },
    onError: (error) => {
      toast.error("Upload failed: " + error.message);
      setStep("select");
    },
  });

  const thumbnailUpload = useUpload({
    onSuccess: (response) => {
      setUploadedThumbnailPath(response.objectPath);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (data: { description: string; videoUrl: string; thumbnailUrl: string | null; songName: string | null; hashtags: string[] }) => {
      const res = await api.post("/videos", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoFeed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/trending"] });
      toast.success("Video published successfully!");
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to publish video");
      setStep("details");
    },
  });

  const handleVideoRecorded = useCallback((blob: Blob, _duration: number) => {
    setRecordedBlob(blob);
    setStep("editing");
  }, []);

  const handleEditorSave = useCallback(async (editedBlob: Blob, thumbnail: Blob | null) => {
    const videoFile = new File([editedBlob], `video_${Date.now()}.webm`, { type: editedBlob.type || "video/webm" });
    setSelectedFile(videoFile);
    setVideoPreviewUrl(URL.createObjectURL(editedBlob));
    setStep("upload");

    const result = await uploadFile(videoFile);
    if (result) {
      if (thumbnail) {
        const thumbFile = new File([thumbnail], `thumb_${Date.now()}.jpg`, { type: "image/jpeg" });
        await thumbnailUpload.uploadFile(thumbFile);
      }
      setStep("details");
    }
  }, [uploadFile, thumbnailUpload]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error("Video must be under 500MB");
      return;
    }

    setRecordedBlob(file);
    setStep("editing");
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handlePublish = () => {
    if (!uploadedVideoPath) {
      toast.error("Please wait for the video to finish uploading");
      return;
    }

    setStep("publishing");
    publishMutation.mutate({
      description,
      videoUrl: uploadedVideoPath,
      thumbnailUrl: uploadedThumbnailPath,
      songName: songName || null,
      hashtags,
    });
  };

  const handleOptionClick = (optionId: string) => {
    if (optionId === "record") {
      setStep("recording");
    } else if (optionId === "live") {
      navigate("/live");
    }
  };

  const resetToSelect = () => {
    setStep("select");
    setRecordedBlob(null);
    setSelectedFile(null);
    setVideoPreviewUrl(null);
    setUploadedVideoPath(null);
    setUploadedThumbnailPath(null);
    setDescription("");
    setHashtags([]);
    setSongName("");
  };

  if (step === "recording") {
    return (
      <VideoRecorder
        onVideoRecorded={handleVideoRecorded}
        onClose={resetToSelect}
      />
    );
  }

  if (step === "editing" && recordedBlob) {
    return (
      <VideoEditor
        videoBlob={recordedBlob}
        onSave={handleEditorSave}
        onClose={resetToSelect}
      />
    );
  }

  if (step === "upload") {
    return (
      <div className="flex min-h-screen flex-col bg-background items-center justify-center p-6">
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} data-testid="input-file-upload" />
        <div className="text-center max-w-sm w-full">
          {videoPreviewUrl && (
            <div className="relative w-full max-w-[240px] mx-auto mb-8 rounded-2xl overflow-hidden bg-black aspect-[9/16]">
              <video src={videoPreviewUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 text-white animate-spin mx-auto mb-3" />
                  <p className="text-white font-semibold text-lg">{progress}%</p>
                  <p className="text-white/70 text-sm mt-1">Uploading video...</p>
                </div>
              </div>
            </div>
          )}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {selectedFile?.name} ({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)}MB)
          </p>
        </div>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <button onClick={resetToSelect} className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="button-back-create">
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-lg font-bold">Post Details</h1>
          <Button
            onClick={handlePublish}
            disabled={publishMutation.isPending || !uploadedVideoPath}
            className="bg-gradient-primary text-white px-6"
            data-testid="button-publish"
          >
            {publishMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
          </Button>
        </header>

        <div className="flex-1 p-4 space-y-6 pb-24">
          <div className="flex gap-4">
            {videoPreviewUrl && (
              <div className="w-28 h-40 rounded-xl overflow-hidden bg-black flex-shrink-0">
                <video src={videoPreviewUrl} className="w-full h-full object-cover" muted playsInline />
              </div>
            )}
            <div className="flex-1">
              <Textarea
                placeholder="Describe your video..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none border-0 text-base focus-visible:ring-0 bg-transparent min-h-[120px]"
                maxLength={500}
                data-testid="input-description"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/500</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              Hashtags
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                  #{tag}
                  <button onClick={() => handleRemoveHashtag(tag)} className="ml-1" data-testid={`button-remove-tag-${tag}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add hashtag..."
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHashtag())}
                className="flex-1"
                data-testid="input-hashtag"
              />
              <Button variant="outline" onClick={handleAddHashtag} disabled={!hashtagInput.trim()} data-testid="button-add-hashtag">
                Add
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              Song Name (optional)
            </label>
            <Input
              placeholder="Original Sound"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              data-testid="input-song-name"
            />
          </div>

          {uploadedVideoPath && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <Check className="h-4 w-4" />
              Video uploaded successfully
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "publishing") {
    return (
      <div className="flex min-h-screen flex-col bg-background items-center justify-center p-6">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Publishing your video</h2>
          <p className="text-muted-foreground">This will just take a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} data-testid="input-file-upload" />
      <header className="flex items-center justify-between px-4 py-4">
        <Link to="/discover" className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary press-effect" data-testid="link-close-create">
          <X className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Create</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className="mb-8 relative animate-float">
          <div className="absolute inset-0 rounded-3xl bg-gradient-primary blur-2xl opacity-30" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-primary shadow-2xl shadow-primary/40">
            <Camera className="h-12 w-12 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 animate-fade-in-up">What will you create?</h2>
        <p className="text-muted-foreground text-center mb-8 animate-fade-in-up stagger-1">Choose how you want to share</p>

        <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-6">
          {createOptions
            .filter((opt) => opt.primary)
            .map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-6 text-left transition-all press-effect card-hover animate-fade-in-up",
                    `stagger-${index + 1}`
                  )}
                  data-testid={`button-create-${option.id}`}
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

        <div className="mt-8 w-full max-w-sm animate-fade-in-up stagger-6">
          <Button
            variant="outline"
            className="w-full gap-2 h-12 rounded-xl font-semibold"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-upload-gallery"
          >
            <Upload className="h-5 w-5" />
            Upload from Gallery
          </Button>
        </div>
      </div>
    </div>
  );
}
