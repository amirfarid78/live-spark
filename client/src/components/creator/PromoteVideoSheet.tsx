import { useState } from "react";
import { Rocket, Users, Target, Clock, Coins, Sparkles, TrendingUp, Globe, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface PromotionPackage {
  id: string;
  name: string;
  coins: number;
  reach: string;
  duration: string;
  icon: typeof Rocket;
  color: string;
  popular?: boolean;
}

const promotionPackages: PromotionPackage[] = [
  { 
    id: "starter", 
    name: "Starter Boost", 
    coins: 100, 
    reach: "1K - 5K", 
    duration: "12 hours",
    icon: Rocket,
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "standard", 
    name: "Standard Boost", 
    coins: 500, 
    reach: "5K - 25K", 
    duration: "24 hours",
    icon: TrendingUp,
    color: "from-purple-500 to-indigo-500",
    popular: true
  },
  { 
    id: "premium", 
    name: "Premium Boost", 
    coins: 2000, 
    reach: "25K - 100K", 
    duration: "48 hours",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500"
  },
  { 
    id: "viral", 
    name: "Viral Package", 
    coins: 5000, 
    reach: "100K - 500K", 
    duration: "7 days",
    icon: Globe,
    color: "from-pink-500 to-rose-500"
  },
];

const targetAudiences = [
  { id: "all", label: "Everyone", icon: Globe },
  { id: "followers", label: "Similar to Followers", icon: Users },
  { id: "interests", label: "By Interests", icon: Target },
  { id: "local", label: "Local Area", icon: MapPin },
];

interface PromoteVideoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: {
    id: string;
    title: string;
    thumbnail: string;
  };
  userCoins?: number;
}

export function PromoteVideoSheet({ open, onOpenChange, video, userCoins = 0 }: PromoteVideoSheetProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>("standard");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [budget, setBudget] = useState([500]);

  const currentPackage = promotionPackages.find(p => p.id === selectedPackage);

  const handlePromote = () => {
    // TODO: Integrate with backend
    console.log("Promoting video:", video?.id, "with package:", selectedPackage);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Promote Video
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Video Preview */}
            {video && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{video.title}</p>
                  <p className="text-sm text-muted-foreground">Selected for promotion</p>
                </div>
              </div>
            )}

            {/* Promotion Packages */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Choose a Package
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {promotionPackages.map((pkg) => {
                  const Icon = pkg.icon;
                  return (
                    <Card 
                      key={pkg.id}
                      className={cn(
                        "border-2 cursor-pointer transition-all",
                        selectedPackage === pkg.id 
                          ? "border-primary shadow-lg" 
                          : "border-transparent hover:border-primary/30"
                      )}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      <CardContent className="p-4 relative">
                        {pkg.popular && (
                          <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            POPULAR
                          </span>
                        )}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-r",
                          pkg.color
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="font-semibold text-sm">{pkg.name}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Coins className="h-3 w-3 text-amber-500" />
                          <span className="text-sm font-bold text-amber-500">{pkg.coins}</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          <p className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {pkg.reach} views
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {pkg.duration}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Target Audience
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {targetAudiences.map((audience) => {
                  const Icon = audience.icon;
                  return (
                    <button
                      key={audience.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                        selectedAudience === audience.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/30"
                      )}
                      onClick={() => setSelectedAudience(audience.id)}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        selectedAudience === audience.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="text-sm font-medium">{audience.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Budget Slider */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                Custom Budget
              </h3>
              <Card className="border-0 bg-secondary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-amber-500" />
                      <span className="text-lg font-bold">{budget[0]}</span>
                    </div>
                  </div>
                  <Slider
                    value={budget}
                    onValueChange={setBudget}
                    min={100}
                    max={10000}
                    step={100}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>100 coins</span>
                    <span>10,000 coins</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estimated Results */}
            <Card className="border-0 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Estimated Results</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{currentPackage?.reach || "5K-25K"}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{currentPackage?.duration || "24h"}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">2-5%</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-background">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="font-bold">{userCoins.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-xl font-bold text-primary">{currentPackage?.coins || budget[0]}</span>
                </div>
              </div>
            </div>
            <Button 
              className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold rounded-xl"
              onClick={handlePromote}
              disabled={userCoins < (currentPackage?.coins || budget[0])}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Promote Now
            </Button>
            {userCoins < (currentPackage?.coins || budget[0]) && (
              <p className="text-center text-xs text-destructive mt-2">
                Insufficient coins. Top up to promote.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
