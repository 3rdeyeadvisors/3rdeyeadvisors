import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useFoundingMemberStatus } from "@/hooks/useFoundingMemberStatus";
import { useBadges } from "@/hooks/useBadges";
import { FoundingMemberBadge } from "./FoundingMemberBadge";
import { 
  Heart, 
  MessageSquare, 
  Reply, 
  MoreHorizontal, 
  Flag,
  Edit,
  Trash,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes_count: number;
  is_helpful: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  user_liked?: boolean;
  replies?: Comment[];
}

interface CommentsProps {
  contentType: 'tutorial' | 'course' | 'module';
  contentId: string;
  title?: string;
}

export const Comments = ({ contentType, contentId, title }: CommentsProps) => {
  const { user } = useAuth();
  const { displayName, avatarUrl } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { awardBadge, hasBadge } = useBadges();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Collect all user IDs from comments for founding member check
  const allUserIds = useMemo(() => {
    const collectUserIds = (commentList: Comment[]): string[] => {
      const ids: string[] = [];
      commentList.forEach(comment => {
        ids.push(comment.user_id);
        if (comment.replies) {
          ids.push(...collectUserIds(comment.replies));
        }
      });
      return ids;
    };
    return [...new Set(collectUserIds(comments))];
  }, [comments]);

  const { foundingMembers } = useFoundingMemberStatus(allUserIds);

  useEffect(() => {
    loadComments();
  }, [contentType, contentId]);

  const loadComments = async () => {
    try {
      // Load all comments first
      const { data: allComments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Batch load profiles for all comments
      let commentsWithProfiles: any[] = [];
      if (allComments && allComments.length > 0) {
        const userIds = [...new Set(allComments.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .rpc('get_profiles_batch', { user_ids: userIds });
        
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
        
        commentsWithProfiles = allComments.map(comment => ({
          ...comment,
          profiles: profileMap.get(comment.user_id) || null
        }));
      }

      // Check which comments the current user has liked
      let commentsWithLikes = commentsWithProfiles;
      if (user) {
        const { data: userLikes, error: likesError } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentsWithLikes.map(c => c.id));

        if (!likesError) {
          const likedCommentIds = new Set(userLikes.map(l => l.comment_id));
          commentsWithLikes = commentsWithLikes.map(comment => ({
            ...comment,
            user_liked: likedCommentIds.has(comment.id)
          }));
        }
      }

      // Organize comments with replies
      const organizedComments = organizeComments(commentsWithLikes);
      setComments(organizedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeComments = (allComments: any[]): Comment[] => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    // First pass: create comment map
    allComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    allComments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          content: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
      
      // Award contributor badge for first comment
      if (!hasBadge('contributor')) {
        await awardBadge('contributor');
      }
      
      // Reload comments
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          content: replyText.trim(),
          parent_id: parentId
        }]);

      if (error) throw error;

      setReplyText("");
      setReplyingTo(null);
      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully.",
      });
      
      // Reload comments
      loadComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert([{
            user_id: user.id,
            comment_id: commentId
          }]);
        
        if (error) throw error;
      }

      // Reload comments to update like counts
      loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: "Error",
        description: "Failed to update like.",
        variant: "destructive",
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-white/5 pl-4' : ''}`}>
      <Card className="mb-4 bg-white/3 border-white/8">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.profiles?.avatar_url || ""} />
              <AvatarFallback className="bg-violet-500/10 text-violet-400 text-sm font-body">
                {(comment.profiles?.display_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <span className="font-consciousness font-bold text-sm text-white">
                    {comment.profiles?.display_name || 'Anonymous User'}
                  </span>
                  {foundingMembers.has(comment.user_id) && <FoundingMemberBadge />}
                </div>
                <span className="font-body text-xs text-white/40">
                  {formatDate(comment.created_at)}
                </span>
                {comment.is_helpful && (
                  <Badge variant="outline" className="text-xs">
                    Helpful
                  </Badge>
                )}
              </div>
              
              <p className="font-body text-sm text-white/70 mb-3 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  className="font-body text-xs text-white/40 hover:text-violet-400 transition-colors flex items-center"
                  onClick={() => handleLikeComment(comment.id, comment.user_liked || false)}
                >
                  <Heart className={`w-4 h-4 mr-1 ${comment.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                  {comment.likes_count}
                </button>
                
                {!isReply && (
                  <button
                    className="font-body text-xs text-white/40 hover:text-violet-400 transition-colors flex items-center"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                )}
                
                {comment.replies && comment.replies.length > 0 && (
                  <button
                    className="font-body text-xs text-white/40 hover:text-violet-400 transition-colors flex items-center"
                    onClick={() => toggleReplies(comment.id)}
                  >
                    {expandedComments.has(comment.id) ? (
                      <ChevronUp className="w-4 h-4 mr-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-1" />
                    )}
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Reply input */}
      {replyingTo === comment.id && (
        <div className="ml-11 mb-4">
          <Textarea
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="mb-2"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSubmitReply(comment.id)}
              disabled={submitting || !replyText.trim()}
            >
              {submitting ? "Posting..." : "Post Reply"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Replies */}
      {comment.replies && expandedComments.has(comment.id) && (
        <div className="ml-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-white/5 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-white/5 rounded"></div>
            <div className="h-20 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-consciousness text-lg font-bold text-white mb-4">
          Comments {title && `for ${title}`} ({comments.length})
        </h3>
        
        {/* New comment input */}
        {user ? (
          <Card className="mb-6 bg-white/3 border-white/8">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="bg-violet-500/10 text-violet-400 text-sm font-body">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts or ask a question..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3 font-body text-sm bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50"
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                    className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl"
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 bg-white/3 border-white/8">
            <CardContent className="p-4 text-center">
              <p className="font-body text-white/50 mb-4">Sign in to join the discussion</p>
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="font-body border-white/10 text-white hover:bg-white/5 rounded-xl"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Comments list */}
        {comments.length > 0 ? (
          <div>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/50">
                No comments yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};