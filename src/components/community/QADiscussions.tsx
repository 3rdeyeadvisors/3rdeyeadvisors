import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useBatchProfiles } from "@/hooks/useBatchProfiles";
import { 
  MessageCircle, 
  Plus, 
  Heart, 
  Eye,
  CheckCircle,
  HelpCircle,
  Tag,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Discussion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tags: string[];
  is_solved: boolean;
  views_count: number;
  replies_count: number;
  created_at: string;
}

interface DiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  is_solution: boolean;
  likes_count: number;
  created_at: string;
}

interface QADiscussionsProps {
  contentType: 'tutorial' | 'course' | 'general';
  contentId?: string;
  title?: string;
}

export const QADiscussions = ({ contentType, contentId, title }: QADiscussionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    description: "",
    tags: ""
  });
  const [newReply, setNewReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Extract unique user IDs for batch profile fetching
  const discussionUserIds = [...new Set(discussions.map(discussion => discussion.user_id))];
  const replyUserIds = [...new Set(replies.map(reply => reply.user_id))];
  const allUserIds = [...new Set([...discussionUserIds, ...replyUserIds])];
  const { profiles } = useBatchProfiles(allUserIds);

  useEffect(() => {
    loadDiscussions();
  }, [contentType, contentId]);

  const loadDiscussions = async () => {
    try {
      let query = supabase
        .from('discussions')
        .select('*')
        .eq('content_type', contentType);

      if (contentId) {
        query = query.eq('content_id', contentId);
      }

      const { data: allDiscussions, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      // No longer need individual profile lookups - will use batch profiles
      setDiscussions(allDiscussions || []);
    } catch (error) {
      console.error('Error loading discussions:', error);
      toast({
        title: "Error",
        description: "Failed to load discussions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (discussionId: string) => {
    try {
      const { data: allReplies, error } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setReplies(allReplies || []);

      // Increment view count
      await supabase
        .from('discussions')
        .update({ views_count: (selectedDiscussion?.views_count || 0) + 1 })
        .eq('id', discussionId);

    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a discussion.",
        variant: "destructive",
      });
      return;
    }

    if (!newDiscussion.title.trim() || !newDiscussion.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and description.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const tags = newDiscussion.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error } = await supabase
        .from('discussions')
        .insert([{
          user_id: user.id,
          content_type: contentType,
          content_id: contentId || null,
          title: newDiscussion.title.trim(),
          description: newDiscussion.description.trim(),
          tags: tags
        }]);

      if (error) throw error;

      setNewDiscussion({ title: "", description: "", tags: "" });
      setShowNewDiscussion(false);
      
      toast({
        title: "Discussion created",
        description: "Your discussion has been posted successfully.",
      });
      
      loadDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!user || !selectedDiscussion || !newReply.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert([{
          discussion_id: selectedDiscussion.id,
          user_id: user.id,
          content: newReply.trim()
        }]);

      if (error) throw error;

      setNewReply("");
      
      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully.",
      });
      
      loadReplies(selectedDiscussion.id);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/5 rounded w-1/3 mb-4"></div>
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
      {!selectedDiscussion ? (
        // Discussions List View
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              Q&A Discussions {title && `for ${title}`} ({discussions.length})
            </h3>
            <Button
              onClick={() => setShowNewDiscussion(!showNewDiscussion)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Discussion
            </Button>
          </div>

          {/* New Discussion Form */}
          {showNewDiscussion && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Start a New Discussion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="What's your question or topic?"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Provide more details about your question..."
                    value={newDiscussion.description}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (optional)</label>
                  <Input
                    placeholder="tag1, tag2, tag3"
                    value={newDiscussion.tags}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                  />
                  <p className="text-xs text-white/50 mt-1">Separate tags with commas</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateDiscussion}
                    disabled={submitting || !newDiscussion.title.trim()}
                  >
                    {submitting ? "Posting..." : "Post Discussion"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewDiscussion(false);
                      setNewDiscussion({ title: "", description: "", tags: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discussions List */}
          {discussions.length > 0 ? (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card 
                  key={discussion.id}
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => {
                    setSelectedDiscussion(discussion);
                    loadReplies(discussion.id);
                  }}
                >
                  <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profiles[discussion.user_id]?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(profiles[discussion.user_id]?.display_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground line-clamp-2">
                          {discussion.title}
                        </h4>
                        {discussion.is_solved && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Solved
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-white/50 mb-3 line-clamp-2">
                        {discussion.description}
                      </p>
                      
                      {discussion.tags.length > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <Tag className="w-3 h-3 text-white/50" />
                          {discussion.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(discussion.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {discussion.replies_count} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {discussion.views_count} views
                        </span>
                        <span>by {profiles[discussion.user_id]?.display_name || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <p className="text-white/50">
                  No discussions yet. Start the conversation by asking a question!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Discussion Detail View
        <div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedDiscussion(null)}
            className="mb-4"
          >
            ← Back to Discussions
          </Button>
          
          {/* Discussion Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profiles[selectedDiscussion.user_id]?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {(profiles[selectedDiscussion.user_id]?.display_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {selectedDiscussion.title}
                  </h2>
                  {selectedDiscussion.is_solved && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Solved
                    </Badge>
                  )}
                </div>
                
                <p className="text-foreground mb-4 whitespace-pre-wrap">
                  {selectedDiscussion.description}
                </p>
                
                {selectedDiscussion.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-white/50" />
                    {selectedDiscussion.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>by {profiles[selectedDiscussion.user_id]?.display_name || 'Anonymous'}</span>
                  <span>{formatDate(selectedDiscussion.created_at)}</span>
                  <span>{selectedDiscussion.views_count} views</span>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-4 mb-6">
            {replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profiles[reply.user_id]?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {(profiles[reply.user_id]?.display_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {profiles[reply.user_id]?.display_name || 'Anonymous User'}
                      </span>
                      <span className="text-xs text-white/50">
                        {formatDate(reply.created_at)}
                      </span>
                      {reply.is_solution && (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          Solution
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
                      {reply.content}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-white/50 hover:text-primary"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {reply.likes_count}
                      </Button>
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          {user ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share your answer or thoughts..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="mb-3"
                      rows={4}
                    />
                    <Button
                      onClick={handleReply}
                      disabled={submitting || !newReply.trim()}
                    >
                      {submitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-white/50 mb-3">Sign in to reply to this discussion</p>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};