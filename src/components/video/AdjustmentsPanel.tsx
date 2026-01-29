import React from "react";
import { Slider } from "@/components/ui/slider";
import { Sun, Contrast, Droplet, Thermometer, Focus, Sparkles } from "lucide-react";

export interface AdjustmentSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  vignette: number;
  grain: number;
}

interface AdjustmentsPanelProps {
  settings: AdjustmentSettings;
  onSettingsChange: (settings: AdjustmentSettings) => void;
  onClose: () => void;
}

const adjustmentControls = [
  { key: 'brightness' as const, label: 'Brightness', icon: Sun, min: -50, max: 50, defaultValue: 0 },
  { key: 'contrast' as const, label: 'Contrast', icon: Contrast, min: -50, max: 50, defaultValue: 0 },
  { key: 'saturation' as const, label: 'Saturation', icon: Droplet, min: -50, max: 50, defaultValue: 0 },
  { key: 'temperature' as const, label: 'Warmth', icon: Thermometer, min: -50, max: 50, defaultValue: 0 },
  { key: 'vignette' as const, label: 'Vignette', icon: Focus, min: 0, max: 100, defaultValue: 0 },
  { key: 'grain' as const, label: 'Grain', icon: Sparkles, min: 0, max: 100, defaultValue: 0 },
];

export default function AdjustmentsPanel({ settings, onSettingsChange, onClose }: AdjustmentsPanelProps) {
  const handleSliderChange = (key: keyof AdjustmentSettings, value: number[]) => {
    onSettingsChange({ ...settings, [key]: value[0] });
  };

  const resetAll = () => {
    onSettingsChange({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      vignette: 0,
      grain: 0,
    });
  };

  return (
    <div className="absolute bottom-32 left-0 right-0 z-30 px-4 animate-fade-in">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Adjust</h3>
          <button 
            onClick={resetAll}
            className="text-primary text-sm font-medium press-effect"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto hide-scrollbar">
          {adjustmentControls.map((control) => {
            const Icon = control.icon;
            const value = settings[control.key];
            return (
              <div key={control.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-white/70" />
                    <span className="text-white/80 text-sm">{control.label}</span>
                  </div>
                  <span className="text-white/50 text-xs">
                    {value > 0 ? `+${value}` : value}
                  </span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(val) => handleSliderChange(control.key, val)}
                  min={control.min}
                  max={control.max}
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
