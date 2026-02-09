import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePoints } from '@/hooks/usePoints';
import { Clock, Star, TrendingUp } from 'lucide-react';
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
      const data = await getPointHistory(20);
      setHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, [getPointHistory]);

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('login')) return '📅';
    if (actionType.includes('course') || actionType.includes('module')) return '📚';
    if (actionType.includes('quiz')) return '✅';
    if (actionType.includes('referral')) return '👥';
    if (actionType.includes('comment') || actionType.includes('discussion')) return '💬';
    if (actionType.includes('profile')) return '👤';
    return '⭐';
  };

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-48 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Points History</h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No points earned yet.</p>
          <p className="text-sm">Complete activities to earn points!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {history.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-muted/50 transition-colors"
            >
              <div className="text-xl">
                {getActionIcon(transaction.action_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {getActionDisplayName(transaction.action_type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                </p>
              </div>
              
              <Badge 
                variant="secondary" 
                className="bg-awareness/20 text-awareness border-awareness/30"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                +{transaction.points}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
