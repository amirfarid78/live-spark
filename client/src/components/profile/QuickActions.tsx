import { useNavigate } from "react-router-dom";
import { BarChart3, Trophy, Users, Bookmark, ShoppingBag, Gift, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  count?: string;
  color?: string;
  path?: string;
}

interface QuickActionsProps {
  followersCount: number;
  savedCount?: number;
  className?: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export function QuickActions({ followersCount, savedCount = 0, className }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    { icon: BarChart3, label: "Studio", color: "text-purple-500", path: "/creator-studio" },
    { icon: Trophy, label: "Badges", color: "text-amber-500" },
    { icon: Users, label: "Friends", count: formatNumber(followersCount), color: "text-blue-500" },
    { icon: ShoppingBag, label: "Orders", color: "text-green-500", path: "/shop" },
    { icon: Bookmark, label: "Saved", count: formatNumber(savedCount), color: "text-rose-500" },
    { icon: Gift, label: "Gifts", color: "text-pink-500", path: "/profile" },
    { icon: Settings, label: "Settings", color: "text-slate-500", path: "/settings" },
    { icon: HelpCircle, label: "Help", color: "text-cyan-500", path: "/settings" },
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:gap-3", className)}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => action.path && navigate(action.path)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl bg-secondary/50 hover:bg-secondary p-3 sm:p-4 transition-all press-effect animate-fade-in-up",
              `stagger-${(index % 4) + 1}`
            )}
          >
            <div className="relative">
              <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", action.color || "text-muted-foreground")} />
              {action.count && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1">
                  {action.count}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
