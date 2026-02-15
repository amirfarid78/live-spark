import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Heart, Star, Ghost, Flame, Snowflake, Crown, Cat, Dog } from "lucide-react";

interface Effect {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'trending' | 'face' | 'world' | 'funny';
}

const effects: Effect[] = [
  { id: 'none', name: 'None', icon: Sparkles, category: 'trending' },
  { id: 'glow', name: 'Glow', icon: Zap, category: 'trending' },
  { id: 'hearts', name: 'Hearts', icon: Heart, category: 'face' },
  { id: 'stars', name: 'Stars', icon: Star, category: 'world' },
  { id: 'ghost', name: 'Ghost', icon: Ghost, category: 'funny' },
  { id: 'fire', name: 'Fire', icon: Flame, category: 'trending' },
  { id: 'snow', name: 'Snow', icon: Snowflake, category: 'world' },
  { id: 'crown', name: 'Crown', icon: Crown, category: 'face' },
  { id: 'cat', name: 'Cat Ears', icon: Cat, category: 'face' },
  { id: 'dog', name: 'Dog Filter', icon: Dog, category: 'face' },
];

const categories = [
  { id: 'trending', label: 'Trending' },
  { id: 'face', label: 'Face' },
  { id: 'world', label: 'World' },
  { id: 'funny', label: 'Funny' },
];

interface EffectsPanelProps {
  selectedEffect: string;
  onSelectEffect: (effectId: string) => void;
  onClose: () => void;
}

export default function EffectsPanel({ selectedEffect, onSelectEffect, onClose }: EffectsPanelProps) {
  const [activeCategory, setActiveCategory] = useState('trending');

  const filteredEffects = effects.filter(
    effect => effect.category === activeCategory || effect.id === 'none'
  );

  return (
    <div className="absolute bottom-32 left-0 right-0 z-30 px-4 animate-fade-in">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Effects</h3>
          <button 
            onClick={onClose}
            className="text-white/50 text-sm press-effect"
          >
            Close
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors press-effect",
                activeCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-white/10 text-white/70"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Effects grid */}
        <div className="grid grid-cols-5 gap-3">
          {filteredEffects.map((effect) => {
            const Icon = effect.icon;
            return (
              <button
                key={effect.id}
                onClick={() => onSelectEffect(effect.id)}
                className="flex flex-col items-center gap-1 press-effect"
              >
                <div className={cn(
                  "h-14 w-14 rounded-xl flex items-center justify-center transition-all",
                  selectedEffect === effect.id
                    ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-black"
                    : "bg-white/10"
                )}>
                  <Icon className={cn(
                    "h-6 w-6",
                    selectedEffect === effect.id ? "text-white" : "text-white/70"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px]",
                  selectedEffect === effect.id ? "text-primary" : "text-white/60"
                )}>
                  {effect.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
