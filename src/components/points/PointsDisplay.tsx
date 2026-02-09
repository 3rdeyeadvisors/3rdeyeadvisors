import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Calendar, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { usePointsContext } from './PointsProvider';
import { useState } from 'react';
import { PointsLeaderboard } from './PointsLeaderboard';
import { PointsHistory } from './PointsHistory';

interface PointsDisplayProps {
  compact?: boolean;
}

export const PointsDisplay = ({ compact = false }: PointsDisplayProps) => {
  const { totalPoints, rank, todayPoints, daysRemaining, loading } = usePointsContext();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (loading) {
    return (
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 animate-pulse">
        <div className="h-24 bg-muted rounded" />
      </Card>
    );
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-accent" />
        <span className="font-semibold">{totalPoints.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">pts</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Monthly Points</h3>
            <p className="text-xs text-muted-foreground">{currentMonth}</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {totalPoints.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-2xl sm:text-3xl font-bold text-accent">
                #{rank?.rank || '-'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              of {rank?.total_users ? rank.total_users.toLocaleString() : '...'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-2xl sm:text-3xl font-bold">
                {daysRemaining}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Days Left</div>
          </div>
        </div>

        {/* Today's Points Badge */}
        {todayPoints > 0 && (
          <div className="flex items-center justify-center mb-4">
            <Badge variant="secondary" className="text-sm">
              <Star className="w-3 h-3 mr-1" />
              +{todayPoints} points today
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="flex-1"
          >
            {showLeaderboard ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            View Leaderboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1"
          >
            {showHistory ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            Points History
          </Button>
        </div>
      </Card>

      {/* Expandable Leaderboard */}
      {showLeaderboard && (
        <PointsLeaderboard />
      )}

      {/* Expandable History */}
      {showHistory && (
        <PointsHistory />
      )}
    </div>
  );
};
