import React, { useState } from "react";
import { X, Sparkles, Crown, Heart, Star, Flame, Gem, Gift, Rocket, Diamond, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  category: "popular" | "luxury" | "special";
  animation?: "bounce" | "spin" | "float";
}

interface GiftPanelProps {
  onClose: () => void;
  onGiftSend: (gift: { name: string; icon: string; price: number }) => void;
}

const gifts: GiftItem[] = [
  // Popular
  { id: "rose", name: "Rose", icon: "🌹", price: 1, category: "popular" },
  { id: "heart", name: "Heart", icon: "❤️", price: 5, category: "popular" },
  { id: "star", name: "Star", icon: "⭐", price: 10, category: "popular" },
  { id: "kiss", name: "Kiss", icon: "💋", price: 20, category: "popular" },
  { id: "fire", name: "Fire", icon: "🔥", price: 50, category: "popular" },
  { id: "diamond", name: "Diamond", icon: "💎", price: 100, category: "popular" },
  { id: "rainbow", name: "Rainbow", icon: "🌈", price: 150, category: "popular" },
  { id: "unicorn", name: "Unicorn", icon: "🦄", price: 200, category: "popular" },
  // Luxury
  { id: "crown", name: "Crown", icon: "👑", price: 500, category: "luxury", animation: "bounce" },
  { id: "rocket", name: "Rocket", icon: "🚀", price: 1000, category: "luxury", animation: "float" },
  { id: "castle", name: "Castle", icon: "🏰", price: 2000, category: "luxury", animation: "bounce" },
  { id: "yacht", name: "Yacht", icon: "🛥️", price: 5000, category: "luxury", animation: "float" },
  { id: "jet", name: "Private Jet", icon: "✈️", price: 10000, category: "luxury", animation: "float" },
  { id: "planet", name: "Planet", icon: "🪐", price: 20000, category: "luxury", animation: "spin" },
  // Special
  { id: "love", name: "Love Bomb", icon: "💖", price: 888, category: "special", animation: "bounce" },
  { id: "galaxy", name: "Galaxy", icon: "🌌", price: 1888, category: "special", animation: "spin" },
  { id: "aurora", name: "Aurora", icon: "🌌", price: 8888, category: "special", animation: "float" },
  { id: "supernova", name: "Supernova", icon: "💫", price: 18888, category: "special", animation: "spin" },
];

const categories = [
  { id: "popular", label: "Popular", icon: Flame },
  { id: "luxury", label: "Luxury", icon: Crown },
  { id: "special", label: "Special", icon: Sparkles },
];

export function GiftPanel({ onClose, onGiftSend }: GiftPanelProps) {
  const [activeCategory, setActiveCategory] = useState<"popular" | "luxury" | "special">("popular");
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [comboCount, setComboCount] = useState(1);
  const [balance] = useState(5000);

  const filteredGifts = gifts.filter((g) => g.category === activeCategory);

  const handleSend = () => {
    if (!selectedGift) return;
    onGiftSend({ name: selectedGift.name, icon: selectedGift.icon, price: selectedGift.price * comboCount });
    setSelectedGift(null);
    setComboCount(1);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`;
    return price.toString();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-h-[70vh] bg-card/95 backdrop-blur-xl rounded-t-3xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-gold flex items-center justify-center">
              <Gift className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Send Gift</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gem className="h-3 w-3 text-stream-gold" />
                <span className="font-semibold text-stream-gold">{balance.toLocaleString()}</span>
                <span>coins</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-muted press-effect"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 p-3 border-b border-border/30">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all press-effect",
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

        {/* Gift Grid */}
        <div className="p-4 overflow-y-auto max-h-[35vh]">
          <div className="grid grid-cols-4 gap-3">
            {filteredGifts.map((gift, index) => (
              <button
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all press-effect animate-fade-in-up",
                  `stagger-${(index % 4) + 1}`,
                  selectedGift?.id === gift.id
                    ? "bg-primary/20 ring-2 ring-primary shadow-lg"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <span className={cn(
                  "text-3xl transition-transform",
                  gift.animation === "bounce" && "animate-bounce",
                  gift.animation === "spin" && "animate-spin-slow",
                  gift.animation === "float" && "animate-float"
                )}>
                  {gift.icon}
                </span>
                <span className="text-xs font-medium text-foreground truncate w-full text-center">{gift.name}</span>
                <div className="flex items-center gap-0.5">
                  <Gem className="h-3 w-3 text-stream-gold" />
                  <span className="text-xs font-bold text-stream-gold">{formatPrice(gift.price)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Combo & Send */}
        <div className="p-4 border-t border-border/50 bg-muted/30">
          <div className="flex items-center gap-3">
            {/* Combo Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Combo:</span>
              <div className="flex gap-1">
                {[1, 5, 10, 99].map((num) => (
                  <button
                    key={num}
                    onClick={() => setComboCount(num)}
                    className={cn(
                      "h-8 px-3 rounded-full text-xs font-bold transition-all press-effect",
                      comboCount === num
                        ? "bg-gradient-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    x{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!selectedGift}
              className="flex-1 h-12 rounded-full bg-gradient-gold text-black font-bold text-base shadow-lg shadow-stream-gold/30 hover:opacity-90 disabled:opacity-50 press-effect"
            >
              {selectedGift ? (
                <span className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Send {selectedGift.icon} ({formatPrice(selectedGift.price * comboCount)})
                </span>
              ) : (
                "Select a gift"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
