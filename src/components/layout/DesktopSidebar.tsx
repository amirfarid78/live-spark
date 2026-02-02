import { NavLink, useLocation } from "react-router-dom";
import { Home, Radio, Search, MessageCircle, User, Plus, TrendingUp, Crown, Star, Settings, Sparkles, Bell, Play, Upload, Globe, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";

const mainNavItems = [
  { path: "/", icon: Play, label: "Reels" },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
  { path: "/live", icon: Radio, label: "Live Stream" },
  { path: "/discover", icon: Globe, label: "Social Feed" },
  { path: "/create", icon: Upload, label: "Upload" },
  { path: "/messages", icon: MessageCircle, label: "Chat", badge: 3 },
  { path: "/profile", icon: User, label: "Profile" },
];

const featuredCreators = [
  { id: 1, name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", isLive: true, viewers: 1243 },
  { id: 2, name: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", isLive: true, viewers: 892 },
  { id: 3, name: "Luna Star", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", isLive: false, viewers: 0 },
  { id: 4, name: "DJ Mike", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100", isLive: true, viewers: 567 },
];

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-border/30 bg-background sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-border/30">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl overflow-hidden shadow-md">
            <img src={logo} alt="Snap Live" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-primary">Snap Live</h1>
        </NavLink>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users, hashtags..."
            className="pl-9 h-9 bg-secondary/50 border-0 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === "/" && location.pathname === "/feed");
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <Icon className="h-5 w-5" />
              {item.label}
              {item.badge && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-stream-coral text-[10px] font-bold text-white px-1.5">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Featured Creators */}
      <div className="p-3 border-t border-border/30">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Top Creators</p>
        <div className="space-y-1">
          {featuredCreators.slice(0, 3).map((creator) => (
            <div
              key={creator.id}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={creator.avatar} />
                  <AvatarFallback>{creator.name[0]}</AvatarFallback>
                </Avatar>
                {creator.isLive && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-stream-live ring-2 ring-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{creator.name}</p>
                {creator.isLive && (
                  <p className="text-[10px] text-stream-live">{creator.viewers.toLocaleString()} viewers</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-3 border-t border-border/30">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Your Profile</p>
            <p className="text-[11px] text-muted-foreground">@username</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
