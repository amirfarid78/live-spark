import React, { useState } from "react";
import { Search, Edit, Circle, Image, Phone, Video, Send, Smile, Paperclip, MoreVertical, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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

const mockMessages = [
  { id: 1, senderId: 1, text: "Hey! Did you see my latest stream? 🎉", time: "2:30 PM", isMe: false },
  { id: 2, senderId: "me", text: "Yes! It was amazing! 🔥", time: "2:31 PM", isMe: true },
  { id: 3, senderId: 1, text: "Thanks! I worked really hard on it", time: "2:32 PM", isMe: false },
  { id: 4, senderId: "me", text: "It really shows. The production quality was top notch!", time: "2:33 PM", isMe: true },
  { id: 5, senderId: 1, text: "Would you like to collab sometime?", time: "2:35 PM", isMe: false },
];

function ChatView({ chat, onBack }: { chat: typeof conversations[0]; onBack: () => void }) {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-card/50">
        <button onClick={onBack} className="lg:hidden">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative">
          <Avatar className="h-11 w-11">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>{chat.name[0]}</AvatarFallback>
          </Avatar>
          {chat.online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-stream-success" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">{chat.name}</span>
            {chat.isVerified && (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {chat.online ? "Online" : "Last seen recently"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.isMe ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2.5",
                msg.isMe
                  ? "bg-gradient-primary text-white rounded-br-sm"
                  : "bg-secondary rounded-bl-sm"
              )}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={cn(
                "text-[10px] mt-1",
                msg.isMe ? "text-white/70" : "text-muted-foreground"
              )}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {chat.typing && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-11 bg-secondary border-0 rounded-xl pr-12"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <Button size="icon" className="h-10 w-10 rounded-xl bg-gradient-primary shrink-0">
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConversationList({ onSelectChat, selectedChatId }: { onSelectChat: (chat: typeof conversations[0]) => void; selectedChatId?: number }) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
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
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-11 h-11 bg-secondary border-0 rounded-xl"
          />
        </div>
      </div>

      {/* Stories Row */}
      <div className="flex gap-4 overflow-x-auto px-4 py-4 hide-scrollbar border-b border-border/50">
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
      <div className="px-4 py-2 border-b border-border/50">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start gap-2 bg-transparent h-auto p-0">
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
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((chat, index) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary cursor-pointer active:bg-secondary/80 animate-fade-in-up",
              selectedChatId === chat.id && "bg-secondary",
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

export default function Messages() {
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState<typeof conversations[0] | null>(null);

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="flex h-screen bg-background">
        {/* Conversations Sidebar */}
        <div className="w-[380px] border-r border-border/50 flex-shrink-0">
          <ConversationList 
            onSelectChat={setSelectedChat} 
            selectedChatId={selectedChat?.id}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <MessageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                <p className="text-muted-foreground max-w-sm">
                  Select a conversation to start chatting with your friends and followers
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (selectedChat) {
    return <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <ConversationList 
        onSelectChat={setSelectedChat} 
        selectedChatId={selectedChat?.id}
      />
    </div>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
