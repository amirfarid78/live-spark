import React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Sparkles, Sun, Contrast, Droplets, Eye, Smile } from "lucide-react";

export interface BeautySettings {
  smooth: number;
  brighten: number;
  contrast: number;
  sharpen: number;
  eyeEnlarge: number;
  faceThin: number;
}

interface BeautyPanelProps {
  settings: BeautySettings;
  onSettingsChange: (settings: BeautySettings) => void;
  onClose: () => void;
}

const beautyControls = [
  { key: 'smooth' as const, label: 'Smooth', icon: Droplets, defaultValue: 50 },
  { key: 'brighten' as const, label: 'Brighten', icon: Sun, defaultValue: 30 },
  { key: 'contrast' as const, label: 'Contrast', icon: Contrast, defaultValue: 50 },
  { key: 'sharpen' as const, label: 'Sharpen', icon: Sparkles, defaultValue: 20 },
  { key: 'eyeEnlarge' as const, label: 'Eyes', icon: Eye, defaultValue: 0 },
  { key: 'faceThin' as const, label: 'Face', icon: Smile, defaultValue: 0 },
];

export default function BeautyPanel({ settings, onSettingsChange, onClose }: BeautyPanelProps) {
  const handleSliderChange = (key: keyof BeautySettings, value: number[]) => {
    onSettingsChange({ ...settings, [key]: value[0] });
  };

  const resetAll = () => {
    onSettingsChange({
      smooth: 50,
      brighten: 30,
      contrast: 50,
      sharpen: 20,
      eyeEnlarge: 0,
      faceThin: 0,
    });
  };

  return (
    <div className="absolute bottom-32 left-0 right-0 z-30 px-4 animate-fade-in">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Beauty</h3>
          <button 
            onClick={resetAll}
            className="text-primary text-sm font-medium press-effect"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto hide-scrollbar">
          {beautyControls.map((control) => {
            const Icon = control.icon;
            return (
              <div key={control.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-white/70" />
                    <span className="text-white/80 text-sm">{control.label}</span>
                  </div>
                  <span className="text-white/50 text-xs">{settings[control.key]}</span>
                </div>
                <Slider
                  value={[settings[control.key]]}
                  onValueChange={(value) => handleSliderChange(control.key, value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-white/70 text-sm press-effect"
        >
          Done
        </button>
      </div>
    </div>
  );
}
