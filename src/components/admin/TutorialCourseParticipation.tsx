import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, GraduationCap, TrendingUp, RefreshCw } from 'lucide-react';
import { ParticipantTracker } from './ParticipantTracker';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';

interface ContentParticipation {
  contentId: string;
  contentType: string;
  title: string;
  activeParticipants: number;
  totalViews: number;
  avgProgress: number;
}

export const TutorialCourseParticipation = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tutorials, setTutorials] = useState<ContentParticipation[]>([]);
  const [courses, setCourses] = useState<ContentParticipation[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Tutorial definitions
  const tutorialDefinitions = [
    { id: 'wallet-setup', title: 'Wallet Setup & Security', category: 'immediate' },
    { id: 'first-dex-swap', title: 'Your First DEX Swap', category: 'immediate' },
    { id: 'defi-calculators', title: 'Using DeFi Calculators', category: 'immediate' },
    { id: 'spotting-scams', title: 'Spotting Scam Websites', category: 'immediate' },
    { id: 'yield-farming', title: 'Yield Farming Step-by-Step', category: 'practical' },
    { id: 'liquidity-pools', title: 'Liquidity Pool Basics', category: 'practical' },
    { id: 'portfolio-tracking', title: 'Portfolio Tracking Setup', category: 'practical' },
    { id: 'risk-assessment', title: 'Risk Assessment Walkthrough', category: 'practical' },
    { id: 'chart-reading', title: 'Chart Reading & Technical Analysis', category: 'advanced' },
    { id: 'nft-defi', title: 'NFT & DeFi Integration', category: 'advanced' },
    { id: 'dao-participation', title: 'DAO Participation & Governance', category: 'advanced' }
  ];

  // All 6 courses - updated to match courseContent.ts
  const courseDefinitions = [
    { id: '1', title: 'DeFi Foundations' },
    { id: '2', title: 'Staying Safe in DeFi' },
    { id: '3', title: 'Earning with DeFi' },
    { id: '4', title: 'Managing Your Own DeFi Portfolio' },
    { id: '5', title: 'Understanding DeFi Vaults' },
    { id: '6', title: 'Tokenizing Real World Assets' }
  ];

  useEffect(() => {
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchParticipationData();
      // Auto-refresh every 15 seconds
      const interval = setInterval(() => {
        fetchParticipationData(true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const checkAdmin = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    setIsAdmin(!!data);
    setLoading(false);
  };

  const fetchParticipationData = async (silent: boolean = false) => {
    if (!silent) setRefreshing(true);
    try {
      // Fetch presence data for all content
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('content_id, content_type, user_id, progress_percentage')
        .gte('last_seen', thirtyMinutesAgo);

      if (!presenceData) return;

      // Process tutorials
      const tutorialData: ContentParticipation[] = tutorialDefinitions.map(tutorial => {
        const participants = presenceData.filter(
          p => p.content_type === 'tutorial' && p.content_id === tutorial.id
        );
        
        const avgProgress = participants.length > 0
          ? participants.reduce((sum, p) => sum + (Number(p.progress_percentage) || 0), 0) / participants.length
          : 0;

        return {
          contentId: tutorial.id,
          contentType: 'tutorial',
          title: tutorial.title,
          activeParticipants: new Set(participants.map(p => p.user_id)).size,
          totalViews: participants.length,
          avgProgress
        };
      });

      // Process courses
      const courseData: ContentParticipation[] = courseDefinitions.map(course => {
        const participants = presenceData.filter(
          p => p.content_type === 'course' && p.content_id === course.id
        );
        
        const avgProgress = participants.length > 0
          ? participants.reduce((sum, p) => sum + (Number(p.progress_percentage) || 0), 0) / participants.length
          : 0;

        return {
          contentId: course.id,
          contentType: 'course',
          title: course.title,
          activeParticipants: new Set(participants.map(p => p.user_id)).size,
          totalViews: participants.length,
          avgProgress
        };
      });

      setTutorials(tutorialData);
      setCourses(courseData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching participation data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchParticipationData(false);
  };

  if (!isAdmin || loading) return null;

  const totalTutorialParticipants = tutorials.reduce((sum, t) => sum + t.activeParticipants, 0);
  const totalCourseParticipants = courses.reduce((sum, c) => sum + c.activeParticipants, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tutorial & Course Participation</h2>
          <p className="text-white/50">
            Real-time tracking of active users in tutorials and courses
            {lastRefresh && (
              <span className="ml-2 text-xs">
                (Updated: {lastRefresh.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Active Tutorial Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalTutorialParticipants}</p>
            <p className="text-xs text-white/50 mt-1">Last 30 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-awareness" />
              Active Course Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-awareness">{totalCourseParticipants}</p>
            <p className="text-xs text-white/50 mt-1">Last 30 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Total Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{totalTutorialParticipants + totalCourseParticipants}</p>
            <p className="text-xs text-white/50 mt-1">All content types</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Lists */}
      <Tabs defaultValue="tutorials" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials" className="space-y-3 mt-4">
          {tutorials.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-white/50">
                No active tutorial participants in the last 30 minutes
              </CardContent>
            </Card>
          ) : (
            tutorials
              .sort((a, b) => b.activeParticipants - a.activeParticipants)
              .map((tutorial) => (
                <Card key={tutorial.contentId} className="hover:bg-accent/5 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {tutorial.title}
                          {tutorial.activeParticipants === 0 && (
                            <Badge variant="outline" className="text-xs">
                              No activity
                            </Badge>
                          )}
                          {tutorial.activeParticipants > 0 && tutorial.activeParticipants < 3 && (
                            <Badge variant="secondary" className="bg-awareness/20 text-awareness">
                              {tutorial.activeParticipants} active
                            </Badge>
                          )}
                          {tutorial.activeParticipants >= 3 && (
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {tutorial.activeParticipants} active
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {Math.round(tutorial.avgProgress)}% avg progress
                          </span>
                        </CardDescription>
                      </div>
                      <ParticipantTracker 
                        contentType="tutorial" 
                        contentId={tutorial.contentId} 
                      />
                    </div>
                  </CardHeader>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-3 mt-4">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-white/50">
                No active course participants in the last 30 minutes
              </CardContent>
            </Card>
          ) : (
            courses
              .sort((a, b) => b.activeParticipants - a.activeParticipants)
              .map((course) => (
                <Card key={course.contentId} className="hover:bg-accent/5 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {course.title}
                          {course.activeParticipants === 0 && (
                            <Badge variant="outline" className="text-xs">
                              No activity
                            </Badge>
                          )}
                          {course.activeParticipants > 0 && course.activeParticipants < 3 && (
                            <Badge variant="secondary" className="bg-awareness/20 text-awareness">
                              {course.activeParticipants} active
                            </Badge>
                          )}
                          {course.activeParticipants >= 3 && (
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {course.activeParticipants} active
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {Math.round(course.avgProgress)}% avg progress
                          </span>
                        </CardDescription>
                      </div>
                      <ParticipantTracker 
                        contentType="course" 
                        contentId={course.contentId} 
                      />
                    </div>
                  </CardHeader>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};