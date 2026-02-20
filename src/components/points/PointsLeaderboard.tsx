import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePoints } from '@/hooks/usePoints';
import { useAuth } from '@/components/auth/AuthProvider';
import { Trophy, Medal, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  rank: number;
}

export const PointsLeaderboard = () => {
  const { user } = useAuth();
  const { getLeaderboard, rank: userRank, leaderboardLoading: loading } = usePoints();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('monthly');
  const navigate = useNavigate();

  useEffect(() => {
    const loadLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
    };
    loadLeaderboard();
  }, [getLeaderboard]);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-amber-500/40 bg-amber-500/5 text-amber-400';
      case 2:
        return 'border-white/30 bg-white/5 text-white/80';
      case 3:
        return 'border-orange-500/30 bg-orange-500/5 text-orange-400';
      default:
        return 'border-white/5 bg-white/2 hover:border-violet-500/20 hover:bg-violet-500/3';
    }
  };

  const getRankNumberColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-amber-400';
      case 2: return 'text-white/80';
      case 3: return 'text-orange-400';
      default: return 'text-white/30';
    }
  };

  if (loading) {
    return (
      <Card className="p-4 bg-white/3 border border-white/8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-xl" />
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-white/3 border border-white/8 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-violet-400" />
          <h3 className="font-consciousness font-bold text-white">Leaderboard</h3>
        </div>

        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          {['weekly', 'monthly', 'all-time'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`font-body text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                period === p
                  ? 'bg-violet-600 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {p.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20 text-white" />
          <p className="font-body text-sm text-white/40">No points earned yet for this period.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === user?.id;
            
            return (
              <div
                key={entry.user_id}
                onClick={() => navigate(`/profile/${entry.user_id}`)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrentUser ? 'border-violet-500/30 bg-violet-500/5' : getRankStyle(entry.rank)
                }`}
              >
                <div className={`font-consciousness text-sm font-bold w-6 text-center ${getRankNumberColor(entry.rank)}`}>
                  {entry.rank}
                </div>
                
                <Avatar className="w-8 h-8 border border-white/10">
                  <AvatarImage src={entry.avatar_url || ''} />
                  <AvatarFallback className="text-[10px] bg-white/5 text-white/40 font-consciousness">
                    {(entry.display_name || 'A').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-consciousness text-sm font-medium truncate ${isCurrentUser ? 'text-violet-400' : 'text-white'}`}>
                    {entry.display_name || 'Anonymous'}
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="font-consciousness text-sm font-bold text-violet-400">{entry.total_points.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {userRank && userRank.rank > 10 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div
            onClick={() => navigate(`/profile/${user?.id}`)}
            className="flex items-center gap-4 px-4 py-3 rounded-xl border border-violet-500/30 bg-violet-500/5 cursor-pointer"
          >
            <div className="font-consciousness text-sm font-bold text-white/30 w-6 text-center">
              {userRank.rank}
            </div>
            <Avatar className="w-8 h-8 border border-violet-500/20">
              <AvatarFallback className="text-[10px] bg-violet-500/10 text-violet-400 font-consciousness">
                You
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-consciousness text-sm font-medium text-violet-400">Your Position</p>
            </div>
            <div className="text-right">
              <span className="font-consciousness text-sm font-bold text-violet-400">{userRank.total_points.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button
          variant="outline"
          className="w-full font-body text-xs uppercase tracking-widest border-white/10 text-white hover:bg-white/5 rounded-xl py-5"
          onClick={() => navigate('/leaderboard')}
        >
          View Full Leaderboard
        </Button>
      </div>
    </Card>
  );
};
