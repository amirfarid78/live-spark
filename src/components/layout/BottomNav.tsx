import { NavLink, useLocation } from "react-router-dom";
import { Search, Plus, MessageCircle, User, Home, Radio, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home", activeIcon: true },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
  { path: "/create", icon: Plus, label: "", isCreate: true },
  { path: "/live", icon: Radio, label: "Live" },
  { path: "/profile", icon: User, label: "Profile", isProfile: true },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50">
      <div className="flex items-center justify-around h-[50px] pb-safe max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCreate) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center justify-center py-2 px-4"
              >
                <div className="relative">
                  {/* Gradient background layers */}
                  <div className="absolute inset-0 flex rounded-lg overflow-hidden">
                    <div className="w-1/2 bg-stream-cyan" />
                    <div className="w-1/2 bg-stream-coral" />
                  </div>
                  {/* Center button */}
                  <div className="relative flex h-8 w-12 items-center justify-center bg-foreground rounded-lg m-[2px]">
                    <Plus className="h-5 w-5 text-background" strokeWidth={2.5} />
                  </div>
                </div>
              </NavLink>
            );
          }

          if (item.isProfile) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-4 transition-all press-effect",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full overflow-hidden ring-offset-background transition-all",
                  isActive ? "ring-2 ring-foreground ring-offset-1" : ""
                )}>
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50" 
                    alt="" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-4 transition-all press-effect relative",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon 
                className="h-6 w-6" 
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive && item.activeIcon ? "currentColor" : "none"}
              />
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
