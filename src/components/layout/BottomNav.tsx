import { NavLink, useLocation } from "react-router-dom";
import { Radio, Compass, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/live", icon: Radio, label: "Live" },
  { path: "/discover", icon: Compass, label: "Discover" },
  { path: "/create", icon: Plus, label: "Create", isCreate: true },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/discover" && location.pathname === "/");
          const Icon = item.icon;

          if (item.isCreate) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
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
                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "h-6 w-6 transition-all",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className={cn(
                "text-2xs font-medium",
                isActive && "font-semibold"
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
