import React, { useState } from "react";
import { X, Link2, MessageCircle, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: number;
}

const shareOptions = [
  { id: 'copy', icon: Link2, label: 'Copy Link', color: 'bg-gray-500' },
  { id: 'message', icon: MessageCircle, label: 'Message', color: 'bg-primary' },
  { id: 'whatsapp', icon: Send, label: 'WhatsApp', color: 'bg-green-500' },
];

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500' },
  { id: 'twitter', name: 'Twitter', color: 'bg-blue-400' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
];

export function ShareSheet({ isOpen, onClose, videoId }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://snaplive.app/video/${videoId}`);
    setCopied(true);
    toast({ title: "Link Copied!", description: "Video link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-background rounded-t-3xl p-6 pb-safe animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center -mt-3 mb-4">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">Share Video</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center press-effect">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Share Options */}
        <div className="flex justify-around mb-6">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button 
                key={option.id}
                onClick={option.id === 'copy' ? handleCopyLink : undefined}
                className="flex flex-col items-center gap-2 press-effect"
              >
                <div className={`h-14 w-14 rounded-full ${option.color} flex items-center justify-center`}>
                  {option.id === 'copy' && copied ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <Icon className="h-6 w-6 text-white" />
                  )}
                </div>
                <span className="text-xs font-medium">{option.id === 'copy' && copied ? 'Copied!' : option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Social Platforms */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {socialPlatforms.map((platform) => (
            <button 
              key={platform.id}
              className="flex flex-col items-center gap-2 press-effect"
            >
              <div className={`h-12 w-12 rounded-full ${platform.color} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{platform.name[0]}</span>
              </div>
              <span className="text-xs text-muted-foreground">{platform.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link Button */}
        <Button 
          variant="outline" 
          onClick={handleCopyLink}
          className="w-full h-12 rounded-xl gap-2"
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          {copied ? 'Link Copied!' : 'Copy Link'}
        </Button>
      </div>
    </div>
  );
}
