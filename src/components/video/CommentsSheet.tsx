import React, { useState } from "react";
import { X, Send, Heart, MoreHorizontal, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  text: string;
  likes: number;
  timestamp: string;
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: number;
  commentCount: string;
}

const mockComments: Comment[] = [
  {
    id: '1',
    user: { name: 'Emma', username: '@emma_style', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', isVerified: true },
    text: 'This is absolutely amazing! 🔥🔥',
    likes: 234,
    timestamp: '2h ago',
    isLiked: false,
    replies: [
      {
        id: '1-1',
        user: { name: 'Jake', username: '@jake_m', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', isVerified: false },
        text: 'Totally agree! 💯',
        likes: 12,
        timestamp: '1h ago',
        isLiked: false,
      }
    ]
  },
  {
    id: '2',
    user: { name: 'Mike', username: '@mike_dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', isVerified: false },
    text: 'How did you do that transition? Please make a tutorial!',
    likes: 89,
    timestamp: '3h ago',
    isLiked: true,
  },
  {
    id: '3',
    user: { name: 'Sophia', username: '@sophia_creates', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', isVerified: true },
    text: 'The lighting is perfect ✨',
    likes: 156,
    timestamp: '5h ago',
    isLiked: false,
  },
  {
    id: '4',
    user: { name: 'Alex', username: '@alex_photo', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', isVerified: false },
    text: 'Saved this for later! Great content as always 🙌',
    likes: 45,
    timestamp: '6h ago',
    isLiked: false,
  },
];

function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className={cn("flex gap-3", isReply && "ml-10")}>
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={comment.user.avatar} />
        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-sm truncate">{comment.user.name}</span>
          {comment.user.isVerified && (
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary flex-shrink-0">
              <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
        </div>
        
        <p className="text-sm text-foreground/90 leading-relaxed">{comment.text}</p>
        
        <div className="flex items-center gap-4 mt-1.5">
          <button onClick={handleLike} className="flex items-center gap-1 press-effect">
            <Heart className={cn("h-4 w-4", isLiked ? "text-stream-coral fill-stream-coral" : "text-muted-foreground")} />
            <span className="text-xs text-muted-foreground">{likes}</span>
          </button>
          <button className="text-xs text-muted-foreground font-medium press-effect">Reply</button>
          <button className="press-effect">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {!showReplies ? (
              <button 
                onClick={() => setShowReplies(true)}
                className="flex items-center gap-1 text-xs text-primary font-medium press-effect"
              >
                <div className="w-6 h-px bg-muted-foreground/30" />
                View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            ) : (
              <div className="space-y-3 mt-3">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
                <button 
                  onClick={() => setShowReplies(false)}
                  className="flex items-center gap-1 text-xs text-muted-foreground font-medium press-effect"
                >
                  <ChevronUp className="h-3 w-3" />
                  Hide replies
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentsSheet({ isOpen, onClose, videoId, commentCount }: CommentsSheetProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        username: '@you',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        isVerified: false,
      },
      text: newComment,
      likes: 0,
      timestamp: 'Just now',
      isLiked: false,
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  if (!isOpen) return null;

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
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t pb-safe">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Add a comment..." : "Sign in to comment"}
            disabled={!user}
            className="flex-1 h-10 rounded-full bg-secondary border-0"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newComment.trim() || !user}
            className="h-10 w-10 rounded-full bg-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
