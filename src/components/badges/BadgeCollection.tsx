import { useBadges } from "@/hooks/useBadges";
import { BadgeDisplay } from "./BadgeDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Loader2 } from "lucide-react";

interface BadgeCollectionProps {
  compact?: boolean;
  showLocked?: boolean;
}

export const BadgeCollection = ({ compact = false, showLocked = true }: BadgeCollectionProps) => {
  const { loading, getAllBadgesWithStatus, getBadgeCount } = useBadges();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const allBadges = getAllBadgesWithStatus();
  const earnedCount = getBadgeCount();
  const totalCount = allBadges.length;

  // Filter badges if not showing locked
  const displayBadges = showLocked ? allBadges : allBadges.filter(b => b.earned);

  if (compact) {
    // Compact view - just show earned badges in a row
    const earnedBadges = allBadges.filter(b => b.earned);
    
    if (earnedBadges.length === 0) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Award className="w-4 h-4" />
          <span>No badges earned yet</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {earnedBadges.slice(0, 5).map((badge) => (
          <BadgeDisplay
            key={badge.type}
            badgeType={badge.type}
            size="sm"
            earned={true}
            earnedAt={badge.earnedAt}
          />
        ))}
        {earnedBadges.length > 5 && (
          <Badge variant="outline" className="text-xs">
            +{earnedBadges.length - 5} more
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-consciousness text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-400" />
          Badge Collection
        </h3>
        <div className="font-body text-[10px] uppercase tracking-widest text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          {earnedCount} / {totalCount} Earned
        </div>
      </div>

      {displayBadges.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
          <p className="font-body text-sm text-white/30">
            Complete courses and quizzes to earn badges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {displayBadges.map((badge) => (
            <div
              key={badge.type}
              className={`flex flex-col items-center gap-2 p-4 bg-white/3 border border-white/8 rounded-2xl transition-all ${
                badge.earned
                  ? 'hover:border-violet-500/30'
                  : 'opacity-40 hover:opacity-60'
              }`}
            >
              <BadgeDisplay
                badgeType={badge.type}
                size="md"
                earned={badge.earned}
                earnedAt={badge.earnedAt}
              />
              <div className="space-y-1">
                <p className={badge.earned
                  ? "font-consciousness text-xs font-bold text-white text-center"
                  : "font-body text-xs text-white/40 text-center"
                }>
                  {badge.name}
                </p>
                {badge.earned && badge.earnedAt && (
                  <p className="font-body text-[10px] text-white/30 text-center">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
