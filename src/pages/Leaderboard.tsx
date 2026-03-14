import { useState, useEffect } from 'react';
import { usePoints } from '@/hooks/usePoints';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  rank: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const { displayName: ownDisplayName, avatarUrl: ownAvatarUrl } = useProfile();
  const { getLeaderboard, rank: userRank, leaderboardLoading } = usePoints();
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

  const periods: { id: 'weekly' | 'monthly' | 'all-time'; label: string }[] = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all-time', label: 'All Time' },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-white/80" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <>
      <SEO
        title="DeFi Learning Leaderboard | Sentinel DeFi"
        description="See the top learners in the Sentinel DeFi community. Earn points by completing courses, tutorials, and community challenges."
        keywords="DeFi leaderboard, crypto education rankings, learn to earn crypto, DeFi community points"
        url="https://www.sentineldefi.online/leaderboard"
      />

      <div className="min-h-screen bg-transparent pb-20">
        <PageHero
          eyebrow="Rankings"
          title="The Leaderboard"
          subtitle="The top earners on the platform. Points are earned by completing courses, passing quizzes, referring members, and participating in the community."
        />

        <div className="max-w-5xl mx-auto px-6">
          {/* Time Period Tabs - Responsive Container */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full gap-1 overflow-x-auto no-scrollbar max-w-full">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`font-body text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-8 py-2 sm:py-2.5 rounded-full transition-all whitespace-nowrap ${
                    period === p.id
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {leaderboardLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : (
            <>
              {/* Top 3 — Mobile: stacked, Desktop: podium */}
              <div className="mb-12">
                {/* 1st Place — always on top / center */}
                {topThree[0] && (
                  <div className="flex justify-center mb-4 md:hidden">
                    <div
                      onClick={() => navigate(`/profile/${topThree[0].user_id}`)}
                      className="relative flex flex-col items-center p-6 rounded-3xl border border-amber-500/40 bg-amber-500/5 cursor-pointer hover:border-amber-500/60 transition-all w-full max-w-xs"
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-consciousness text-sm font-bold text-amber-400">1st Place</span>
                      </div>
                      <Avatar className="w-20 h-20 mb-3 mt-2 border-2 border-amber-500/30">
                        <AvatarImage src={topThree[0].avatar_url || ''} />
                        <AvatarFallback className="bg-amber-500/10 text-amber-400 text-xl font-consciousness">
                          {(topThree[0].display_name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-consciousness text-lg font-bold text-amber-400 text-center mb-1 truncate w-full">
                        {topThree[0].display_name || 'Anonymous'}
                      </h3>
                      <p className="font-consciousness text-base font-bold text-violet-400">
                        {topThree[0].total_points.toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                )}

                {/* 2nd and 3rd — mobile side by side */}
                <div className="grid grid-cols-2 gap-3 md:hidden mb-6">
                  {topThree[1] && (
                    <div
                      onClick={() => navigate(`/profile/${topThree[1].user_id}`)}
                      className="relative flex flex-col items-center p-4 rounded-2xl border border-white/20 bg-white/5 cursor-pointer hover:border-white/40 transition-all"
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <Medal className="w-3.5 h-3.5 text-white/80" />
                        <span className="font-consciousness text-[10px] font-bold text-white/70">2nd</span>
                      </div>
                      <Avatar className="w-14 h-14 mb-2 mt-2 border-2 border-white/15">
                        <AvatarImage src={topThree[1].avatar_url || ''} />
                        <AvatarFallback className="bg-white/10 text-white/60 text-sm font-consciousness">
                          {(topThree[1].display_name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-consciousness text-xs font-bold text-white/80 text-center truncate w-full">
                        {topThree[1].display_name || 'Anonymous'}
                      </h3>
                      <p className="font-consciousness text-xs font-bold text-violet-400 mt-0.5">
                        {topThree[1].total_points.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {topThree[2] && (
                    <div
                      onClick={() => navigate(`/profile/${topThree[2].user_id}`)}
                      className="relative flex flex-col items-center p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 cursor-pointer hover:border-orange-500/40 transition-all"
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-consciousness text-[10px] font-bold text-orange-400">3rd</span>
                      </div>
                      <Avatar className="w-14 h-14 mb-2 mt-2 border-2 border-orange-500/15">
                        <AvatarImage src={topThree[2].avatar_url || ''} />
                        <AvatarFallback className="bg-orange-500/10 text-orange-400 text-sm font-consciousness">
                          {(topThree[2].display_name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-consciousness text-xs font-bold text-orange-400 text-center truncate w-full">
                        {topThree[2].display_name || 'Anonymous'}
                      </h3>
                      <p className="font-consciousness text-xs font-bold text-violet-400 mt-0.5">
                        {topThree[2].total_points.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Desktop: original 3-column podium — hidden on mobile */}
                <div className="hidden md:grid grid-cols-3 gap-6 items-end mt-10">
                  {topThree[1] && (
                    <div
                      onClick={() => navigate(`/profile/${topThree[1].user_id}`)}
                      className="relative flex flex-col items-center p-8 rounded-3xl border border-white/30 bg-white/5 cursor-pointer hover:border-white/50 transition-all"
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 rounded-full px-3 py-1 flex items-center gap-1">
                        <Medal className="w-3.5 h-3.5 text-white/80" />
                        <span className="font-consciousness text-xs font-bold text-white/80">2nd</span>
                      </div>
                      <Avatar className="w-20 h-20 mb-4 border-2 border-white/20">
                        <AvatarImage src={topThree[1].avatar_url || ''} />
                        <AvatarFallback className="bg-white/10 text-white/80 text-xl font-consciousness">
                          {(topThree[1].display_name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-consciousness text-xl font-bold text-white/80 text-center mb-1 truncate w-full">
                        {topThree[1].display_name || 'Anonymous'}
                      </h3>
                      <p className="font-consciousness text-lg font-bold text-violet-400">
                        {topThree[1].total_points.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {topThree[0] && (
                    <div
                      onClick={() => navigate(`/profile/${topThree[0].user_id}`)}
                      className="relative flex flex-col items-center p-10 rounded-3xl border border-amber-500/40 bg-amber-500/5 cursor-pointer hover:border-amber-500/60 transition-all transform scale-110 -translate-y-4"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                        <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-consciousness text-sm font-bold text-amber-400">1st</span>
                      </div>
                      <Avatar className="w-24 h-24 mb-4 border-2 border-amber-500/30">
                        <AvatarImage src={topThree[0].avatar_url || ''} />
                        <AvatarFallback className="bg-amber-500/10 text-amber-400 text-2xl font-consciousness">
                          {(topThree[0].display_name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-consciousness text-2xl font-bold text-amber-400 text-center mb-1 truncate w-full">
                        {topThree[0].display_name || 'Anonymous'}
                      </h3>
                      <p className="font-consciousness text-xl font-bold text-violet-400">
                        {topThree[0].total_points.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {topThree[2] && (
                    <div
                      onClick={() => navigate(`/profile/${topThree[2].user_id}`)}
                      className="relative flex flex-col items-center p-8 rounded-3xl border border-orange-500/30 bg-orange-500/5 cursor-pointer hover:border-orange-500/50 transition-all"
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-consciousness text-xs font-bold text-orange-400">3rd</span>
                      </div>
                      <Avatar className="w-20 h-20 mb-4 border-2 border-orange-500/20">
                        <AvatarImage src={topThree[2].avatar_url || ''} />
                        <AvatarFallback className="bg-orange-500/10 text-orange-400 text-xl font-consciousness">
                          {(topThree[2].display_name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-consciousness text-lg font-bold text-orange-400 text-center mb-1 truncate w-full">
                        {topThree[2].display_name || 'Anonymous'}
                      </h3>
                      <p className="font-consciousness text-lg font-bold text-violet-400">
                        {topThree[2].total_points.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ranks 4 and Below */}
              <div className="space-y-3 mb-12">
                {remaining.map((entry) => {
                  const isCurrentUser = entry.user_id === user?.id;
                  return (
                    <div
                      key={entry.user_id}
                      onClick={() => navigate(`/profile/${entry.user_id}`)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrentUser
                          ? 'border-violet-500/30 bg-violet-500/5'
                          : 'border-white/5 bg-white/2 hover:border-violet-500/20 hover:bg-violet-500/3'
                      }`}
                    >
                      <span className="font-consciousness text-sm font-bold text-white/40 w-8">
                        {entry.rank}
                      </span>
                      <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={entry.avatar_url || ''} />
                        <AvatarFallback className="bg-white/5 text-white/40 text-sm font-consciousness">
                          {(entry.display_name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`font-consciousness text-sm font-medium flex-1 truncate ${isCurrentUser ? 'text-violet-400' : 'text-white'}`}>
                        {entry.display_name || 'Anonymous'}
                        {isCurrentUser && " (You)"}
                      </span>
                      <span className="font-consciousness text-sm font-bold text-violet-400">
                        {entry.total_points.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Current User Row (If not in top 10) */}
              {userRank && userRank.rank > leaderboard.length && (
                <div className="pt-8 border-t border-white/5 mt-8">
                  <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-4 text-center">Your Position</p>
                  <div
                    onClick={() => navigate(`/profile/${user?.id}`)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl border border-violet-500/40 bg-violet-500/10 cursor-pointer transition-all hover:bg-violet-500/15 group"
                  >
                    <span className="font-consciousness text-sm font-bold text-violet-400/60 w-8">
                      {userRank.rank}
                    </span>
                    <Avatar className="w-10 h-10 border-2 border-violet-500/30 group-hover:border-violet-500/50 transition-all">
                      <AvatarImage src={ownAvatarUrl || ""} />
                      <AvatarFallback className="bg-violet-500/20 text-violet-400 text-sm font-consciousness">
                        {ownDisplayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-consciousness text-sm font-bold flex-1 text-white">
                      {ownDisplayName} <span className="text-violet-400/60 font-medium ml-1">(You)</span>
                    </span>
                    <span className="font-consciousness text-base font-bold text-violet-400">
                      {userRank.total_points.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {leaderboard.length === 0 && !leaderboardLoading && (
            <div className="text-center py-20 bg-white/3 border border-white/8 rounded-3xl">
              <Trophy className="w-12 h-12 mx-auto text-white/10 mb-4" />
              <h3 className="font-consciousness text-xl font-bold text-white mb-2">No rankings yet</h3>
              <p className="font-body text-sm text-white/40 max-w-xs mx-auto">
                Be the first to earn points and claim your spot on the leaderboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
