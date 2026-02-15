import { Sparkles, ChevronRight, Award, Crown, Gem, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LevelProgressProps {
  level: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  currentXP?: number;
  className?: string;
}

const levelConfig = {
  bronze: { 
    icon: Award, 
    label: "Bronze",
    color: "from-amber-600 to-amber-800", 
    bgColor: "bg-amber-500/10",
    progressColor: "bg-amber-500",
    next: "silver", 
    threshold: 100,
    benefits: ["Basic profile badge", "Access to live streams"]
  },
  silver: { 
    icon: Award, 
    label: "Silver",
    color: "from-slate-300 to-slate-500", 
    bgColor: "bg-slate-400/10",
    progressColor: "bg-slate-400",
    next: "gold", 
    threshold: 500,
    benefits: ["Exclusive emotes", "Priority support"]
  },
  gold: { 
    icon: Crown, 
    label: "Gold",
    color: "from-yellow-400 to-amber-500", 
    bgColor: "bg-yellow-500/10",
    progressColor: "bg-yellow-500",
    next: "platinum", 
    threshold: 2000,
    benefits: ["Custom profile frame", "VIP chat badge"]
  },
  platinum: { 
    icon: Crown, 
    label: "Platinum",
    color: "from-cyan-400 to-blue-500", 
    bgColor: "bg-cyan-500/10",
    progressColor: "bg-cyan-500",
    next: "diamond", 
    threshold: 10000,
    benefits: ["Exclusive features", "Creator perks"]
  },
  diamond: { 
    icon: Gem, 
    label: "Diamond",
    color: "from-purple-400 to-pink-500", 
    bgColor: "bg-purple-500/10",
    progressColor: "bg-purple-500",
    next: null, 
    threshold: null,
    benefits: ["All benefits unlocked", "Legend status"]
  },
};

const levelOrder = ["bronze", "silver", "gold", "platinum", "diamond"] as const;

export function LevelProgress({ level, currentXP = 0, className }: LevelProgressProps) {
  const currentConfig = levelConfig[level];
  const currentIndex = levelOrder.indexOf(level);
  const nextLevel = currentConfig.next ? levelConfig[currentConfig.next as keyof typeof levelConfig] : null;
  
  // Calculate progress percentage
  const prevThreshold = currentIndex > 0 ? levelConfig[levelOrder[currentIndex - 1]].threshold || 0 : 0;
  const currentThreshold = currentConfig.threshold || currentXP;
  const progressPercent = currentConfig.threshold 
    ? Math.min(100, ((currentXP - prevThreshold) / (currentThreshold - prevThreshold)) * 100)
    : 100;

  return (
    <Card className={cn("border-0 shadow-xl overflow-hidden animate-fade-in-up stagger-3", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r text-white",
              currentConfig.color
            )}>
              <currentConfig.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-lg">{currentConfig.label} Level</p>
              <p className="text-xs text-muted-foreground">
                {nextLevel ? `${currentXP.toLocaleString()} / ${currentConfig.threshold?.toLocaleString()} XP` : "Max Level Reached!"}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm text-primary font-medium press-effect">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Benefits</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="relative">
              <Progress 
                value={progressPercent} 
                className={cn("h-3 rounded-full", currentConfig.bgColor)}
              />
              <div 
                className={cn("absolute inset-0 h-3 rounded-full", currentConfig.progressColor)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <currentConfig.icon className="h-4 w-4" />
                {currentConfig.label}
              </span>
              <span className="flex items-center gap-1">
                <nextLevel.icon className="h-4 w-4" />
                {nextLevel.label}
              </span>
            </div>
          </div>
        )}

        {/* Level Benefits Preview */}
        <div className="mt-4 flex flex-wrap gap-2">
          {currentConfig.benefits.slice(0, 2).map((benefit, index) => (
            <span 
              key={index}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1",
                currentConfig.bgColor
              )}
            >
              <Check className="h-3 w-3" />
              {benefit}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
