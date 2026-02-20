import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePoints } from '@/hooks/usePoints';
import { Clock, Star, TrendingUp, BookOpen, CheckCircle2, Users, MessageSquare, User, Trophy, Brain, Zap, Map } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PointTransaction {
  id: string;
  points: number;
  action_type: string;
  action_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export const PointsHistory = () => {
  const { getPointHistory, getActionDisplayName } = usePoints();
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await getPointHistory();
      setHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, [getPointHistory]);

  const getActionIcon = (actionType: string) => {
    const props = { className: "w-4 h-4" };
    if (actionType.includes('login')) return <Zap {...props} />;
    if (actionType.includes('course') || actionType.includes('module')) return <BookOpen {...props} />;
    if (actionType.includes('quiz')) return <Brain {...props} />;
    if (actionType.includes('referral')) return <Users {...props} />;
    if (actionType.includes('comment') || actionType.includes('discussion')) return <MessageSquare {...props} />;
    if (actionType.includes('profile')) return <User {...props} />;
    if (actionType.includes('vote') || actionType.includes('roadmap')) return <Map {...props} />;
    if (actionType.includes('game') || actionType.includes('iq')) return <Trophy {...props} />;
    return <Star {...props} />;
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
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-violet-400" />
        <h3 className="font-consciousness text-lg font-bold text-white">Points History</h3>
      </div>

      {history.length === 0 ? (
        <div className="font-body text-sm text-white/30 text-center py-8">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No points earned yet.</p>
          <p className="text-xs">Complete activities to earn points!</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {history.map((transaction) => {
            const isNegative = transaction.points < 0;
            return (
              <div
                key={transaction.id}
                className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                  {getActionIcon(transaction.action_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-white/70 truncate">
                    {getActionDisplayName(transaction.action_type)}
                  </p>
                  <p className="font-body text-xs text-white/30">
                    {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                  </p>
                </div>

                <div className={`font-consciousness text-sm font-bold ${isNegative ? 'text-red-400' : 'text-violet-400'}`}>
                  {isNegative ? '' : '+'}{transaction.points}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
