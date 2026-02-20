interface CourseProgressBarProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const CourseProgressBar = ({ completed, total, showLabel = true, size = 'md' }: CourseProgressBarProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage === 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="font-body text-xs uppercase tracking-widest text-white/40">
            Progress
          </span>
          <span className={`font-consciousness text-sm font-bold ${isComplete ? 'text-emerald-400' : 'text-white/60'}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full ${size === 'sm' ? 'h-1' : 'h-2'} bg-white/8 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-violet-600 to-violet-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="font-body text-xs text-white/30 mt-1">
          {completed} of {total} modules complete
        </p>
      )}
    </div>
  );
};

export default CourseProgressBar;
