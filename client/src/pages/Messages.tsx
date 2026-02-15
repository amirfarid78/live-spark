import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Edit, Phone, Video, Send, Smile, Paperclip, MoreVertical, ArrowLeft, Loader2, Check, CheckCheck, Mic, Image as ImageIcon, Camera } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import CallScreen from "@/components/call/CallScreen";

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
    <div className="fixed inset-0 z-[65] bg-background animate-fade-in flex flex-col">
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

function groupMessagesByDate(messages: ApiMessage[]) {
  const groups: { date: string; messages: ApiMessage[] }[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const msgDate = new Date(msg.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let dateLabel: string;
    if (msgDate.toDateString() === today.toDateString()) {
      dateLabel = "Today";
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = msgDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }

    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      groups.push({ date: dateLabel, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
}

interface ChatViewProps {
  chat: MappedConversation;
  onBack: () => void;
  onCall: (type: "audio" | "video") => void;
  fullScreen?: boolean;
}

function ChatView({ chat, onBack, onCall, fullScreen }: ChatViewProps) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ApiMessage[]>({
    queryKey: ["/api/conversations", chat.id, "messages"],
    queryFn: async () => {
      const res = await api.get(`/conversations/${chat.id}/messages`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom("instant");
  }, [messages.length, scrollToBottom]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/conversations/${chat.id}/messages`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", chat.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      scrollToBottom();
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMutation.mutate(trimmed);
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messageGroups = groupMessagesByDate(messages);
  const hasText = message.trim().length > 0;

  return (
    <div className={cn(
      "flex flex-col bg-background",
      fullScreen ? "fixed inset-0 z-[60]" : "h-full"
    )}>
      <div className="flex items-center gap-2 px-2 py-2 bg-background/95 backdrop-blur-md border-b border-border/30 shrink-0" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
        <button onClick={onBack} className="p-1.5 -ml-0.5 active:opacity-60 transition-opacity" data-testid="button-chat-back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative shrink-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback className="text-sm font-medium">{chat.name[0]}</AvatarFallback>
          </Avatar>
          {chat.online && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[2.5px] border-background bg-emerald-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 ml-0.5">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-[15px] truncate leading-tight">{chat.name}</span>
            {chat.isVerified && (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shrink-0">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
            {chat.online ? (
              <span className="text-emerald-500">Online</span>
            ) : "Last seen recently"}
          </p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onCall("audio")}
            className="p-2 rounded-full active:bg-secondary transition-colors"
            data-testid="button-chat-call"
          >
            <Phone className="h-[20px] w-[20px] text-muted-foreground" />
          </button>
          <button
            onClick={() => onCall("video")}
            className="p-2 rounded-full active:bg-secondary transition-colors"
            data-testid="button-chat-video"
          >
            <Video className="h-[20px] w-[20px] text-muted-foreground" />
          </button>
          <button
            className="p-2 rounded-full active:bg-secondary transition-colors"
            data-testid="button-chat-more"
          >
            <MoreVertical className="h-[20px] w-[20px] text-muted-foreground" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex flex-col justify-end min-h-full px-3 py-2">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Avatar className="h-20 w-20">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback className="text-2xl">{chat.name[0]}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-lg">{chat.name}</p>
              <p className="text-sm text-muted-foreground text-center max-w-[220px]">
                Send a message to start your conversation
              </p>
            </div>
          ) : (
            messageGroups.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-3">
                  <span className="text-[11px] text-muted-foreground bg-secondary/70 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                    {group.date}
                  </span>
                </div>
                <div className="space-y-[3px]">
                  {group.messages.map((msg, idx) => {
                    const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                    const nextMsg = idx < group.messages.length - 1 ? group.messages[idx + 1] : null;
                    const isFirst = !prevMsg || prevMsg.isMe !== msg.isMe;
                    const isLast = !nextMsg || nextMsg.isMe !== msg.isMe;

                    const myBubbleRadius = cn(
                      isFirst && isLast && "rounded-[18px] rounded-br-[4px]",
                      isFirst && !isLast && "rounded-[18px] rounded-br-[4px]",
                      !isFirst && isLast && "rounded-[18px] rounded-tr-[4px] rounded-br-[4px]",
                      !isFirst && !isLast && "rounded-[14px] rounded-r-[4px]",
                    );
                    const theirBubbleRadius = cn(
                      isFirst && isLast && "rounded-[18px] rounded-bl-[4px]",
                      isFirst && !isLast && "rounded-[18px] rounded-bl-[4px]",
                      !isFirst && isLast && "rounded-[18px] rounded-tl-[4px] rounded-bl-[4px]",
                      !isFirst && !isLast && "rounded-[14px] rounded-l-[4px]",
                    );

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.isMe ? "justify-end" : "justify-start",
                          isLast ? "mb-2.5" : "mb-0"
                        )}
                        data-testid={`message-item-${msg.id}`}
                      >
                        {!msg.isMe && isLast && (
                          <Avatar className="h-7 w-7 mt-auto mr-1.5 shrink-0">
                            <AvatarImage src={msg.sender.avatarUrl} />
                            <AvatarFallback className="text-[10px]">{msg.sender.displayName?.[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        {!msg.isMe && !isLast && <div className="w-[34px] shrink-0" />}
                        <div
                          className={cn(
                            "max-w-[78%] relative group",
                            msg.isMe
                              ? cn("bg-gradient-primary text-white", myBubbleRadius)
                              : cn("bg-secondary dark:bg-secondary/80", theirBubbleRadius),
                          )}
                        >
                          <div className="px-3 py-[7px]">
                            <p className="text-[15px] leading-[1.35] break-words whitespace-pre-wrap">{msg.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 -mb-0.5 mt-0.5",
                              msg.isMe ? "justify-end" : "justify-end"
                            )}>
                              <span className={cn(
                                "text-[10px] leading-none",
                                msg.isMe ? "text-white/55" : "text-muted-foreground/70"
                              )}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {msg.isMe && (
                                <CheckCheck className="h-3.5 w-3.5 text-white/55" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} className="h-0.5" />
        </div>
      </div>

      <div className="shrink-0 bg-background/95 backdrop-blur-md border-t border-border/30" style={{ paddingBottom: fullScreen ? "max(0.5rem, env(safe-area-inset-bottom))" : "0.5rem" }}>
        <div className="flex items-end gap-1.5 px-2 py-1.5">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 shrink-0 mb-0.5 rounded-full active:bg-secondary transition-colors text-muted-foreground"
            data-testid="button-attach"
          >
            <Paperclip className="h-[22px] w-[22px]" />
          </button>
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-10 bg-secondary dark:bg-secondary/60 border-0 rounded-full px-4 pr-10 text-[15px] outline-none focus:ring-1 focus:ring-primary/30 transition-shadow placeholder:text-muted-foreground/60"
              data-testid="input-message"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 active:opacity-60" data-testid="button-emoji">
              <Smile className="h-[22px] w-[22px]" />
            </button>
          </div>
          {hasText ? (
            <button
              className="p-2 shrink-0 mb-0.5 rounded-full bg-primary active:opacity-80 transition-opacity"
              onClick={handleSend}
              disabled={sendMutation.isPending}
              data-testid="button-send"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-[22px] w-[22px] text-primary-foreground animate-spin" />
              ) : (
                <Send className="h-[22px] w-[22px] text-primary-foreground" />
              )}
            </button>
          ) : (
            <button
              className="p-2 shrink-0 mb-0.5 rounded-full active:bg-secondary transition-colors text-muted-foreground"
              data-testid="button-voice"
            >
              <Mic className="h-[22px] w-[22px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationList({ conversations, isLoading, onSelectChat, selectedChatId, onNewMessage }: { conversations: MappedConversation[]; isLoading: boolean; onSelectChat: (chat: MappedConversation) => void; selectedChatId?: number; onNewMessage?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onNewMessage} data-testid="button-new-message">
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
              <span className="ml-1.5 h-2 w-2 rounded-full bg-emerald-500" />
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
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
              <MessageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No conversations yet</p>
            <Button variant="outline" size="sm" onClick={onNewMessage} data-testid="button-start-chat">
              Start a chat
            </Button>
          </div>
        ) : (
          conversations.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer hover-elevate",
                selectedChatId === chat.id && "bg-secondary",
                `animate-fade-in-up stagger-${(index % 6) + 1}`
              )}
              data-testid={`conversation-item-${chat.id}`}
            >
              <div className="relative shrink-0">
                <Avatar className="h-13 w-13">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback className="text-base">{chat.name[0]}</AvatarFallback>
                </Avatar>
                {chat.online && (
                  <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn(
                      "font-semibold text-sm truncate",
                      chat.unread > 0 && "text-foreground"
                    )}>
                      {chat.name}
                    </span>
                    {chat.isVerified && (
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-white shrink-0">
                        <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    "text-[11px] shrink-0",
                    chat.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className={cn(
                    "text-[13px] truncate",
                    chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {chat.lastMessage || "Start chatting"}
                  </p>
                  {chat.unread > 0 && (
                    <Badge className="h-5 min-w-5 bg-primary text-primary-foreground border-0 text-[10px] justify-center font-bold shrink-0">
                      {chat.unread > 99 ? "99+" : chat.unread}
                    </Badge>
                  )}
                </div>
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
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState<MappedConversation | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: "audio" | "video"; chat: MappedConversation } | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: conversations = [], isLoading } = useQuery<MappedConversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await api.get("/conversations");
      return (res.data || []).map(mapConversation);
    },
  });

  useEffect(() => {
    const state = location.state as { chatId?: number; chatName?: string } | null;
    if (state?.chatId && conversations.length > 0) {
      const existing = conversations.find(c => c.id === state.chatId);
      if (existing) {
        setSelectedChat(existing);
      } else {
        setSelectedChat({
          id: state.chatId,
          name: state.chatName || "Chat",
          avatar: "",
          lastMessage: "",
          time: "",
          unread: 0,
          online: false,
          isVerified: false,
          isGroup: false,
          typing: false,
        });
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations]);

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

  const handleCall = (type: "audio" | "video") => {
    if (!selectedChat || !user) return;
    setActiveCall({ type, chat: selectedChat });
  };

  if (activeCall) {
    const channelName = `call_${Math.min(user?.id || 0, activeCall.chat.id)}_${Math.max(user?.id || 0, activeCall.chat.id)}_${Date.now()}`;
    return (
      <CallScreen
        callType={activeCall.type}
        channelName={channelName}
        peerName={activeCall.chat.name}
        peerAvatar={activeCall.chat.avatar}
        onEnd={() => setActiveCall(null)}
      />
    );
  }

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
            <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} onCall={handleCall} />
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
    return (
      <>
        <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} onCall={handleCall} fullScreen />
        <NewMessageDialog
          isOpen={newMessageOpen}
          onClose={() => setNewMessageOpen(false)}
          onStartChat={(userId) => startChatMutation.mutate(userId)}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
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
