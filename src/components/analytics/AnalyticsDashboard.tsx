import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  MessageCircle,
  Star,
  Clock,
  Award,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalComments: number;
  averageRating: number;
  popularTutorials: Array<{
    id: string;
    title: string;
    views: number;
    rating: number;
  }>;
  userEngagement: Array<{
    date: string;
    activeUsers: number;
    completions: number;
  }>;
  topContributors: Array<{
    name: string;
    contributions: number;
    badges: number;
  }>;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalComments: 0,
    averageRating: 0,
    popularTutorials: [],
    userEngagement: [],
    topContributors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Use optimized database functions for better performance
      const [usersResponse, coursesResponse, commentsResponse, averageRatingResponse] = await Promise.all([
        supabase.rpc('get_total_users_count'),
        supabase.rpc('get_total_courses_count'),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.rpc('get_average_rating')
      ]);

      const averageRating = averageRatingResponse.data || 0;

      // Get real ratings data for tutorials
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('content_id, rating')
        .eq('content_type', 'tutorial');

      // Calculate real tutorial ratings
      const tutorialRatings: Record<string, { total: number; count: number }> = {};
      ratingsData?.forEach(r => {
        if (!tutorialRatings[r.content_id]) {
          tutorialRatings[r.content_id] = { total: 0, count: 0 };
        }
        tutorialRatings[r.content_id].total += r.rating;
        tutorialRatings[r.content_id].count++;
      });

      const popularTutorials = Object.entries(tutorialRatings)
        .map(([id, data]) => ({
          id,
          title: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          views: data.count, // Using rating count as a proxy for engagement
          rating: data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 4);

      // Get real user engagement from quiz attempts and course progress for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentQuizAttempts } = await supabase
        .from('quiz_attempts')
        .select('created_at, user_id')
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: recentProgress } = await supabase
        .from('course_progress')
        .select('updated_at, user_id, completion_percentage')
        .gte('updated_at', sevenDaysAgo.toISOString());

      // Build engagement data by day
      const engagementByDay: Record<string, { activeUsers: Set<string>; completions: number }> = {};
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        engagementByDay[dateStr] = { activeUsers: new Set(), completions: 0 };
      }

      recentQuizAttempts?.forEach(attempt => {
        const dateStr = new Date(attempt.created_at).toISOString().split('T')[0];
        if (engagementByDay[dateStr]) {
          engagementByDay[dateStr].activeUsers.add(attempt.user_id);
        }
      });

      recentProgress?.forEach(progress => {
        const dateStr = new Date(progress.updated_at).toISOString().split('T')[0];
        if (engagementByDay[dateStr]) {
          engagementByDay[dateStr].activeUsers.add(progress.user_id);
          if (progress.completion_percentage === 100) {
            engagementByDay[dateStr].completions++;
          }
        }
      });

      const userEngagement = Object.entries(engagementByDay).map(([date, data]) => ({
        date,
        activeUsers: data.activeUsers.size,
        completions: data.completions
      }));

      // Get real top contributors from comments
      const { data: commentsByUser } = await supabase
        .from('comments')
        .select('user_id');

      const { data: badgesByUser } = await supabase
        .from('user_badges')
        .select('user_id');

      // Get user IDs from comments to fetch profiles
      const uniqueUserIds = [...new Set(commentsByUser?.map(c => c.user_id) || [])];
      const { data: profiles } = uniqueUserIds.length > 0 
        ? await supabase.rpc('get_profiles_batch', { user_ids: uniqueUserIds })
        : { data: [] };

      // Count contributions per user
      const contributionCounts: Record<string, number> = {};
      commentsByUser?.forEach(c => {
        contributionCounts[c.user_id] = (contributionCounts[c.user_id] || 0) + 1;
      });

      const badgeCounts: Record<string, number> = {};
      badgesByUser?.forEach(b => {
        badgeCounts[b.user_id] = (badgeCounts[b.user_id] || 0) + 1;
      });

      const profileMap: Record<string, string> = {};
      profiles?.forEach(p => {
        profileMap[p.user_id] = p.display_name || 'Anonymous User';
      });

      const topContributors = Object.entries(contributionCounts)
        .map(([userId, contributions]) => ({
          name: profileMap[userId] || 'Anonymous User',
          contributions,
          badges: badgeCounts[userId] || 0
        }))
        .sort((a, b) => b.contributions - a.contributions)
        .slice(0, 4);

      setAnalytics({
        totalUsers: usersResponse.data || 0,
        totalCourses: coursesResponse.data || 0,
        totalComments: commentsResponse.count || 0,
        averageRating: Number(averageRating.toFixed(1)),
        popularTutorials: popularTutorials.length > 0 ? popularTutorials : [],
        userEngagement,
        topContributors: topContributors.length > 0 ? topContributors : []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/5 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-consciousness font-bold text-foreground mb-2">
            Platform Analytics
          </h1>
          <p className="text-white/50">
            Insights into learning engagement and community growth
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{analytics.totalUsers}</p>
                <p className="text-xs md:text-sm text-white/50">Total Users</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-awareness" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{analytics.totalCourses}</p>
                <p className="text-xs md:text-sm text-white/50">Tutorials</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{analytics.totalComments}</p>
                <p className="text-xs md:text-sm text-white/50">Comments</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
                <p className="text-xs md:text-sm text-white/50">Avg Rating</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="popular" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="popular">Popular Content</TabsTrigger>
            <TabsTrigger value="engagement">User Engagement</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Most Popular Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.popularTutorials.map((tutorial, index) => (
                    <div key={tutorial.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{tutorial.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span>{tutorial.views} views</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{tutorial.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.userEngagement.map((day) => (
                    <div key={day.date} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{new Date(day.date).toLocaleDateString()}</span>
                        <span>{day.activeUsers} active users</span>
                      </div>
                      <Progress value={(day.activeUsers / 70) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topContributors.map((contributor, index) => (
                    <div key={contributor.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{contributor.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span>{contributor.contributions} contributions</span>
                            <span>{contributor.badges} badges</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};