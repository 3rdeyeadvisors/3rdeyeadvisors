import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { usePointsContext } from './PointsProvider';

interface PointsBadgeProps {
  showRank?: boolean;
}

export const PointsBadge = ({ showRank = false }: PointsBadgeProps) => {
  const { totalPoints, rank, loading } = usePointsContext();

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <Star className="w-3 h-3 mr-1" />
        ...
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 cursor-pointer"
    >
      <Star className="w-3 h-3 mr-1" />
      {totalPoints.toLocaleString()}
      {showRank && rank && rank.rank > 0 && (
        <span className="ml-1 text-white/50">#{rank.rank}</span>
      )}
    </Badge>
  );
};
