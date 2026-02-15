import { useState } from "react";
import { Search, Edit, Image, Phone, Video, Send, Smile, Paperclip, MoreVertical, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface MappedConversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isVerified: boolean;
  isGroup: boolean;
  typing: boolean;
}

interface ApiMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  isMe: boolean;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

function mapConversation(convo: any): MappedConversation {
  return {
    id: convo.id,
    name: convo.isGroup ? convo.groupName : (convo.otherUser?.displayName || convo.otherUser?.username || "Unknown"),
    avatar: convo.isGroup ? convo.groupAvatar : (convo.otherUser?.avatarUrl || ""),
    lastMessage: convo.lastMessageText || "",
    time: convo.lastMessageAt ? formatRelativeTime(convo.lastMessageAt) : "",
    unread: convo.unreadCount || 0,
    online: convo.otherUser?.isOnline || false,
    isVerified: convo.otherUser?.isVerified || false,
    isGroup: convo.isGroup || false,
    typing: false,
  };
}

function NewMessageDialog({ isOpen, onClose, onStartChat }: { isOpen: boolean; onClose: () => void; onStartChat: (userId: number) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: searchResults = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
      return res.data;
    },
    enabled: isOpen && searchQuery.trim().length > 0,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <button onClick={onClose} data-testid="button-close-new-message">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-bold text-lg">New Message</h2>
      </div>
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 bg-secondary border-0 rounded-xl"
            autoFocus
            data-testid="input-search-users"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : searchResults.length === 0 && searchQuery.trim() ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          searchResults.map((user: any) => (
            <button
              key={user.id}
              onClick={() => onStartChat(user.id)}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-secondary transition-colors"
              data-testid={`user-search-result-${user.id}`}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{(user.displayName || user.username || "U")[0]}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{user.displayName || user.username}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ChatView({ chat, onBack }: { chat: MappedConversation; onBack: () => void }) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ApiMessage[]>({
    queryKey: ["/api/conversations", chat.id, "messages"],
    queryFn: async () => {
      const res = await api.get(`/conversations/${chat.id}/messages`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/conversations/${chat.id}/messages`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", chat.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMutation.mutate(trimmed);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-card/50">
        <button onClick={onBack} className="lg:hidden" data-testid="button-chat-back">
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
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl"
            onClick={() => toast({ title: "Audio Call", description: "Audio calling requires real-time infrastructure and will be available soon" })}
            data-testid="button-chat-call">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl"
            onClick={() => toast({ title: "Video Call", description: "Video calling requires real-time infrastructure and will be available soon" })}
            data-testid="button-chat-video">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" data-testid="button-chat-more">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.isMe ? "justify-end" : "justify-start"
              )}
              data-testid={`message-item-${msg.id}`}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5",
                  msg.isMe
                    ? "bg-gradient-primary text-white rounded-br-sm"
                    : "bg-secondary rounded-bl-sm"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={cn(
                  "text-[10px] mt-1",
                  msg.isMe ? "text-white/70" : "text-muted-foreground"
                )}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl shrink-0" data-testid="button-attach">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-11 bg-secondary border-0 rounded-xl pr-12"
              data-testid="input-message"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2" data-testid="button-emoji">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <Button
            size="icon"
            className="h-10 w-10 rounded-xl bg-gradient-primary shrink-0"
            onClick={handleSend}
            disabled={sendMutation.isPending || !message.trim()}
            data-testid="button-send"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConversationList({ conversations, isLoading, onSelectChat, selectedChatId, onNewMessage }: { conversations: MappedConversation[]; isLoading: boolean; onSelectChat: (chat: MappedConversation) => void; selectedChatId?: number; onNewMessage?: () => void }) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect" data-testid="button-video-call">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl press-effect" onClick={onNewMessage} data-testid="button-new-message">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-11 h-11 bg-secondary border-0 rounded-xl"
            data-testid="input-search-messages"
          />
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border/50">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start gap-2 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              data-testid="tab-all"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="online" 
              className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              data-testid="tab-online"
            >
              Online
              <span className="ml-1.5 h-2 w-2 rounded-full bg-stream-success" />
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              data-testid="tab-unread"
            >
              Unread
              <Badge className="ml-2 h-5 min-w-5 bg-stream-coral text-white border-0 text-[10px]">
                {conversations.reduce((sum, c) => sum + (c.unread > 0 ? 1 : 0), 0) || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          conversations.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary cursor-pointer active:bg-secondary/80 animate-fade-in-up",
                selectedChatId === chat.id && "bg-secondary",
                `stagger-${(index % 6) + 1}`
              )}
              data-testid={`conversation-item-${chat.id}`}
            >
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback className="text-lg">{chat.name[0]}</AvatarFallback>
                </Avatar>
                {chat.online && (
                  <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-[2.5px] border-background bg-stream-success" />
                )}
              </div>

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
                <p className={cn(
                  "text-sm truncate",
                  chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {chat.lastMessage}
                </p>
              </div>

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
          ))
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState<MappedConversation | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery<MappedConversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await api.get("/conversations");
      return (res.data || []).map(mapConversation);
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async (targetId: number) => {
      const res = await api.post("/conversations/direct", { targetUserId: targetId });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setNewMessageOpen(false);
      setSelectedChat({
        id: data.id,
        name: "New Chat",
        avatar: "",
        lastMessage: "",
        time: "",
        unread: 0,
        online: false,
        isVerified: false,
        isGroup: false,
        typing: false,
      });
    },
  });

  if (!isMobile) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-[380px] border-r border-border/50 flex-shrink-0">
          <ConversationList 
            conversations={conversations}
            isLoading={isLoading}
            onSelectChat={setSelectedChat} 
            selectedChatId={selectedChat?.id}
            onNewMessage={() => setNewMessageOpen(true)}
          />
        </div>

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
        <NewMessageDialog 
          isOpen={newMessageOpen}
          onClose={() => setNewMessageOpen(false)}
          onStartChat={(userId) => startChatMutation.mutate(userId)}
        />
      </div>
    );
  }

  if (selectedChat) {
    return <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <ConversationList 
        conversations={conversations}
        isLoading={isLoading}
        onSelectChat={setSelectedChat} 
        selectedChatId={selectedChat?.id}
        onNewMessage={() => setNewMessageOpen(true)}
      />
      <NewMessageDialog 
        isOpen={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
        onStartChat={(userId) => startChatMutation.mutate(userId)}
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
