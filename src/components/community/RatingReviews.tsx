import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, StarOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Rating {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface RatingStatsProps {
  contentType: 'tutorial' | 'course';
  contentId: string;
  title?: string;
}

export const RatingReviews = ({ contentType, contentId, title }: RatingStatsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [contentType, contentId, user]);

  const loadRatings = async () => {
    try {
      // Load all ratings first
      const { data: allRatings, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Batch load profiles for all ratings
      let ratingsWithProfiles: Rating[] = [];
      if (allRatings && allRatings.length > 0) {
        const userIds = [...new Set(allRatings.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .rpc('get_profiles_batch', { user_ids: userIds });
        
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
        
        ratingsWithProfiles = allRatings.map(rating => ({
          ...rating,
          profiles: profileMap.get(rating.user_id) || null
        }));
      }

      setRatings(ratingsWithProfiles);

      // Load user's rating if logged in
      if (user) {
        const userRatingData = ratingsWithProfiles.find(r => r.user_id === user.id);
        if (userRatingData) {
          setUserRating(userRatingData);
          setNewRating(userRatingData.rating);
          setNewReview(userRatingData.review_text || "");
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast({
        title: "Error",
        description: "Failed to load ratings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to rate this content.",
        variant: "destructive",
      });
      return;
    }

    if (newRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const ratingData = {
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        rating: newRating,
        review_text: newReview.trim() || null
      };

      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update(ratingData)
          .eq('id', userRating.id);

        if (error) throw error;

        toast({
          title: "Rating updated",
          description: "Your rating has been updated successfully.",
        });
      } else {
        // Create new rating
        const { error } = await supabase
          .from('ratings')
          .insert([ratingData]);

        if (error) throw error;

        toast({
          title: "Rating submitted",
          description: "Thank you for your rating!",
        });
      }

      setIsEditing(false);
      loadRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateStats = () => {
    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: [0, 0, 0, 0, 0]
      };
    }

    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const average = total / ratings.length;
    
    const distribution = [0, 0, 0, 0, 0];
    ratings.forEach(rating => {
      distribution[rating.rating - 1]++;
    });

    return {
      averageRating: Math.round(average * 10) / 10,
      totalReviews: ratings.length,
      distribution
    };
  };

  const stats = calculateStats();

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    interactive = false 
  }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void; 
    interactive?: boolean;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            style={{ textDecoration: 'none' }}
          >
            <Star 
              className={`w-5 h-5 transition-colors ${
                star <= rating 
                  ? 'fill-yellow-500 text-yellow-500' 
                  : 'fill-none text-white/50'
              }`}
              style={{ textDecoration: 'none' }}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/5 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Ratings & Reviews {title && `for ${title}`}
        </h3>

        {/* Rating Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(stats.averageRating)} />
                <p className="text-sm text-white/50 mt-2">
                  Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-6">{stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-white/5 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{
                          width: `${stats.totalReviews > 0 ? (stats.distribution[stars - 1] / stats.totalReviews) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-white/50 w-8">
                      {stats.distribution[stars - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rating Form */}
        {user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">
                {userRating ? 'Your Rating' : 'Rate This Content'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing && userRating ? (
                <div className="space-y-3">
                  <StarRating rating={userRating.rating} />
                  {userRating.review_text && (
                    <p className="text-sm text-white/50">
                      "{userRating.review_text}"
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Rating
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <StarRating 
                      rating={newRating} 
                      onRatingChange={setNewRating}
                      interactive={true}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Review (optional)
                    </label>
                    <Textarea
                      placeholder="Share your experience with this content..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitRating}
                      disabled={submitting || newRating === 0}
                    >
                      {submitting ? "Submitting..." : userRating ? "Update Rating" : "Submit Rating"}
                    </Button>
                    {(isEditing || userRating) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          if (userRating) {
                            setNewRating(userRating.rating);
                            setNewReview(userRating.review_text || "");
                          } else {
                            setNewRating(0);
                            setNewReview("");
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        {ratings.filter(r => r.review_text).length > 0 && (
          <div>
            <h4 className="font-medium mb-4">Recent Reviews</h4>
            <div className="space-y-4">
              {ratings
                .filter(rating => rating.review_text)
                .slice(0, 10)
                .map((rating) => (
                  <Card key={rating.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {rating.profiles?.display_name || 'Anonymous User'}
                            </span>
                            <StarRating rating={rating.rating} />
                          </div>
                          <span className="text-xs text-white/50">
                            {formatDate(rating.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">
                        {rating.review_text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {!user && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-white/50 mb-3">
                Sign in to rate and review this content
              </p>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};