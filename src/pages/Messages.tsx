import React from "react";
import { Search, Edit, Circle, Image, Phone, Video } from "lucide-react";
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
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    lastMessage: "Hey! Did you see my latest stream? 🎉",
    time: "2m",
    unread: 3,
    online: true,
    isVerified: true,
    typing: false,
  },
  {
    id: 2,
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    lastMessage: "Thanks for the gift! 💎",
    time: "15m",
    unread: 0,
    online: true,
    isVerified: false,
    typing: true,
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
    typing: false,
  },
  {
    id: 4,
    name: "Luna Star",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    lastMessage: "Let's collab on a stream!",
    time: "3h",
    unread: 0,
    online: false,
    isVerified: true,
    typing: false,
  },
  {
    id: 5,
    name: "Gaming Squad",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200",
    lastMessage: "Mike: Who's joining tonight?",
    time: "5h",
    unread: 12,
    online: false,
    isGroup: true,
    typing: false,
  },
  {
    id: 6,
    name: "Chef Mike",
    avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100",
    lastMessage: "Recipe video is up! Check it out 🍳",
    time: "1d",
    unread: 0,
    online: false,
    isVerified: true,
    typing: false,
  },
];

const stories = [
  { id: 0, name: "Your Story", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", isYou: true, hasNew: false },
  { id: 1, name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", hasNew: true },
  { id: 2, name: "Alex", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", hasNew: true },
  { id: 3, name: "Luna", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", hasNew: true },
  { id: 4, name: "Mike", avatar: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100", hasNew: false },
];

export default function Messages() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-11 h-11 bg-secondary border-0 rounded-xl"
            />
          </div>
        </div>

        {/* Stories Row */}
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 hide-scrollbar">
          {stories.map((story, index) => (
            <div 
              key={story.id} 
              className={cn(
                "flex flex-col items-center gap-1.5 animate-fade-in-up",
                `stagger-${index + 1}`
              )}
            >
              <div className="relative">
                <Avatar className={cn(
                  "h-16 w-16 ring-[3px] ring-offset-2 ring-offset-background transition-all",
                  story.hasNew 
                    ? "ring-gradient ring-stream-coral" 
                    : story.isYou 
                      ? "ring-border ring-dashed" 
                      : "ring-border"
                )}>
                  <AvatarImage src={story.avatar} />
                  <AvatarFallback>{story.name[0]}</AvatarFallback>
                </Avatar>
                {story.isYou && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-2 ring-background">
                    <span className="text-lg font-bold">+</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground max-w-[60px] truncate">
                {story.name}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start gap-2 bg-transparent px-4 pb-0 h-auto">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="online" 
              className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
            >
              Online
              <span className="ml-1.5 h-2 w-2 rounded-full bg-stream-success" />
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
            >
              Unread
              <Badge className="ml-2 h-5 min-w-5 bg-stream-coral text-white border-0 text-[10px]">
                4
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Conversations List */}
      <div className="flex-1 pb-24">
        {conversations.map((chat, index) => (
          <div
            key={chat.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary cursor-pointer active:bg-secondary/80 animate-fade-in-up",
              `stagger-${(index % 6) + 1}`
            )}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-14 w-14">
                {chat.isSystem ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-primary rounded-full">
                    <span className="text-lg font-bold text-white">S</span>
                  </div>
                ) : (
                  <>
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback className="text-lg">{chat.name[0]}</AvatarFallback>
                  </>
                )}
              </Avatar>
              {chat.online && (
                <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-[2.5px] border-background bg-stream-success" />
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
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shrink-0">
                    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {chat.isGroup && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 font-medium">
                    Group
                  </Badge>
                )}
              </div>
              {chat.typing ? (
                <p className="text-sm text-primary font-medium">
                  typing<span className="animate-pulse">...</span>
                </p>
              ) : (
                <p className={cn(
                  "text-sm truncate",
                  chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {chat.lastMessage}
                </p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-col items-end gap-1.5">
              <span className={cn(
                "text-xs",
                chat.unread > 0 ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {chat.time}
              </span>
              {chat.unread > 0 && (
                <Badge className="h-5 min-w-5 bg-primary text-primary-foreground border-0 text-[10px] justify-center font-bold">
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
