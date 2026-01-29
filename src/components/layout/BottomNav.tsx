import { NavLink, useLocation } from "react-router-dom";
import { Radio, Search, Plus, MessageCircle, User, Sparkles, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/discover", icon: Search, label: "Discover" },
  { path: "/create", icon: Plus, label: "", isCreate: true },
  { path: "/messages", icon: MessageCircle, label: "Inbox" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30 pb-safe">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/" && location.pathname === "/feed");
          const Icon = item.icon;

          if (item.isCreate) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center"
              >
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-primary shadow-lg shadow-primary/30 transition-all press-effect overflow-hidden">
                  <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 transition-all press-effect rounded-lg",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-all",
                    isActive && "scale-105"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {item.path === "/messages" && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-stream-coral text-[9px] font-bold text-white px-1">
                    3
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px]",
                isActive ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
