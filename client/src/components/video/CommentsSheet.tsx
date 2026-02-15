import { useState } from "react";
import { X, Send, Heart, MoreHorizontal, Loader2 } from "lucide-react";
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

function CommentItem({ comment }: { comment: ApiComment }) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const displayName = comment.user.displayName || comment.user.username;
  const fallbackChar = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex gap-3" data-testid={`comment-item-${comment.id}`}>
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={comment.user.avatarUrl || undefined} />
        <AvatarFallback>{fallbackChar}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-sm truncate">{displayName}</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        
        <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
        
        <div className="flex items-center gap-4 mt-1.5">
          <button onClick={handleLike} className="flex items-center gap-1 press-effect" data-testid={`button-like-comment-${comment.id}`}>
            <Heart className={cn("h-4 w-4", isLiked ? "text-stream-coral fill-stream-coral" : "text-muted-foreground")} />
            <span className="text-xs text-muted-foreground">{comment.likesCount}</span>
          </button>
          <button className="text-xs text-muted-foreground font-medium press-effect" data-testid={`button-reply-comment-${comment.id}`}>Reply</button>
          <button className="press-effect" data-testid={`button-more-comment-${comment.id}`}>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommentsSheet({ isOpen, onClose, videoId, commentCount }: CommentsSheetProps) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments, isLoading, isError } = useQuery<ApiComment[]>({
    queryKey: ['/api/videos', videoId, 'comments'],
    queryFn: async () => {
      const response = await api.get(`/videos/${videoId}/comments`);
      return response.data;
    },
    enabled: isOpen,
  });

  const postCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/videos/${videoId}/comments`, { content });
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
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    postCommentMutation.mutate(newComment);
  };

  if (!isOpen) return null;

  const userDisplayName = user?.displayName || user?.username || 'User';
  const userAvatarUrl = user?.avatarUrl || undefined;
  const userFallback = userDisplayName.charAt(0).toUpperCase();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg h-[70vh] bg-background rounded-t-3xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b">
          <h2 className="font-bold text-lg">{commentCount} Comments</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center press-effect">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError || !comments ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Failed to load comments
            </div>
          ) : comments.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No comments yet
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t pb-safe">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={userAvatarUrl} />
            <AvatarFallback>{userFallback}</AvatarFallback>
          </Avatar>
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Add a comment..." : "Sign in to comment"}
            disabled={!user || postCommentMutation.isPending}
            data-testid="input-comment"
            className="flex-1 h-10 rounded-full bg-secondary border-0"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newComment.trim() || !user || postCommentMutation.isPending}
            data-testid="button-submit-comment"
            className="h-10 w-10 rounded-full bg-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
