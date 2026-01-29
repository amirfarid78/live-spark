import { NavLink, useLocation } from "react-router-dom";
import { Home, Radio, Search, MessageCircle, User, Plus, TrendingUp, Crown, Star, Settings, Sparkles, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const mainNavItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/discover", icon: Search, label: "Discover" },
  { path: "/live", icon: Radio, label: "Live" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/profile", icon: User, label: "Profile" },
];

const secondaryNavItems = [
  { id: "trending", icon: TrendingUp, label: "Trending" },
  { id: "top", icon: Crown, label: "Top Creators" },
  { id: "favorites", icon: Star, label: "Favorites" },
  { id: "settings", icon: Settings, label: "Settings" },
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
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-border/50">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-xl overflow-hidden shadow-lg shadow-primary/20 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
            <img src={logo} alt="Snap Live" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Snap Live</h1>
            <p className="text-[10px] text-muted-foreground">Live Streaming</p>
          </div>
        </NavLink>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Menu</p>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === "/" && location.pathname === "/feed");
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-primary text-white shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {item.path === "/messages" && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-stream-coral text-[10px] font-bold text-white px-1.5">
                  3
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-border/50" />

        {/* Secondary Navigation */}
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Explore</p>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-border/50" />

        {/* Featured Creators */}
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Featured Creators</p>
        <div className="space-y-1">
          {featuredCreators.map((creator) => (
            <div
              key={creator.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={creator.avatar} />
                  <AvatarFallback>{creator.name[0]}</AvatarFallback>
                </Avatar>
                {creator.isLive && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-stream-live ring-2 ring-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{creator.name}</p>
                {creator.isLive && (
                  <p className="text-[10px] text-stream-live">{creator.viewers.toLocaleString()} watching</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Create Button */}
      <div className="p-4 border-t border-border/50">
        <NavLink to="/create">
          <Button className="w-full bg-gradient-primary hover:opacity-90 text-white h-12 gap-2 shadow-lg shadow-primary/20 font-semibold">
            <Plus className="h-5 w-5" />
            Create
          </Button>
        </NavLink>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Your Profile</p>
            <p className="text-[11px] text-muted-foreground">@username</p>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
