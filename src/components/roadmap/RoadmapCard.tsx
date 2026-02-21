import { Check, Loader2, Crown, Star, Clock, AlertTriangle, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import type { VoteType } from '@/hooks/useRoadmapVotes';

interface RoadmapCardProps {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  votingEndsAt: string | null;
  yesVotes: number;
  noVotes: number;
  netVotes: number;
  userVoteType: VoteType | null;
  canVote: boolean;
  votingTier: 'founding' | 'annual' | 'none';
  voteWeight: number;
  isVoting: boolean;
  isVotingOpen: boolean;
  onVote: (voteType: VoteType) => void;
  onRemoveVote: () => void;
}

const statusConfig = {
  proposed: {
    label: 'Proposed',
    className: 'bg-white/8 text-white/50 border-white/15',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
};

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
  urgent: boolean; // Less than 24 hours
}

const getTimeRemaining = (votingEndsAt: string | null): TimeRemaining | null => {
  if (!votingEndsAt) return null;
  
  const end = new Date(votingEndsAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true, urgent: false };
  }
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const urgent = diffMs < 24 * 60 * 60 * 1000; // Less than 24 hours
  
  return { days, hours, minutes, expired: false, urgent };
};

export const RoadmapCard = ({
  id,
  title,
  description,
  status,
  votingEndsAt,
  yesVotes,
  noVotes,
  netVotes,
  userVoteType,
  canVote,
  votingTier,
  voteWeight,
  isVoting,
  isVotingOpen,
  onVote,
  onRemoveVote,
}: RoadmapCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.proposed;
  const totalVotes = yesVotes + noVotes;
  // Calculate sentiment as percentage of yes votes out of total votes
  // If no votes yet, show neutral (50%)
  const sentimentPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 50;
  const isCompleted = status === 'completed';
  
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(() => 
    getTimeRemaining(votingEndsAt)
  );

  // Update countdown every minute
  useEffect(() => {
    if (!votingEndsAt || isCompleted) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(votingEndsAt));
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [votingEndsAt, isCompleted]);

  const formatTimeRemaining = () => {
    if (!timeRemaining) return null;
    if (timeRemaining.expired) return 'Voting ended';
    
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h left`;
    }
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m left`;
    }
    return `${timeRemaining.minutes}m left`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open dialog if clicking on a button
    if ((e.target as HTMLElement).closest('button')) return;
    setDialogOpen(true);
  };

  const VotingButtons = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center justify-center gap-1 text-emerald-400 min-h-[36px]">
          <Check className="w-4 h-4" />
          <span className="text-sm font-semibold">Completed</span>
        </div>
      );
    }

    if (!isVotingOpen) {
      return (
        <div className="flex items-center justify-center gap-1 text-white/40 min-h-[36px]">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase tracking-widest">Closed</span>
        </div>
      );
    }

    if (!canVote) {
      return (
        <div className="flex gap-2 w-full">
          <Button disabled className="flex-1 min-h-[36px] bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest font-body rounded-lg">
            Upgrade to Vote
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2 w-full">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onVote('yes');
          }}
          disabled={isVoting}
          className={`flex-1 min-h-[36px] font-body text-xs rounded-lg transition-all ${
            userVoteType === 'yes'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {isVoting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <ThumbsUp className="w-3.5 h-3.5 mr-2" />
              Support
            </>
          )}
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onVote('no');
          }}
          disabled={isVoting}
          className={`flex-1 min-h-[36px] font-body text-xs rounded-lg transition-all ${
            userVoteType === 'no'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
              : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          {isVoting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <ThumbsDown className="w-3.5 h-3.5 mr-2" />
              Oppose
            </>
          )}
        </Button>
      </div>
    );
  };

  const VoteWeightBadge = () => {
    if (votingTier === 'none') return null;

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
        votingTier === 'founding'
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
          : "bg-violet-500/10 border-violet-500/30 text-violet-400"
      }`}>
        {votingTier === 'founding' ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
        {votingTier === 'founding' ? "3x Power" : "1x Power"}
      </div>
    );
  };

  return (
    <>
      <div
        className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-violet-500/20 transition-all cursor-pointer h-full flex flex-col group overflow-hidden"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="font-consciousness text-base font-bold text-white leading-snug group-hover:text-violet-300 transition-colors">
            {title}
          </h3>
          <Badge variant="outline" className={`${statusInfo.className} text-[10px] uppercase tracking-widest border-none px-2 py-1 h-auto`}>
            {statusInfo.label}
          </Badge>
        </div>

        <div className="flex-1 mb-6">
          {description && (
            <p className="font-body text-sm text-white/50 leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-consciousness text-2xl font-bold text-violet-400">
              {netVotes >= 0 ? '+' : ''}{netVotes}
            </p>
            <p className="font-body text-[10px] uppercase tracking-widest text-white/40">Net Votes</p>
          </div>
          <div className="flex-1 min-w-0">
            <VotingButtons />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
          <VoteWeightBadge />
          {!isCompleted && timeRemaining && (
            <span className={`font-body text-[10px] uppercase tracking-widest ${timeRemaining.urgent ? 'text-amber-400' : 'text-white/40'}`}>
              {formatTimeRemaining()}
            </span>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-xl font-consciousness leading-tight pr-8">
                {title}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={`${statusInfo.className} text-xs`}>
                {statusInfo.label}
              </Badge>
              {!isCompleted && timeRemaining && (
                <div className={`flex items-center gap-1 text-xs ${
                  timeRemaining.expired
                    ? 'text-white/50'
                    : timeRemaining.urgent
                      ? 'text-amber-400'
                      : 'text-white/50'
                }`}>
                  {timeRemaining.urgent && !timeRemaining.expired ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span className="font-medium">{formatTimeRemaining()}</span>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Full Description */}
            {description && (
              <DialogDescription className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {description}
              </DialogDescription>
            )}

            {/* Vote Progress */}
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-white/8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Current Support</span>
                <span className="font-medium">
                  <span className="text-emerald-400">+{yesVotes} yes</span>
                  <span className="text-white/50 mx-2">|</span>
                  <span className="text-red-400">-{noVotes} no</span>
                </span>
              </div>
              <Progress value={sentimentPercentage} className="h-2" />
              <div className="flex items-center justify-center">
                <span className={`text-lg font-bold ${netVotes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Net: {netVotes >= 0 ? '+' : ''}{netVotes}
                </span>
              </div>
            </div>

            {/* Vote Weight Badge & User Vote Status */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <VoteWeightBadge />
              {userVoteType && (
                <span className="text-sm text-white/50">
                  Your vote: <span className={userVoteType === 'yes' ? 'text-emerald-400' : 'text-red-400'}>
                    {userVoteType === 'yes' ? 'Yes (Support)' : 'No (Oppose)'}
                  </span>
                </span>
              )}
            </div>

            {/* Voting Buttons */}
            <div className="pt-2 flex justify-center w-full">
              <div className="w-full max-w-[280px]">
                <VotingButtons />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
