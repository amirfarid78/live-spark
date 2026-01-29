import { Search, Edit, MoreHorizontal, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const conversations = [
  {
    id: 1,
    name: "Sarah M.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    lastMessage: "Hey! Did you see my latest stream? 🎉",
    time: "2m",
    unread: 3,
    online: true,
    isVerified: true,
  },
  {
    id: 2,
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    lastMessage: "Thanks for the gift! 💎",
    time: "15m",
    unread: 0,
    online: true,
    isVerified: false,
  },
  {
    id: 3,
    name: "StreamVerse",
    avatar: "",
    lastMessage: "Welcome to StreamVerse! Start exploring...",
    time: "1h",
    unread: 1,
    online: false,
    isSystem: true,
  },
  {
    id: 4,
    name: "Luna Star",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    lastMessage: "Let's collab on a stream!",
    time: "3h",
    unread: 0,
    online: false,
    isVerified: true,
  },
  {
    id: 5,
    name: "Gaming Squad",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop",
    lastMessage: "Mike: Who's joining tonight?",
    time: "5h",
    unread: 12,
    online: false,
    isGroup: true,
  },
];

export default function Messages() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start gap-2 bg-transparent px-4 pb-0 h-auto">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="online" 
              className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Online
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Unread
              <Badge className="ml-1.5 h-5 min-w-5 bg-stream-coral text-white border-0 text-2xs">
                4
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary cursor-pointer active:bg-secondary/80"
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-14 w-14">
                {chat.isSystem ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-primary">
                    <span className="text-lg font-bold text-white">S</span>
                  </div>
                ) : (
                  <>
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </>
                )}
              </Avatar>
              {chat.online && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-stream-success" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-semibold truncate",
                  chat.unread > 0 && "text-foreground"
                )}>
                  {chat.name}
                </span>
                {chat.isVerified && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {chat.isGroup && (
                  <Badge variant="secondary" className="text-2xs px-1.5 py-0">
                    Group
                  </Badge>
                )}
              </div>
              <p className={cn(
                "text-sm truncate",
                chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {chat.lastMessage}
              </p>
            </div>

            {/* Meta */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">{chat.time}</span>
              {chat.unread > 0 && (
                <Badge className="h-5 min-w-5 bg-primary text-primary-foreground border-0 text-2xs justify-center">
                  {chat.unread > 99 ? "99+" : chat.unread}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
