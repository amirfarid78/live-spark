import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopRightSidebar } from "./DesktopRightSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppShellProps {
  showRightSidebar?: boolean;
  children?: React.ReactNode;
}

export function AppShell({ showRightSidebar = true, children }: AppShellProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 pb-20">
          {children || <Outlet />}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background w-full">
      <DesktopSidebar />
      <main className="flex-1 min-w-0">
        {children || <Outlet />}
      </main>
      {showRightSidebar && <DesktopRightSidebar />}
    </div>
  );
}
