import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, MessageSquare, CheckCircle, ThumbsUp, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useFoundingMemberStatus } from "@/hooks/useFoundingMemberStatus";
import { FoundingMemberBadge } from "./FoundingMemberBadge";

interface QAItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  is_solved: boolean;
  profiles: {
    display_name: string;
  } | null;
  discussion_replies: Array<{
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    is_solution: boolean;
    profiles: {
      display_name: string;
    } | null;
  }>;
}

interface QASectionProps {
  courseId: number;
  moduleId?: string;
}

export const QASection = ({ courseId, moduleId }: QASectionProps) => {
  const { displayName, avatarUrl } = useProfile();
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionTitle, setEditQuestionTitle] = useState("");
  const [editQuestionContent, setEditQuestionContent] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Collect all user IDs from questions and replies for founding member check
  const allUserIds = useMemo(() => {
    const ids: string[] = [];
    questions.forEach(q => {
      ids.push(q.user_id);
      q.discussion_replies?.forEach(r => ids.push(r.user_id));
    });
    return [...new Set(ids)];
  }, [questions]);

  const { foundingMembers } = useFoundingMemberStatus(allUserIds);

  const canEdit = (createdAt: string) => {
    const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation < 24;
  };

  const fetchQuestions = useCallback(async () => {
    try {
      const contentId = moduleId || `course-${courseId}`;
      const contentType = moduleId ? 'module' : 'course';

      const { data, error } = await supabase
        .from('discussions')
        .select('id, title, description, created_at, user_id, is_solved')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Batch load profiles for questions and replies
      if (data && data.length > 0) {
        // Collect all user IDs from questions
        const questionUserIds = data.map(q => q.user_id);
        
        // Fetch all replies for all questions
        const questionIds = data.map(q => q.id);
        const { data: allReplies } = await supabase
          .from('discussion_replies')
          .select('id, content, created_at, user_id, is_solution, discussion_id')
          .in('discussion_id', questionIds)
          .order('created_at');
        
        // Collect all user IDs (questions + replies)
        const replyUserIds = allReplies?.map(r => r.user_id) || [];
        const allUserIds = [...new Set([...questionUserIds, ...replyUserIds])];
        
        // Batch fetch all profiles
        const { data: profiles } = await supabase
          .rpc('get_profiles_batch', { user_ids: allUserIds });
        
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
        
        // Map replies to questions with profiles
        const repliesByQuestion = new Map<string, any[]>();
        allReplies?.forEach(reply => {
          const existing = repliesByQuestion.get(reply.discussion_id) || [];
          existing.push({
            ...reply,
            profiles: profileMap.get(reply.user_id) || null
          });
          repliesByQuestion.set(reply.discussion_id, existing);
        });
        
        // Build final questions with details
        const questionsWithDetails = data.map(question => ({
          ...question,
          profiles: profileMap.get(question.user_id) || null,
          discussion_replies: repliesByQuestion.get(question.id) || []
        }));
        
        setQuestions(questionsWithDetails);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmitQuestion = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to ask questions.",
        variant: "destructive",
      });
      return;
    }

    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) {
      toast({
        title: "Complete Form",
        description: "Please provide both a title and description.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const contentId = moduleId || `course-${courseId}`;
      const contentType = moduleId ? 'module' : 'course';

      const { error } = await supabase
        .from('discussions')
        .insert({
          title: newQuestionTitle.trim(),
          description: newQuestionContent.trim(),
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
        });

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('send-community-notification', {
          body: {
            type: 'question',
            user_name: user.user_metadata?.display_name || user.email || 'Anonymous',
            user_email: user.email || 'unknown@email.com',
            content_id: contentId,
            content_type: contentType,
            title: newQuestionTitle.trim(),
            content: newQuestionContent.trim()
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the question submission if email fails
      }

      toast({
        title: "Question Posted!",
        description: "Your question has been added successfully.",
      });

      setNewQuestionTitle("");
      setNewQuestionContent("");
      setShowNewQuestion(false);
      await fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (questionId: string, isAnswer = false) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to reply.",
        variant: "destructive",
      });
      return;
    }

    const content = replyContent[questionId]?.trim();
    if (!content) return;

    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: questionId,
          content: content,
          user_id: user.id,
          is_solution: isAnswer,
        });

      if (error) throw error;

      // Send email notification
      try {
        const question = questions.find(q => q.id === questionId);
        await supabase.functions.invoke('send-community-notification', {
          body: {
            type: 'answer',
            user_name: user.user_metadata?.display_name || user.email || 'Anonymous',
            user_email: user.email || 'unknown@email.com',
            content_id: moduleId || `course-${courseId}`,
            content_type: moduleId ? 'module' : 'course',
            title: question?.title || 'Question',
            content: content
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the reply submission if email fails
      }

      toast({
        title: "Reply Posted!",
        description: isAnswer ? "Answer submitted successfully." : "Reply added successfully.",
      });

      setReplyContent(prev => ({ ...prev, [questionId]: "" }));
      await fetchQuestions();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = async (questionId: string) => {
    if (!editQuestionTitle.trim() || !editQuestionContent.trim()) {
      toast({
        title: "Complete Form",
        description: "Both title and description are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('discussions')
        .update({
          title: editQuestionTitle.trim(),
          description: editQuestionContent.trim(),
        })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Question Updated!",
        description: "Your question has been updated successfully.",
      });

      setEditingQuestionId(null);
      setEditQuestionTitle("");
      setEditQuestionContent("");
      await fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!editReplyContent.trim()) {
      toast({
        title: "Empty Reply",
        description: "Reply cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .update({ content: editReplyContent.trim() })
        .eq('id', replyId);

      if (error) throw error;

      toast({
        title: "Reply Updated!",
        description: "Your reply has been updated successfully.",
      });

      setEditingReplyId(null);
      setEditReplyContent("");
      await fetchQuestions();
    } catch (error) {
      console.error('Error updating reply:', error);
      toast({
        title: "Error",
        description: "Failed to update reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    
    if (question && question.discussion_replies && question.discussion_replies.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete a question that has replies.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Question Deleted!",
        description: "Your question has been deleted.",
      });
      
      await fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;

      toast({
        title: "Reply Deleted!",
        description: "Your reply has been deleted.",
      });
      
      await fetchQuestions();
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast({
        title: "Error",
        description: "Failed to delete reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
    <Card className="bg-white/3 border-white/8">
      <div className="space-y-3 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-consciousness font-bold text-white">
              Questions & Answers ({questions.length})
            </h3>
          </div>
          {user && (
            <Button
              onClick={() => setShowNewQuestion(!showNewQuestion)}
              variant="outline"
              size="sm"
              className="font-body text-xs uppercase tracking-widest border-white/10 text-white hover:bg-white/5 rounded-xl h-9"
            >
              Ask Question
            </Button>
          )}
        </div>

        {/* New Question Form */}
        {showNewQuestion && user && (
          <Card className="p-3 sm:p-4 bg-violet-500/5 border-violet-500/20">
            <div className="flex gap-3 mb-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="bg-violet-500/10 text-violet-400">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-3">
                <Input
                  placeholder="Question title..."
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  className="font-body text-sm bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white"
                />
                <Textarea
                  placeholder="Describe your question in detail..."
                  value={newQuestionContent}
                  onChange={(e) => setNewQuestionContent(e.target.value)}
                  className="font-body text-sm bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white min-h-[100px]"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewQuestion(false)}
                  className="font-body border-white/10 text-white rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitQuestion}
                  disabled={!newQuestionTitle.trim() || !newQuestionContent.trim() || submitting}
                  className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl"
                >
                  {submitting ? "Posting..." : "Post Question"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-6 pt-2">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-consciousness text-sm">No questions yet. Be the first to ask!</p>
            </div>
          ) : (
          questions.map((question) => (
            <Card key={question.id} className="p-4 bg-white/3 border-white/8">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={(question as any).profiles?.avatar_url || ""} />
                  <AvatarFallback className="bg-violet-500/10 text-violet-400 text-xs">
                    {question.profiles?.display_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="font-consciousness font-bold text-sm text-white">
                          {question.profiles?.display_name || "Anonymous"}
                        </span>
                        {foundingMembers.has(question.user_id) && <FoundingMemberBadge />}
                      </div>
                      <span className="font-body text-xs text-white/40">
                        {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                      </span>
                      {question.is_solved && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Solved
                        </Badge>
                      )}
                    </div>
                    {user && question.user_id === user.id && (
                      <div className="flex gap-1">
                        {canEdit(question.created_at) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingQuestionId(question.id);
                              setEditQuestionTitle(question.title);
                              setEditQuestionContent(question.description);
                            }}
                            className="h-7 text-xs"
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {editingQuestionId === question.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editQuestionTitle}
                        onChange={(e) => setEditQuestionTitle(e.target.value)}
                        placeholder="Question title"
                      />
                      <Textarea
                        value={editQuestionContent}
                        onChange={(e) => setEditQuestionContent(e.target.value)}
                        placeholder="Question description"
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditQuestion(question.id)}
                          disabled={submitting || !editQuestionTitle.trim() || !editQuestionContent.trim()}
                        >
                          {submitting ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingQuestionId(null);
                            setEditQuestionTitle("");
                            setEditQuestionContent("");
                          }}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-consciousness font-bold text-white mb-2">
                        {question.title}
                      </h4>
                      <p className="font-body text-sm text-white/50 mb-3 leading-relaxed">
                        {question.description}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Replies */}
              {question.discussion_replies && question.discussion_replies.length > 0 && (
                <div className="ml-11 space-y-3 mb-4">
                  {question.discussion_replies
                    .sort((a, b) => {
                      // Show solutions first
                      if (a.is_solution && !b.is_solution) return -1;
                      if (!a.is_solution && b.is_solution) return 1;
                      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    })
                    .map((reply) => (
                    <Card 
                      key={reply.id} 
                      className={`p-3 ${reply.is_solution ? 'bg-success/10 border-success/30' : 'bg-white/3'}`}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={(reply as any).profiles?.avatar_url || ""} />
                          <AvatarFallback className="bg-violet-500/10 text-violet-400 text-xs">
                            {reply.profiles?.display_name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="font-consciousness font-medium text-xs">
                                  {reply.profiles?.display_name || "Anonymous"}
                                </span>
                                {foundingMembers.has(reply.user_id) && <FoundingMemberBadge className="w-3 h-3" />}
                              </div>
                              <span className="text-xs text-white/50">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                              {reply.is_solution && (
                                <Badge variant="outline" className="text-xs bg-success/20">
                                  Solution
                                </Badge>
                              )}
                            </div>
                            {user && reply.user_id === user.id && (
                              <div className="flex gap-1">
                                {canEdit(reply.created_at) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingReplyId(reply.id);
                                      setEditReplyContent(reply.content);
                                    }}
                                    className="h-6 text-xs"
                                  >
                                    Edit
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteReply(reply.id)}
                                  className="h-6 text-xs text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {editingReplyId === reply.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editReplyContent}
                                onChange={(e) => setEditReplyContent(e.target.value)}
                                className="min-h-[60px] text-xs"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditReply(reply.id)}
                                  disabled={submitting || !editReplyContent.trim()}
                                >
                                  {submitting ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingReplyId(null);
                                    setEditReplyContent("");
                                  }}
                                  disabled={submitting}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-foreground leading-relaxed">
                              {reply.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {user && (
                <div className="ml-11 space-y-2">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="bg-violet-500/10 text-violet-400 text-xs">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent[question.id] || ""}
                      onChange={(e) => setReplyContent(prev => ({
                        ...prev,
                        [question.id]: e.target.value
                      }))}
                      className="min-h-[60px] text-sm flex-1"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSubmitReply(question.id, false)}
                      disabled={!replyContent[question.id]?.trim()}
                    >
                      Reply
                    </Button>
                    {!question.is_solved && (
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(question.id, true)}
                        disabled={!replyContent[question.id]?.trim()}
                        className="bg-success hover:bg-success/90"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Answer
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
        </div>
      </div>
    </Card>
  );
};