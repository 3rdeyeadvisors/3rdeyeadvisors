import { cn } from "@/lib/utils";
import { getBadgeDefinition, BadgeDefinition } from "@/lib/badges";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  badgeType: string;
  size?: 'sm' | 'md' | 'lg';
  earned?: boolean;
  showTooltip?: boolean;
  earnedAt?: string;
  className?: string;
}

export const BadgeDisplay = ({ 
  badgeType, 
  size = 'md', 
  earned = true,
  showTooltip = true,
  earnedAt,
  className 
}: BadgeDisplayProps) => {
  const definition = getBadgeDefinition(badgeType);
  
  if (!definition) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const Icon = definition.icon;

  const badge = (
    <div
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-200',
        sizeClasses[size],
        earned 
          ? `${definition.bgColor} ${definition.color} ring-2 ring-offset-2 ring-offset-background` 
          : 'bg-white/5 text-white/50 opacity-50 grayscale',
        earned && 'hover:scale-110',
        className
      )}
      style={{
        boxShadow: earned ? `0 0 12px ${definition.color.replace('text-', 'hsl(var(--')})` : 'none',
      }}
    >
      <Icon className={iconSizeClasses[size]} />
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="text-center">
            <p className="font-semibold">{definition.name}</p>
            <p className="text-xs text-white/50">{definition.description}</p>
            {earnedAt && earned && (
              <p className="text-xs text-white/50 mt-1">
                Earned: {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
            {!earned && (
              <p className="text-xs text-white/50 mt-1 italic">
                Not yet earned
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
