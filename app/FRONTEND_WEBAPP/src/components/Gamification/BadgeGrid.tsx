import { useMemo } from 'react';
import BadgeCard from './BadgeCard';
import type { Badge } from '../../types/gamification.types';

interface BadgeGridProps {
  badges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
  variant?: 'full' | 'compact';
}

export default function BadgeGrid({ badges, onBadgeClick, variant = 'full' }: BadgeGridProps) {
  // Sort: unlocked first, then by tier, then by date
  const sortedBadges = useMemo(() => {
    return [...badges].sort((a, b) => {
      // Check both earned_at and unlocked_at for compatibility
      const aUnlocked = !!(a.earned_at || a.unlocked_at);
      const bUnlocked = !!(b.earned_at || b.unlocked_at);

      if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;

      const tierOrder: Record<string, number> = { legend: 0, epic: 1, rare: 2, common: 3 };
      const aTier = a.tier || 'common';
      const bTier = b.tier || 'common';
      const tierDiff = (tierOrder[aTier] ?? 4) - (tierOrder[bTier] ?? 4);
      if (tierDiff !== 0) return tierDiff;

      const aDate = a.earned_at || a.unlocked_at;
      const bDate = b.earned_at || b.unlocked_at;
      if (aDate && bDate) {
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      }

      return 0;
    });
  }, [badges]);

  if (badges.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-neutral-500 font-bold text-xs uppercase ">No badges earned yet 🏅</div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {sortedBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            isUnlocked={!!(badge.earned_at || badge.unlocked_at)}
            isNew={badge.is_new}
            onClick={() => onBadgeClick?.(badge)}
            variant="compact"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {sortedBadges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          isUnlocked={!!(badge.earned_at || badge.unlocked_at)}
          isNew={badge.is_new}
          onClick={() => onBadgeClick?.(badge)}
          variant="full"
        />
      ))}
    </div>
  );
}
