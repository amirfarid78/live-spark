import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FilterStyle {
  filter: string;
}

export interface Filter {
  id: string;
  name: string;
  style: FilterStyle;
  category: 'portrait' | 'landscape' | 'food' | 'vibe';
  preview: string; // gradient for preview
}

export const filters: Filter[] = [
  { id: 'none', name: 'Original', style: { filter: 'none' }, category: 'portrait', preview: 'from-gray-500 to-gray-600' },
  { id: 'warm', name: 'Warm', style: { filter: 'sepia(30%) saturate(140%)' }, category: 'portrait', preview: 'from-orange-400 to-amber-500' },
  { id: 'cool', name: 'Cool', style: { filter: 'hue-rotate(20deg) saturate(110%)' }, category: 'landscape', preview: 'from-blue-400 to-cyan-500' },
  { id: 'vintage', name: 'Vintage', style: { filter: 'sepia(50%) contrast(90%)' }, category: 'vibe', preview: 'from-amber-600 to-yellow-700' },
  { id: 'bw', name: 'B&W', style: { filter: 'grayscale(100%)' }, category: 'vibe', preview: 'from-gray-400 to-gray-700' },
  { id: 'vivid', name: 'Vivid', style: { filter: 'saturate(150%) contrast(110%)' }, category: 'landscape', preview: 'from-pink-500 to-purple-600' },
  { id: 'dreamy', name: 'Dreamy', style: { filter: 'brightness(105%) saturate(90%) blur(0.5px)' }, category: 'portrait', preview: 'from-pink-300 to-purple-400' },
  { id: 'moody', name: 'Moody', style: { filter: 'contrast(120%) brightness(90%) saturate(80%)' }, category: 'vibe', preview: 'from-slate-600 to-zinc-800' },
  { id: 'summer', name: 'Summer', style: { filter: 'saturate(130%) brightness(108%) sepia(10%)' }, category: 'landscape', preview: 'from-yellow-400 to-orange-500' },
  { id: 'film', name: 'Film', style: { filter: 'contrast(95%) sepia(20%) saturate(85%)' }, category: 'vibe', preview: 'from-emerald-600 to-teal-700' },
  { id: 'golden', name: 'Golden', style: { filter: 'sepia(40%) saturate(120%) brightness(105%)' }, category: 'food', preview: 'from-yellow-500 to-amber-600' },
  { id: 'fresh', name: 'Fresh', style: { filter: 'brightness(110%) saturate(105%) hue-rotate(-5deg)' }, category: 'food', preview: 'from-green-400 to-emerald-500' },
];

const categories = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'food', label: 'Food' },
  { id: 'vibe', label: 'Vibe' },
];

interface FiltersPanelProps {
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
}

export default function FiltersPanel({ 
  selectedFilter, 
  onSelectFilter,
  intensity,
  onIntensityChange,
}: FiltersPanelProps) {
  const [activeCategory, setActiveCategory] = useState('portrait');

  const filteredFilters = filters.filter(
    filter => filter.category === activeCategory || filter.id === 'none'
  );

  return (
    <div className="px-4 py-3">
      {/* Category tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors press-effect",
              activeCategory === category.id
                ? "bg-white/20 text-white"
                : "text-white/50"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Filters scroll */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {filteredFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onSelectFilter(filter.id)}
            className="flex-shrink-0 flex flex-col items-center gap-1 press-effect"
          >
            <div 
              className={cn(
                "h-16 w-16 rounded-xl border-2 overflow-hidden transition-all",
                selectedFilter === filter.id 
                  ? "border-primary scale-105" 
                  : "border-transparent"
              )}
              style={filter.style}
            >
              <div className={cn(
                "h-full w-full bg-gradient-to-br",
                filter.preview
              )} />
            </div>
            <span className={cn(
              "text-xs",
              selectedFilter === filter.id ? "text-primary" : "text-white/70"
            )}>
              {filter.name}
            </span>
          </button>
        ))}
      </div>

      {/* Intensity slider */}
      {selectedFilter !== 'none' && (
        <div className="mt-3 flex items-center gap-3">
          <span className="text-white/50 text-xs">Intensity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => onIntensityChange(Number(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
          <span className="text-white/50 text-xs w-8">{intensity}%</span>
        </div>
      )}
    </div>
  );
}
