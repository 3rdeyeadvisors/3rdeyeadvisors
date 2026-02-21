import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProgress } from './ProgressProvider';

interface ProgressBarProps {
  courseId: number;
  showBadge?: boolean;
  className?: string;
}

export const ProgressBar = ({ courseId, showBadge = true, className }: ProgressBarProps) => {
  const { getCourseProgress, getCompletionBadge } = useProgress();
  const progress = getCourseProgress(courseId);
  const badge = getCompletionBadge(courseId);

  if (!progress) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/50">Not started</span>
          {showBadge && badge && (
            <Badge variant="outline" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <Progress value={0} className="h-2" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/50 font-medium">
          {progress.completion_percentage > 0
            ? `${progress.completion_percentage.toFixed(0)}% complete`
            : "In Progress"}
        </span>
        {showBadge && badge && (
          <Badge 
            variant={progress.completion_percentage === 100 ? "default" : "outline"} 
            className="text-xs"
          >
            {badge}
          </Badge>
        )}
      </div>
      <Progress value={progress.completion_percentage} className="h-2" />
    </div>
  );
};