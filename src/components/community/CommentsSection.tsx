import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, ThumbsUp, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
  } | null;
  likes_count: number;
}

interface CommentsSectionProps {
  courseId: number;
  moduleId?: string;
}

export const CommentsSection = ({ courseId, moduleId }: CommentsSectionProps) => {
  const { displayName, avatarUrl } = useProfile();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const canEdit = (createdAt: string) => {
    const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation < 24;
  };

  const fetchComments = useCallback(async () => {
    try {
      const contentId = moduleId || `course-${courseId}`;
      const contentType = moduleId ? 'module' : 'course';

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          likes_count
        `)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Batch load profiles for all comments
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .rpc('get_profiles_batch', { user_ids: userIds });
        
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
        
        const commentsWithProfiles = data.map(comment => ({
          ...comment,
          profiles: profileMap.get(comment.user_id) || null
        }));
        
        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error Loading Comments",
        description: "Unable to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId, toast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to post comments.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please write a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const contentId = moduleId || `course-${courseId}`;
      const contentType = moduleId ? 'module' : 'course';

      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
        });

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('send-community-notification', {
          body: {
            type: 'comment',
            user_name: user.user_metadata?.display_name || user.email || 'Anonymous',
            user_email: user.email || 'unknown@email.com',
            content_id: contentId,
            content_type: contentType,
            content: newComment.trim()
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the comment submission if email fails
      }

      toast({
        title: "Comment Posted!",
        description: "Your comment has been added successfully.",
      });
      
      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast({
        title: "Empty Comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment Updated!",
        description: "Your comment has been updated successfully.",
      });
      
      setEditingCommentId(null);
      setEditContent("");
      await fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // Check if comment has replies
    const { data: replies } = await supabase
      .from('comments')
      .select('id')
      .eq('parent_id', commentId)
      .limit(1);

    if (replies && replies.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete a comment that has replies.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment Deleted!",
        description: "Your comment has been deleted.",
      });
      
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to like comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });
      }

      await fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/5 rounded"></div>
            <div className="h-4 bg-white/5 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-consciousness font-semibold">
            Discussion ({comments.length})
          </h3>
        </div>

        {/* Add Comment */}
        {user && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="bg-violet-500/10 text-violet-400">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Textarea
                  placeholder="Share your thoughts or ask a question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="font-consciousness h-11"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 pt-2">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-consciousness text-sm">No comments yet. Be the first to start the discussion!</p>
            </div>
          ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-3 sm:p-4 bg-white/5">
              <div className="flex items-start gap-2 sm:gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={(comment as any).profiles?.avatar_url || ""} />
                  <AvatarFallback className="bg-violet-500/10 text-violet-400 text-xs">
                    {comment.profiles?.display_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-consciousness font-medium text-sm">
                        {comment.profiles?.display_name || "Anonymous"}
                      </span>
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {user && comment.user_id === user.id && (
                      <div className="flex gap-1">
                        {canEdit(comment.created_at) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditContent(comment.content);
                            }}
                            className="h-7 text-xs"
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment.id)}
                          disabled={submitting || !editContent.trim()}
                        >
                          {submitting ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditContent("");
                          }}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground mb-3 font-system leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                  
                  {user && !editingCommentId && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(comment.id)}
                        className="h-8 px-2 text-white/50 hover:text-primary"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {comment.likes_count}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
        </div>
      </div>
    </Card>
  );
};