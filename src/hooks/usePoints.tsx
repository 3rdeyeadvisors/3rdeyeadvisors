import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Point values for different actions
export const POINT_VALUES = {
  // One-time actions
  account_creation: 100,
  first_course_started: 50,
  complete_profile: 50,
  accept_referral_terms: 25,
  
  // Repeatable actions
  daily_login: 10,
  module_completion: 25,
  course_completion: 100,
  quiz_passed: 50,
  quiz_perfect: 75, // Bonus for 100% score
  tutorial_completed: 20,
  comment_posted: 15,
  discussion_started: 25,
  discussion_reply: 10,
  rate_course: 20,
  roadmap_vote: 15, // Points for voting on roadmap items
  
  // Referral points
  referral_signup: 50,
  referral_monthly_conversion: 150,
  referral_annual_conversion: 300,
  referral_founding33_conversion: 500,
} as const;

export type PointActionType = keyof typeof POINT_VALUES;

interface PointTransaction {
  id: string;
  points: number;
  action_type: string;
  action_id: string | null;
  metadata: unknown;
  created_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  rank: number;
}

interface UserRank {
  total_points: number;
  rank: number;
  total_users: number;
}

export const usePoints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    return new Date().toISOString().slice(0, 7);
  };

  // 1. Query for User Points and Rank
  const { data: pointsData, isLoading: pointsLoading, refetch: refreshPoints } = useQuery({
    queryKey: ['user-points', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user's monthly total
      const { data: monthlyData } = await supabase
        .from('user_points_monthly')
        .select('total_points')
        .eq('user_id', user.id)
        .eq('month_year', getCurrentMonth())
        .maybeSingle();

      // Get user's rank using database function
      const { data: rankData } = await supabase
        .rpc('get_user_points_rank', { _user_id: user.id });

      // Get today's points
      const today = new Date().toISOString().slice(0, 10);
      const { data: todayData } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const todayTotal = todayData?.reduce((sum, p) => sum + p.points, 0) || 0;

      return {
        totalPoints: monthlyData?.total_points || 0,
        rank: rankData && rankData.length > 0 ? {
          total_points: rankData[0].total_points,
          rank: rankData[0].rank,
          total_users: rankData[0].total_users,
        } : null,
        todayPoints: todayTotal
      };
    },
    enabled: !!user,
  });

  // 2. Mutation for awarding points
  const awardPointsMutation = useMutation({
    mutationFn: async ({ actionType, actionId, metadata }: {
      actionType: PointActionType,
      actionId?: string,
      metadata?: Record<string, unknown>
    }) => {
      if (!user) throw new Error('User not authenticated');

      const basePoints = POINT_VALUES[actionType];
      if (!basePoints) throw new Error('Invalid action type');

      const { data, error } = await supabase.rpc('award_user_points', {
        _user_id: user.id,
        _points: basePoints,
        _action_type: actionType,
        _action_id: actionId || null,
        _metadata: metadata || {},
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-points', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['points-history', user?.id] });
    }
  });

  const awardPoints = useCallback(async (
    actionType: PointActionType,
    actionId?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      const result = await awardPointsMutation.mutateAsync({ actionType, actionId, metadata });
      return {
        success: result?.success || false,
        pointsAwarded: result?.points_awarded || 0,
        message: result?.message || ''
      };
    } catch (error) {
      return { 
        success: false, 
        pointsAwarded: 0, 
        message: error instanceof Error ? error.message : 'Error awarding points'
      };
    }
  }, [awardPointsMutation]);

  // 3. Mutation for daily login check
  const checkDailyLoginMutation = useMutation({
    mutationFn: async () => {
      if (!user) return { already_logged_in: true, points_awarded: 0 };

      const { data, error } = await supabase.rpc('check_daily_login', {
        _user_id: user.id,
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (result) => {
      if (result && !result.already_logged_in) {
        queryClient.invalidateQueries({ queryKey: ['user-points', user?.id] });
      }
    }
  });

  const checkDailyLogin = useCallback(async () => {
    try {
      const result = await checkDailyLoginMutation.mutateAsync();
      return {
        alreadyLoggedIn: result?.already_logged_in || false,
        pointsAwarded: result?.points_awarded || 0
      };
    } catch (error) {
      return { alreadyLoggedIn: true, pointsAwarded: 0 };
    }
  }, [checkDailyLoginMutation]);

  // 4. Query for point history
  const { data: pointHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['points-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as PointTransaction[] || [];
    },
    enabled: !!user,
  });

  // 5. Query for leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['points-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_points_leaderboard', {
        _limit: 10,
      });

      if (error) throw error;
      return data as LeaderboardEntry[] || [];
    },
  });

  // Get days remaining in month
  const getDaysRemaining = () => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return endOfMonth.getDate() - now.getDate();
  };

  // Get action display name
  const getActionDisplayName = (actionType: string): string => {
    const displayNames: Record<string, string> = {
      account_creation: 'Account Created',
      first_course_started: 'First Course Started',
      complete_profile: 'Profile Completed',
      accept_referral_terms: 'Referral Terms Accepted',
      daily_login: 'Daily Login',
      module_completion: 'Module Completed',
      course_completion: 'Course Completed',
      quiz_passed: 'Quiz Passed',
      quiz_perfect: 'Perfect Quiz Score',
      tutorial_completed: 'Tutorial Completed',
      comment_posted: 'Comment Posted',
      discussion_started: 'Discussion Started',
      discussion_reply: 'Discussion Reply',
      rate_course: 'Course Rated',
      roadmap_vote: 'Roadmap Vote',
      referral_signup: 'Referral Signup',
      referral_monthly_conversion: 'Referral Subscribed (Monthly)',
      referral_annual_conversion: 'Referral Subscribed (Annual)',
      referral_founding33_conversion: 'Founding 33 Referral',
    };
    return displayNames[actionType] || actionType;
  };

  return {
    totalPoints: pointsData?.totalPoints || 0,
    rank: pointsData?.rank || null,
    loading: pointsLoading,
    todayPoints: pointsData?.todayPoints || 0,
    awardPoints,
    checkDailyLogin,
    getPointHistory: async () => pointHistory, // Keep backward compatibility if needed
    getLeaderboard: async () => leaderboard,
    pointHistory,
    leaderboard,
    historyLoading,
    leaderboardLoading,
    getDaysRemaining,
    getActionDisplayName,
    refreshPoints,
    POINT_VALUES,
  };
};
