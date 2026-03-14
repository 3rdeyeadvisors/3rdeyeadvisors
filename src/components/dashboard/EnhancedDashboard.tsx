import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { useProgress } from "@/components/progress/ProgressProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useAchievementSounds } from "@/hooks/useAchievementSounds";
import { useBadges } from "@/hooks/useBadges";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  Calendar,
  Award,
  Star,
  CheckCircle2,
  Play,
  BarChart3,
  Brain,
  Zap,
  Crown,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Volume2,
  VolumeX
} from "lucide-react";
import { ReferralCard } from "./ReferralCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { courseContent } from "@/data/courseContent";
import { PointsDisplay } from "@/components/points";
import { BadgeCollection } from "@/components/badges";

interface QuizStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  passedQuizzes: number;
}

interface AnalyticsStats {
  totalStudyTime: string;
  averageSession: string;
  bestDay: string;
  highestScore: number;
  improvementTrend: number;
  modulesCompleted: number;
}

interface DetailedQuiz {
  id: string;
  score: number;
  passed: boolean;
  created_at: string;
  time_taken: number | null;
  quizzes: {
    title: string;
    course_id: number;
    module_id: string;
  } | null;
}

export const EnhancedDashboard = () => {
  const { user } = useAuth();
  const { displayName, avatarUrl } = useProfile();
  const { courseProgress } = useProgress();
  const { subscription, loading: subLoading, hasAccess, isTrialing, checkSubscription } = useSubscription();
  const { soundEnabled, toggleSound } = useAchievementSounds();
  const { getAllBadgesWithStatus } = useBadges();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    passedQuizzes: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats>({
    totalStudyTime: '0h 0m',
    averageSession: '0 minutes',
    bestDay: 'No data',
    highestScore: 0,
    improvementTrend: 0,
    modulesCompleted: 0
  });
  
  // State for detail sheets
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const [detailedQuizzes, setDetailedQuizzes] = useState<DetailedQuiz[]>([]);

  // Handle subscription success/cancel from URL params
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      toast.success('Subscription activated! Welcome aboard.');
      checkSubscription();
      // Clear the URL param
      window.history.replaceState({}, '', '/dashboard');
    } else if (subscriptionStatus === 'cancelled') {
      toast.info('Subscription checkout was cancelled.');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, checkSubscription]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Load quiz statistics
  useEffect(() => {
    if (user) {
      loadQuizStats();
      loadRecentActivity();
      loadWeeklyProgress();
      loadAnalyticsStats();
    }
  }, [user, loadQuizStats, loadRecentActivity, loadWeeklyProgress, loadAnalyticsStats]);

  const loadQuizStats = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch detailed quiz data from quiz_attempts
      const { data: attempts, error } = await supabase
        .from('quiz_attempts')
        .select('id, score, passed, quiz_id, created_at, time_taken, quizzes(title, course_id, module_id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Also fetch quiz data from user_presence (for built-in quizzes with non-UUID IDs)
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('id, content_id, metadata, created_at, last_seen')
        .eq('user_id', user.id)
        .eq('content_type', 'quiz_attempt');

      if (presenceError) throw presenceError;

      // Combine and format
      const dbQuizzes: DetailedQuiz[] = (attempts as DetailedQuiz[] || []);
      const builtInQuizzes: DetailedQuiz[] = (presenceData || []).map(p => {
        const metadata = p.metadata as Record<string, any> | null;
        return {
          id: p.id,
          score: metadata?.score || 0,
          passed: metadata?.passed || false,
          created_at: p.created_at || p.last_seen || new Date().toISOString(),
          time_taken: metadata?.timeTaken || null,
          quizzes: {
            title: metadata?.quizTitle || 'Quiz',
            course_id: metadata?.courseId || 0,
            module_id: p.content_id
          }
        };
      });

      // Combine both sources, prioritizing quiz_attempts if both exist for same quiz
      // Actually, since quiz_attempts only stores UUIDs, they won't overlap with string IDs from courseContent
      const allDetailedQuizzes = [...dbQuizzes, ...builtInQuizzes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Store detailed quiz data
      setDetailedQuizzes(allDetailedQuizzes);

      // Calculate unique quizzes completed
      const uniqueQuizIds = new Set([
        ...(attempts?.map(a => a.quiz_id) || []),
        ...(presenceData?.map(p => p.content_id) || [])
      ]);

      const completedQuizzesCount = uniqueQuizIds.size;
      const passedQuizzesCount = allDetailedQuizzes.filter(q => q.passed).length;

      const averageScore = allDetailedQuizzes.length
        ? Math.round(allDetailedQuizzes.reduce((sum, q) => sum + q.score, 0) / allDetailedQuizzes.length)
        : 0;

      setQuizStats({
        totalQuizzes: completedQuizzesCount,
        completedQuizzes: completedQuizzesCount,
        averageScore,
        passedQuizzes: passedQuizzesCount
      });
    } catch (error) {
      console.error('Error loading quiz stats:', error);
    }
  }, [user]);

  const loadRecentActivity = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch quiz attempts from DB
      const { data: attempts, error: quizError } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, course_id, module_id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (quizError) throw quizError;

      // Fetch quiz attempts from presence (built-in quizzes)
      const { data: presenceQuizzes } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_type', 'quiz_attempt')
        .order('last_seen', { ascending: false })
        .limit(10);

      // Fetch significant point earnings (module/course completions)
      const { data: points, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .in('action_type', ['module_completion', 'course_completion', 'tutorial_completed', 'quiz_passed'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (pointsError) throw pointsError;

      // Combine and format activity
      const combinedActivity = [
        ...(attempts?.map(a => ({
          id: a.id,
          type: 'quiz',
          title: a.quizzes?.title || 'Quiz',
          score: a.score,
          passed: a.passed,
          created_at: a.created_at
        })) || []),
        ...(presenceQuizzes?.map(p => {
          const metadata = p.metadata as Record<string, any> | null;
          return {
            id: p.id,
            type: 'quiz',
            title: metadata?.quizTitle || 'Quiz',
            score: metadata?.score || 0,
            passed: metadata?.passed || false,
            created_at: p.created_at || p.last_seen
          };
        }) || []),
        ...(points?.filter(p => p.action_type !== 'quiz_passed').map(p => ({
          id: p.id,
          type: 'points',
          action_type: p.action_type,
          points: p.points,
          created_at: p.created_at,
          metadata: p.metadata
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

      setRecentActivity(combinedActivity);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }, [user]);

  const loadWeeklyProgress = useCallback(async () => {
    if (!user) return;

    try {
      // Get the start of the current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      // Fetch quiz attempts from this week with time_taken
      const { data: quizAttempts, error: quizError } = await supabase
        .from('quiz_attempts')
        .select('created_at, time_taken')
        .eq('user_id', user.id)
        .gte('created_at', monday.toISOString());

      if (quizError) throw quizError;

      // Fetch point transactions for module completions this week
      const { data: modulePoints, error: moduleError } = await supabase
        .from('user_points')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('action_type', 'module_completion')
        .gte('created_at', monday.toISOString());

      if (moduleError) throw moduleError;

      // Build weekly data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekData = days.map((day, index) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + index);
        const dayStart = new Date(dayDate).getTime();
        const dayEnd = new Date(dayDate);
        dayEnd.setHours(23, 59, 59, 999);
        const dayEndTime = dayEnd.getTime();

        // Calculate quiz time on this day (in minutes)
        const dayQuizzes = quizAttempts?.filter(attempt => {
          const d = new Date(attempt.created_at).getTime();
          return d >= dayStart && d <= dayEndTime;
        });

        const quizMinutes = Math.round((dayQuizzes?.reduce((sum, q) => sum + (q.time_taken || 0), 0) || 0) / 60);

        // Count module completions on this day (from user_points)
        const modulesCount = modulePoints?.filter(point => {
          const d = new Date(point.created_at).getTime();
          return d >= dayStart && d <= dayEndTime;
        }).length || 0;

        // Estimate 10 minutes per completed module
        const moduleMinutes = modulesCount * 10;

        const totalMinutes = quizMinutes + moduleMinutes;

        return { day, minutes: totalMinutes, modules: modulesCount, quizzes: dayQuizzes?.length || 0 };
      });

      setWeeklyProgress(weekData);
    } catch (error) {
      console.error('Error loading weekly progress:', error);
      // Set empty data on error
      setWeeklyProgress([
        { day: 'Mon', modules: 0, quizzes: 0 },
        { day: 'Tue', modules: 0, quizzes: 0 },
        { day: 'Wed', modules: 0, quizzes: 0 },
        { day: 'Thu', modules: 0, quizzes: 0 },
        { day: 'Fri', modules: 0, quizzes: 0 },
        { day: 'Sat', modules: 0, quizzes: 0 },
        { day: 'Sun', modules: 0, quizzes: 0 },
      ]);
    }
  }, [user]);

  const loadAnalyticsStats = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get all quiz attempts with scores and time
      const { data: quizzes } = await supabase
        .from('quiz_attempts')
        .select('score, created_at, time_taken')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      // Fetch all module completions for study time calculation
      const { data: modulePoints } = await supabase
        .from('user_points')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('action_type', 'module_completion');

      // Calculate highest score
      const highestScore = quizzes?.reduce((max, q) => Math.max(max, q.score), 0) || 0;
      
      // Calculate improvement (first 3 vs last 3 quizzes)
      let improvementTrend = 0;
      if (quizzes && quizzes.length >= 6) {
        const first3Avg = quizzes.slice(0, 3).reduce((s, q) => s + q.score, 0) / 3;
        const last3Avg = quizzes.slice(-3).reduce((s, q) => s + q.score, 0) / 3;
        improvementTrend = Math.round(last3Avg - first3Avg);
      } else if (quizzes && quizzes.length >= 2) {
        // For fewer quizzes, compare first half vs second half
        const midpoint = Math.floor(quizzes.length / 2);
        const firstHalfAvg = quizzes.slice(0, midpoint).reduce((s, q) => s + q.score, 0) / midpoint;
        const secondHalfAvg = quizzes.slice(midpoint).reduce((s, q) => s + q.score, 0) / (quizzes.length - midpoint);
        improvementTrend = Math.round(secondHalfAvg - firstHalfAvg);
      }

      // Calculate best day from activity (quizzes + module completions)
      const dayCount: Record<string, number> = {};
      quizzes?.forEach(q => {
        const day = new Date(q.created_at).toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
      });
      modulePoints?.forEach(m => {
        const day = new Date(m.created_at).toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
      });
      const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';

      // Calculate total quiz time (in seconds)
      const totalQuizSeconds = quizzes?.reduce((sum, q) => sum + (q.time_taken || 0), 0) || 0;

      // Add estimated module time (10 minutes per module)
      const totalModuleSeconds = (modulePoints?.length || 0) * 10 * 60;

      const totalSeconds = totalQuizSeconds + totalModuleSeconds;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const totalStudyTime = `${hours}h ${minutes}m`;

      // Average session time (using total activities)
      const totalActivities = (quizzes?.length || 0) + (modulePoints?.length || 0);
      const avgSeconds = totalActivities ? totalSeconds / totalActivities : 0;
      const avgMinutes = Math.round(avgSeconds / 60);
      const averageSession = `${avgMinutes} minutes`;

      // Modules completed from courseProgress
      const modulesCompleted = Object.values(courseProgress)
        .reduce((sum, p) => sum + (p.completed_modules?.length || 0), 0);

      setAnalyticsStats({
        totalStudyTime,
        averageSession,
        bestDay,
        highestScore,
        improvementTrend,
        modulesCompleted
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, [user, courseProgress]);

  // currentStreak is now calculated in useEffect above

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "free": return "bg-awareness/20 text-awareness border-awareness/30";
      case "paid": return "bg-primary/20 text-primary border-primary/30";
      default: return "bg-white/3 text-white/50 border-white/8";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-awareness";
      case "Intermediate": return "text-accent";
      case "Advanced": return "text-destructive";
      default: return "text-white/50";
    }
  };

  // Get real courses from courseContent
  const courses = courseContent.map(course => ({
    id: course.id,
    title: course.title,
    category: course.category,
    duration: `${course.modules.length} modules`,
    difficulty: course.difficulty
  }));

  // Calculate enhanced stats
  const enrolledCourses = Object.keys(courseProgress).length;
  const completedCourses = Object.values(courseProgress).filter(
    progress => progress.completion_percentage === 100
  ).length;
  const totalProgress = enrolledCourses > 0 
    ? Object.values(courseProgress).reduce((sum, progress) => sum + progress.completion_percentage, 0) / enrolledCourses
    : 0;

  const [currentStreak, setCurrentStreak] = useState(0);

  // Calculate real streak from activity data
  useEffect(() => {
    const calculateStreak = async () => {
      if (!user) return;

      try {
        // Get all quiz attempts and course progress ordered by date
        const { data: quizAttempts } = await supabase
          .from('quiz_attempts')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const { data: presenceQuizzes } = await supabase
          .from('user_presence')
          .select('created_at, last_seen')
          .eq('user_id', user.id)
          .eq('content_type', 'quiz_attempt');

        const { data: progressUpdates } = await supabase
          .from('course_progress')
          .select('updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        // Combine and sort all activity dates
        const allDates = new Set<string>();
        quizAttempts?.forEach(a => allDates.add(new Date(a.created_at).toDateString()));
        presenceQuizzes?.forEach(p => allDates.add(new Date(p.created_at || p.last_seen!).toDateString()));
        progressUpdates?.forEach(p => allDates.add(new Date(p.updated_at).toDateString()));

        // Calculate streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          
          if (allDates.has(checkDate.toDateString())) {
            streak++;
          } else if (i > 0) {
            // Allow today to be missing (user might not have done anything yet today)
            break;
          }
        }

        setCurrentStreak(streak);
      } catch (error) {
        console.error('Error calculating streak:', error);
        setCurrentStreak(0);
      }
    };

    calculateStreak();
  }, [user]);

  if (!user) {
    return null;
  }

  const getAchievements = () => {
    const allBadges = getAllBadgesWithStatus();
    return allBadges.map(badge => ({
      title: badge.name,
      description: badge.description,
      icon: badge.type.includes('streak') ? Zap :
            badge.type.includes('quiz') ? Brain :
            badge.type.includes('course') || badge.type.includes('graduate') ? Trophy :
            badge.type.includes('master') ? Award : Star,
      earned: badge.earned,
      date: badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : null
    }));
  };

  const getCoursesByProgress = () => {
    const inProgress = [];
    const completed = [];
    const notStarted = [];

    courses.forEach(course => {
      const progress = courseProgress[course.id];
      if (!progress) {
        notStarted.push(course);
      } else if (progress.completion_percentage === 100) {
        completed.push(course);
      } else {
        inProgress.push(course);
      }
    });

    return { inProgress, completed, notStarted };
  };

  const { inProgress, completed, notStarted } = getCoursesByProgress();
  const achievements = getAchievements();

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 w-full overflow-x-hidden relative">
      {/* Nebula Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl w-full relative z-10">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-12 w-full">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full blur opacity-25" />
            <Avatar className="w-20 h-20 border-2 border-white/10 relative">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="bg-violet-500/10 text-violet-400 text-2xl font-consciousness">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        <div className="flex-1 text-center sm:text-left w-full">
          <h1 className="text-2xl md:text-5xl font-consciousness font-bold text-white mb-2">
              Welcome back, {displayName}
            </h1>
            <p className="text-white/50 font-body text-lg">
              Continue your DeFi learning journey
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 flex-wrap">
              <Badge className="font-body text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400">
                Level {Math.floor(totalProgress / 25) + 1}
              </Badge>
              <div className="flex items-center gap-2 font-body text-sm text-white/40">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>{currentStreak} day streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        {!subLoading && (
          <Card className={`p-6 mb-12 rounded-2xl border transition-all ${hasAccess ? 'bg-white/3 border-violet-500/20' : 'bg-white/3 border-white/8'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasAccess ? 'bg-violet-500/10 text-violet-400' : 'bg-white/5 text-white/40'}`}>
                  {hasAccess ? (
                    <Crown className="w-6 h-6" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-consciousness text-lg font-bold text-white">
                    {hasAccess 
                      ? subscription?.isGrandfathered 
                        ? 'Grandfathered Access'
                        : subscription?.isAdmin
                        ? 'Admin Access'
                        : isTrialing
                        ? 'Free Trial Active'
                        : 'Premium Member'
                      : 'Unlock Full Access'}
                  </h3>
                  <p className="font-body text-sm text-white/40">
                    {hasAccess 
                      ? subscription?.isGrandfathered || subscription?.isAdmin
                        ? 'You have lifetime access to all content'
                        : isTrialing && subscription?.trialEnd
                        ? `Trial ends ${new Date(subscription.trialEnd).toLocaleDateString()}`
                        : `${subscription?.plan === 'annual' ? 'Annual' : 'Monthly'} plan`
                      : 'Start your 14 day free trial today'}
                  </p>
                </div>
              </div>
              {!hasAccess && (
                <Button
                  className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 py-6 transition-all"
                  onClick={() => navigate('/subscription')}
                >
                  Start Free Trial
                </Button>
              )}
              {hasAccess && !subscription?.isGrandfathered && !subscription?.isAdmin && (
                <Button
                  className="font-body border border-white/10 hover:border-violet-500/30 text-white rounded-xl px-8 py-6 transition-all bg-transparent"
                  onClick={() => navigate('/subscription')}
                >
                  Manage Plan
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Points Display */}
        <div className="mb-6 sm:mb-8">
          <PointsDisplay />
        </div>

        {/* Badge Collection */}
        <div className="mb-6 sm:mb-8">
          <BadgeCollection />
        </div>

        {/* Sound Settings */}
        <Card className={`p-5 mb-12 transition-all duration-300 rounded-2xl border ${
          soundEnabled 
            ? 'bg-white/3 border-violet-500/30 shadow-lg shadow-violet-500/10'
            : 'bg-white/3 border-white/8'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center ${
                soundEnabled 
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-white/5 text-white/40'
              }`}>
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 animate-pulse" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </div>
              <div>
                <Label htmlFor="sound-toggle" className="font-consciousness text-sm font-bold text-white flex items-center gap-2">
                  Achievement Sounds
                </Label>
                <p className="font-body text-xs text-white/40 mt-0.5">
                  {soundEnabled 
                    ? 'Audio feedback enabled for achievements'
                    : 'Enable sounds for a more immersive experience'}
                </p>
              </div>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={toggleSound}
              className="data-[state=checked]:bg-violet-600"
            />
          </div>
        </Card>

        {/* Referral Card */}
        <ReferralCard />

        {/* Enhanced Stats Cards - Now Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-12 w-full">
          {[
            { id: 'enrolled', icon: BookOpen, value: enrolledCourses, label: 'Courses Enrolled', color: 'text-violet-400' },
            { id: 'completed', icon: Trophy, value: completedCourses, label: 'Completed', color: 'text-emerald-400' },
            { id: 'quizzes', icon: Brain, value: quizStats.passedQuizzes, label: 'Quizzes Passed', color: 'text-violet-400' },
            { id: 'scores', icon: TrendingUp, value: `${quizStats.averageScore}%`, label: 'Avg. Quiz Score', color: 'text-violet-400' },
            { id: 'progress', icon: Target, value: `${Math.round(totalProgress)}%`, label: 'Overall Progress', color: 'text-blue-400' }
          ].map((stat) => (
            <Card
              key={stat.id}
              className="p-4 md:p-6 bg-white/3 border border-white/8 rounded-2xl cursor-pointer hover:border-violet-500/20 transition-all group relative overflow-hidden"
              onClick={() => setOpenDetail(stat.id)}
            >
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-consciousness text-2xl sm:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="font-body text-[10px] uppercase tracking-widest text-white/40">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Progress Overview */}
        <Card className="p-4 sm:p-8 mb-12 bg-white/3 border border-white/8 rounded-2xl w-full overflow-x-auto">
          <h3 className="font-consciousness text-base sm:text-lg font-bold text-white mb-6 sm:mb-8">Weekly Learning Activity</h3>
          <div className="grid grid-cols-7 gap-2 sm:gap-4 min-w-[400px]">
            {weeklyProgress.map((day, index) => {
              // Goal is 60 minutes per day
              const percentage = Math.min((day.minutes / 60) * 100, 100);
              return (
                <div key={index} className="text-center group">
                  <p className="font-body text-xs uppercase tracking-widest text-white/40 mb-3 group-hover:text-violet-400 transition-colors">{day.day}</p>
                  <div className="space-y-3">
                    <div className="h-24 bg-white/5 rounded-xl flex items-end justify-center overflow-hidden relative">
                      <div
                        className="bg-violet-600 transition-all duration-1000 w-full"
                        style={{ height: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                    <p className="font-consciousness text-sm font-bold text-white">{day.minutes}m</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-white/50 justify-center sm:justify-start">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Goal: 60m / day</span>
            </div>
            <span>• Estimated 10m per module</span>
          </div>
        </Card>

        {/* Main Content with Enhanced Tabs */}
        <Tabs defaultValue="progress" className="space-y-12 w-full">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="flex flex-nowrap gap-3 w-full min-w-max p-2 bg-white/5 rounded-2xl border border-white/8 justify-center h-auto">
              {['progress', 'achievements', 'activity', 'analytics'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex-1 font-body text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all data-[state=active]:bg-violet-600 data-[state=active]:text-white whitespace-nowrap"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="progress" className="space-y-12 w-full">
            {/* Continue Learning Section */}
            {inProgress.length > 0 && (
              <div className="w-full">
                <h2 className="font-consciousness text-xl font-bold text-white mb-6">
                  Continue Learning
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {inProgress.map(course => (
                    <Card 
                      key={course.id}
                      className="p-8 bg-white/3 border border-white/8 rounded-2xl hover:border-violet-500/30 transition-all cursor-pointer group"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                          <span className="font-body text-xs uppercase tracking-widest text-violet-400">Continue</span>
                        </div>
                        <Badge className="font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400">
                          {course.category === "free" ? "Free" : "Premium"}
                        </Badge>
                      </div>
                      <h3 className="font-consciousness text-lg font-bold text-white mb-4 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-6 mb-8 font-body text-xs uppercase tracking-widest text-white/40">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between font-body text-xs uppercase tracking-widest text-white/40">
                          <span>Progress</span>
                          <span className="text-white">{Math.round(courseProgress[course.id]?.completion_percentage || 0)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-600 transition-all duration-1000"
                            style={{ width: `${courseProgress[course.id]?.completion_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Courses Section */}
            {completed.length > 0 && (
              <div>
                <h2 className="text-xl font-consciousness font-semibold text-foreground mb-4">
                  Completed Courses
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {completed.map(course => (
                    <Card
                      key={course.id}
                      className="p-6 bg-awareness/10 border-awareness/30 hover:border-awareness/50 transition-all cursor-pointer group"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-awareness group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-awareness">Completed</span>
                        </div>
                        <Badge className={getCategoryColor(course.category)}>
                          {course.category === "free" ? "Free" : "Premium"}
                        </Badge>
                      </div>
                      <h3 className="font-consciousness font-semibold text-foreground mb-3 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-4 mb-4 text-sm text-white/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Courses Section */}
            {notStarted.length > 0 && (
              <div>
                <h2 className="text-xl font-consciousness font-semibold text-foreground mb-4">
                  Recommended Courses
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {notStarted.map(course => (
                    <Card
                      key={course.id}
                      className="p-6 bg-white/3 border-white/8 hover:border-primary/40 transition-all cursor-pointer group"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-primary">Start Learning</span>
                        </div>
                        <Badge className={getCategoryColor(course.category)}>
                          {course.category === "free" ? "Free" : "Premium"}
                        </Badge>
                      </div>
                      <h3 className="font-consciousness font-semibold text-foreground mb-3 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-4 mb-4 text-sm text-white/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <Card 
                  key={index}
                  className={`p-6 transition-all ${
                    achievement.earned 
                      ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg" 
                      : "bg-white/3 border-white/8 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full ${
                      achievement.earned ? "bg-primary/20" : "bg-white/5"
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.earned ? "text-primary" : "text-white/50"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-consciousness font-semibold text-foreground">
                        {achievement.title}
                      </h3>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-white/50">
                          Earned {achievement.date}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white/50 font-consciousness">
                    {achievement.description}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="p-6 bg-white/3 border-white/8">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="font-consciousness font-semibold text-foreground">
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    const isQuiz = activity.type === 'quiz';
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-white/3 rounded-lg">
                        <div className={`p-2 rounded-full ${
                          isQuiz
                            ? (activity.passed ? "bg-awareness/20 text-awareness" : "bg-destructive/20 text-destructive")
                            : "bg-primary/20 text-primary"
                        }`}>
                          {isQuiz ? (
                            activity.passed ? <CheckCircle2 className="w-4 h-4" /> : <Brain className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-consciousness text-foreground text-sm sm:text-base">
                            {isQuiz ? (
                              `${activity.passed ? "Passed" : "Attempted"} quiz: ${activity.title}`
                            ) : (
                              activity.action_type === 'module_completion' ? 'Completed a learning module' :
                              activity.action_type === 'course_completion' ? 'Successfully completed a course' :
                              activity.action_type === 'tutorial_completed' ? 'Finished a tutorial' : 'Earned points'
                            )}
                          </p>
                          <p className="text-xs text-white/50">
                            {new Date(activity.created_at).toLocaleDateString()} • {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {isQuiz ? (
                          <Badge variant={activity.passed ? "default" : "destructive"} className="text-xs">
                            {activity.score}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-awareness/20 text-awareness border-awareness/30">
                            +{activity.points}
                          </Badge>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-white/50 font-consciousness py-8">
                    No recent activity. Start learning to see your progress here!
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 bg-white/3 border border-white/8 rounded-2xl">
                <h3 className="font-consciousness text-lg font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  Learning Statistics
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Total Study Time', value: analyticsStats.totalStudyTime },
                    { label: 'Average Session', value: analyticsStats.averageSession },
                    { label: 'Best Day', value: analyticsStats.bestDay },
                    { label: 'Modules Completed', value: analyticsStats.modulesCompleted }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                      <span className="font-body text-sm text-white/40 uppercase tracking-widest">{stat.label}</span>
                      <span className="font-consciousness text-lg font-bold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-8 bg-white/3 border border-white/8 rounded-2xl">
                <h3 className="font-consciousness text-lg font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  Quiz Performance
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Quizzes Taken', value: quizStats.completedQuizzes },
                    { label: 'Pass Rate', value: `${quizStats.completedQuizzes > 0 ? Math.round((quizStats.passedQuizzes / quizStats.completedQuizzes) * 100) : 0}%` },
                    { label: 'Highest Score', value: `${analyticsStats.highestScore}%` },
                    { label: 'Improvement Trend', value: `${analyticsStats.improvementTrend >= 0 ? '+' : ''}${analyticsStats.improvementTrend}%`, trend: true }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                      <span className="font-body text-sm text-white/40 uppercase tracking-widest">{stat.label}</span>
                      <span className={`font-consciousness text-lg font-bold ${stat.trend ? (analyticsStats.improvementTrend >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Detail Sheets */}
        {/* Enrolled Courses Sheet */}
        <Sheet open={openDetail === 'enrolled'} onOpenChange={(open) => !open && setOpenDetail(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Enrolled Courses ({enrolledCourses})
              </SheetTitle>
              <SheetDescription>All courses you're currently enrolled in</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 mt-6">
              {[...inProgress, ...completed].length > 0 ? (
                [...inProgress, ...completed].map(course => (
                  <Card 
                    key={course.id}
                    className="p-4 cursor-pointer hover:border-primary/40 transition-all group"
                    onClick={() => {
                      setOpenDetail(null);
                      navigate(`/courses/${course.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground line-clamp-1">{course.title}</h4>
                      <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-primary" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryColor(course.category)} variant="outline">
                        {course.category === "free" ? "Free" : "Paid"}
                      </Badge>
                      <span className={`text-xs ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={courseProgress[course.id]?.completion_percentage || 0} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{Math.round(courseProgress[course.id]?.completion_percentage || 0)}%</span>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-white/50 py-8">
                  No courses enrolled yet. Start learning!
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Completed Courses Sheet */}
        <Sheet open={openDetail === 'completed'} onOpenChange={(open) => !open && setOpenDetail(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-awareness" />
                Completed Courses ({completedCourses})
              </SheetTitle>
              <SheetDescription>Courses you've successfully completed</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 mt-6">
              {completed.length > 0 ? (
                completed.map(course => (
                  <Card 
                    key={course.id}
                    className="p-4 cursor-pointer hover:border-awareness/40 transition-all group bg-awareness/5"
                    onClick={() => {
                      setOpenDetail(null);
                      navigate(`/courses/${course.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground line-clamp-1">{course.title}</h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-awareness" />
                        <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-awareness" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-awareness/20 text-awareness border-awareness/30" variant="outline">
                        Completed
                      </Badge>
                      <span className={`text-xs ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-white/50 py-8">
                  No courses completed yet. Keep learning!
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Passed Quizzes Sheet */}
        <Sheet open={openDetail === 'quizzes'} onOpenChange={(open) => !open && setOpenDetail(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                Passed Quizzes ({quizStats.passedQuizzes})
              </SheetTitle>
              <SheetDescription>All quizzes you've successfully passed</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 mt-6">
              {detailedQuizzes.filter(q => q.passed).length > 0 ? (
                detailedQuizzes.filter(q => q.passed).map(quiz => (
                  <Card 
                    key={quiz.id}
                    className="p-4 cursor-pointer hover:border-accent/40 transition-all group"
                    onClick={() => {
                      setOpenDetail(null);
                      if (quiz.quizzes?.course_id) {
                        navigate(`/courses/${quiz.quizzes.course_id}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground line-clamp-1">
                        {quiz.quizzes?.title || 'Quiz'}
                      </h4>
                      <Badge className="bg-awareness/20 text-awareness">{quiz.score}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/50">
                      <span>Passed on {new Date(quiz.created_at).toLocaleDateString()}</span>
                      {quiz.time_taken && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(quiz.time_taken / 60)}m
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-white/50 py-8">
                  No quizzes passed yet. Take a quiz to get started!
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* All Quiz Scores Sheet */}
        <Sheet open={openDetail === 'scores'} onOpenChange={(open) => !open && setOpenDetail(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-awareness" />
                All Quiz Attempts ({detailedQuizzes.length})
              </SheetTitle>
              <SheetDescription>
                Average Score: {quizStats.averageScore}%
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-3 mt-6">
              {detailedQuizzes.length > 0 ? (
                detailedQuizzes.map(quiz => (
                  <Card 
                    key={quiz.id}
                    className={`p-4 cursor-pointer transition-all group ${
                      quiz.passed 
                        ? 'hover:border-awareness/40 bg-awareness/5' 
                        : 'hover:border-destructive/40 bg-destructive/5'
                    }`}
                    onClick={() => {
                      setOpenDetail(null);
                      if (quiz.quizzes?.course_id) {
                        navigate(`/courses/${quiz.quizzes.course_id}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground line-clamp-1">
                        {quiz.quizzes?.title || 'Quiz'}
                      </h4>
                      <Badge className={quiz.passed ? "bg-awareness/20 text-awareness" : "bg-destructive/20 text-destructive"}>
                        {quiz.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        {quiz.passed ? (
                          <CheckCircle2 className="w-3 h-3 text-awareness" />
                        ) : (
                          <span className="w-3 h-3 rounded-full bg-destructive" />
                        )}
                        {quiz.passed ? 'Passed' : 'Not Passed'}
                      </span>
                      <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-white/50 py-8">
                  No quiz attempts yet. Take a quiz to get started!
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Overall Progress Sheet */}
        <Sheet open={openDetail === 'progress'} onOpenChange={(open) => !open && setOpenDetail(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Overall Progress ({Math.round(totalProgress)}%)
              </SheetTitle>
              <SheetDescription>Breakdown of your progress across all courses</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              {/* Summary Stats */}
              <Card className="p-4 bg-white/5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{enrolledCourses}</p>
                    <p className="text-xs text-white/50">Enrolled</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-awareness">{completedCourses}</p>
                    <p className="text-xs text-white/50">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{analyticsStats.modulesCompleted}</p>
                    <p className="text-xs text-white/50">Modules</p>
                  </div>
                </div>
              </Card>

              {/* Per-course breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-white/50">Course Breakdown</h4>
                {courses.map(course => {
                  const progress = courseProgress[course.id]?.completion_percentage || 0;
                  const isCompleted = progress === 100;
                  const isStarted = progress > 0;
                  
                  return (
                    <Card 
                      key={course.id}
                      className={`p-4 cursor-pointer transition-all group ${
                        isCompleted 
                          ? 'bg-awareness/5 hover:border-awareness/40' 
                          : isStarted 
                          ? 'hover:border-primary/40' 
                          : 'hover:border-white/8'
                      }`}
                      onClick={() => {
                        setOpenDetail(null);
                        navigate(`/courses/${course.id}`);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground line-clamp-1 text-sm">{course.title}</h4>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-awareness" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={progress} 
                          className={`flex-1 h-2 ${isCompleted ? '[&>div]:bg-awareness' : ''}`} 
                        />
                        <span className={`text-sm font-medium ${isCompleted ? 'text-awareness' : ''}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
