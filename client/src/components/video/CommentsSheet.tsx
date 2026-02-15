import { useState, useRef, useEffect } from "react";
import { X, Send, Heart, MoreHorizontal, Loader2, ChevronDown, ChevronUp, Reply } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface ApiComment {
  id: number;
  userId: number;
  videoId: number;
  parentId: number | null;
  content: string;
  likesCount: number;
  createdAt: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: number;
  commentCount: string;
}

function formatRelativeTime(date: string): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

interface CommentItemProps {
  comment: ApiComment;
  replies: ApiComment[];
  onReply: (commentId: number, username: string) => void;
}

function CommentItem({ comment, replies, onReply }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const displayName = comment.user.displayName || comment.user.username;
  const fallbackChar = displayName.charAt(0).toUpperCase();

  return (
    <div data-testid={`comment-item-${comment.id}`}>
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={comment.user.avatarUrl || undefined} />
          <AvatarFallback>{fallbackChar}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-sm truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          
          <p className="text-sm text-foreground/90 leading-relaxed break-words">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-1.5">
            <button onClick={() => setIsLiked(!isLiked)} className="flex items-center gap-1 press-effect" data-testid={`button-like-comment-${comment.id}`}>
              <Heart className={cn("h-3.5 w-3.5", isLiked ? "text-stream-coral fill-stream-coral" : "text-muted-foreground")} />
              <span className="text-xs text-muted-foreground">{comment.likesCount + (isLiked ? 1 : 0)}</span>
            </button>
            <button 
              onClick={() => onReply(comment.id, comment.user.username || comment.user.displayName)}
              className="flex items-center gap-1 text-xs text-muted-foreground font-medium press-effect" 
              data-testid={`button-reply-comment-${comment.id}`}
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          </div>

          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 mt-2 text-xs font-semibold text-primary press-effect"
              data-testid={`button-toggle-replies-${comment.id}`}
            >
              <div className="w-6 h-[1px] bg-muted-foreground/40" />
              {showReplies ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  View {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showReplies && replies.length > 0 && (
        <div className="ml-12 mt-3 space-y-3 border-l-2 border-muted pl-3">
          {replies.map((reply) => {
            const replyName = reply.user.displayName || reply.user.username;
            const replyFallback = replyName.charAt(0).toUpperCase();
            return (
              <div key={reply.id} className="flex gap-2.5" data-testid={`reply-item-${reply.id}`}>
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={reply.user.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">{replyFallback}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-xs truncate">{replyName}</span>
                    <span className="text-[10px] text-muted-foreground">{formatRelativeTime(reply.createdAt)}</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed break-words">{reply.content}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button 
                      onClick={() => onReply(comment.id, reply.user.username || reply.user.displayName)}
                      className="text-[10px] text-muted-foreground font-medium press-effect"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CommentsSheet({ isOpen, onClose, videoId, commentCount }: CommentsSheetProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: number; username: string } | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: comments, isLoading, isError } = useQuery<ApiComment[]>({
    queryKey: ['/api/videos', videoId, 'comments'],
    queryFn: async () => {
      const response = await api.get(`/videos/${videoId}/comments`);
      return response.data;
    },
    enabled: isOpen,
  });

  const postCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId: number | null }) => {
      const response = await api.post(`/videos/${videoId}/comments`, { content, parentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/videos', videoId, 'comments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/videos'],
      });
      setNewComment('');
      setReplyTo(null);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 300);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    postCommentMutation.mutate({ 
      content: newComment.trim(), 
      parentId: replyTo?.commentId ?? null 
    });
  };

  const handleReply = (commentId: number, username: string) => {
    setReplyTo({ commentId, username });
    setNewComment(`@${username} `);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment('');
  };

  useEffect(() => {
    if (!isOpen) {
      setReplyTo(null);
      setNewComment('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const topLevelComments = comments?.filter(c => !c.parentId) ?? [];
  const repliesMap = new Map<number, ApiComment[]>();
  comments?.forEach(c => {
    if (c.parentId) {
      const existing = repliesMap.get(c.parentId) || [];
      existing.push(c);
      repliesMap.set(c.parentId, existing);
    }
  });

  const userDisplayName = user?.displayName || user?.username || 'User';
  const userAvatarUrl = user?.avatarUrl || undefined;
  const userFallback = userDisplayName.charAt(0).toUpperCase();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      data-testid="comments-overlay"
    >
      <div 
        className="w-full max-w-lg bg-background rounded-t-3xl flex flex-col animate-slide-up"
        style={{ height: '65vh', maxHeight: '65vh' }}
        onClick={(e) => e.stopPropagation()}
        data-testid="comments-sheet"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pb-3 border-b flex-shrink-0">
          <h2 className="font-bold text-lg" data-testid="text-comment-count">{commentCount} Comments</h2>
          <Button onClick={onClose} size="icon" variant="secondary" className="rounded-full" data-testid="button-close-comments">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError || !comments ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Failed to load comments
            </div>
          ) : topLevelComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircleIcon className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Be the first to comment</p>
            </div>
          ) : (
            topLevelComments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                replies={repliesMap.get(comment.id) || []}
                onReply={handleReply}
              />
            ))
          )}
        </div>

        <div className="flex-shrink-0 border-t bg-background">
          {replyTo && (
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 text-xs text-muted-foreground">
              <span>
                Replying to <span className="font-semibold text-foreground">@{replyTo.username}</span>
              </span>
              <button onClick={cancelReply} className="press-effect" data-testid="button-cancel-reply">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 pb-safe">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={userAvatarUrl} />
              <AvatarFallback>{userFallback}</AvatarFallback>
            </Avatar>
            <Input
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? (replyTo ? `Reply to @${replyTo.username}...` : "Add a comment...") : "Sign in to comment"}
              disabled={!user || postCommentMutation.isPending}
              data-testid="input-comment"
              className="flex-1 rounded-full bg-secondary border-0 text-sm"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!newComment.trim() || !user || postCommentMutation.isPending}
              data-testid="button-submit-comment"
              className="rounded-full flex-shrink-0"
            >
              {postCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
