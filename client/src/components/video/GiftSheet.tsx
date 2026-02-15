import { useState } from "react";
import { X, Coins, Loader2, Flower2, Heart, Star, Crown, Gem, Rocket, Flame, Gift as GiftIcon, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface GiftSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: number;
  recipientId?: number;
}

interface GiftItem {
  id: number;
  name: string;
  iconUrl: string | null;
  coinValue: number;
  category: string;
}

const giftIconMap: Record<string, { icon: LucideIcon; color: string }> = {
  "Rose": { icon: Flower2, color: "text-rose-400" },
  "Heart": { icon: Heart, color: "text-red-400" },
  "Star": { icon: Star, color: "text-yellow-400" },
  "Crown": { icon: Crown, color: "text-amber-400" },
  "Diamond": { icon: Gem, color: "text-cyan-400" },
  "Rocket": { icon: Rocket, color: "text-orange-400" },
  "Fire": { icon: Flame, color: "text-orange-500" },
  "Gift Box": { icon: GiftIcon, color: "text-purple-400" },
};

const categoryTabs = [
  { id: "all", label: "All" },
  { id: "standard", label: "Standard" },
  { id: "premium", label: "Premium" },
  { id: "luxury", label: "Luxury" },
];

function GiftIconDisplay({ name, size = "h-7 w-7" }: { name: string; size?: string }) {
  const config = giftIconMap[name] || { icon: GiftIcon, color: "text-purple-400" };
  const Icon = config.icon;
  return <Icon className={cn(size, config.color)} />;
}

export function GiftSheet({ isOpen, onClose, videoId, recipientId }: GiftSheetProps) {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: gifts = [], isLoading } = useQuery<GiftItem[]>({
    queryKey: ["/api/gifts"],
    queryFn: async () => {
      const res = await api.get("/gifts");
      return res.data;
    },
    enabled: isOpen,
  });

  const { data: walletData } = useQuery<{ coins: number; diamonds: number }>({
    queryKey: ["/api/wallet/balance"],
    queryFn: async () => {
      const res = await api.get("/wallet/balance");
      return res.data;
    },
    enabled: isOpen,
  });

  const sendGiftMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGift) throw new Error("No gift selected");
      const res = await api.post("/gifts/send", {
        receiverId: recipientId || 0,
        giftId: selectedGift.id,
        quantity,
        contextType: "video",
        contextId: videoId,
      });
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "Gift Sent!", description: `You sent ${quantity}x ${selectedGift?.name}` });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      setSelectedGift(null);
      setQuantity(1);
      onClose();
    },
    onError: (err: any) => {
      toast({ 
        title: "Failed to send gift", 
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const filteredGifts = activeCategory === "all" 
    ? gifts 
    : gifts.filter(g => g.category === activeCategory);

  const totalCost = selectedGift ? selectedGift.coinValue * quantity : 0;
  const hasEnoughCoins = (walletData?.coins || 0) >= totalCost;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg h-[60vh] bg-background rounded-t-3xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 border-b">
          <h2 className="font-bold text-lg">Send a Gift</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-500">{walletData?.coins || 0}</span>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center" data-testid="button-close-gifts">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
          {categoryTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === tab.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-muted-foreground"
              )}
              data-testid={`tab-gift-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No gifts available
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredGifts.map(gift => (
                <button
                  key={gift.id}
                  onClick={() => { setSelectedGift(gift); setQuantity(1); }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all",
                    selectedGift?.id === gift.id 
                      ? "bg-primary/10 ring-2 ring-primary" 
                      : "bg-secondary/50"
                  )}
                  data-testid={`gift-item-${gift.id}`}
                >
                  <GiftIconDisplay name={gift.name} />
                  <span className="text-xs font-medium truncate w-full text-center">{gift.name}</span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-500 font-semibold">{gift.coinValue}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedGift && (
          <div className="px-4 py-4 border-t bg-card/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GiftIconDisplay name={selectedGift.name} size="h-6 w-6" />
                <div>
                  <p className="font-semibold text-sm">{selectedGift.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedGift.coinValue} coins each</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold"
                  data-testid="button-decrease-qty"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold" data-testid="text-gift-quantity">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold"
                  data-testid="button-increase-qty"
                >
                  +
                </button>
              </div>
            </div>
            <Button
              onClick={() => sendGiftMutation.mutate()}
              disabled={sendGiftMutation.isPending || !hasEnoughCoins}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold"
              data-testid="button-send-gift"
            >
              {sendGiftMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Send {quantity}x {selectedGift.name} ({totalCost} coins)</>
              )}
            </Button>
            {!hasEnoughCoins && (
              <p className="text-xs text-destructive text-center mt-2">Not enough coins. Top up your wallet!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
