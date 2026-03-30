import { motion } from 'framer-motion';
import {
  Shield, Diamond, Crown
} from 'lucide-react';
import { getTierColors, getDefaultBadgeTier, getBadgeIcon } from '../../utils/gamification.utils';
import type { Badge } from '../../types/gamification.types';

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  isNew?: boolean;
  onClick?: () => void;
  variant?: 'full' | 'compact';
}



export default function BadgeCard({ badge, isUnlocked, isNew, onClick, variant = 'full' }: BadgeCardProps) {
  const tier = badge.tier || getDefaultBadgeTier(badge.name);
  const colors = getTierColors(tier);
  const BadgeIcon = getBadgeIcon(badge.name) as any;

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={isUnlocked ? { scale: 1.1, y: -2 } : {}}
        onClick={onClick}
        className={`relative group cursor-pointer transition-all duration-300 ${isUnlocked ? '' : 'grayscale opacity-40'}`}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg border border-white/20"
          style={{
            background: isUnlocked
              ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
              : '#cbd5e1',
            boxShadow: isUnlocked ? `0 4px 12px ${colors.glow}` : 'none',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          <div className="relative z-10">
            {badge.icon_url ? (
              <img src={badge.icon_url} alt={badge.name} className="w-6 h-6 object-contain" />
            ) : (
              <BadgeIcon className={`w-5 h-5 ${isUnlocked ? 'text-white' : 'text-neutral-500'}`} strokeWidth={2.5} />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Determine what icon/decorator to show based on tier
  const TierDecorator = () => {
    if (!isUnlocked) return null;

    switch (tier) {
      case 'rare':
        return <Shield className="absolute -top-1 -right-1 w-4 h-4 text-blue-400 opacity-60" />;
      case 'epic':
        return <Diamond className="absolute -top-1.5 -right-1.5 w-5 h-5 text-purple-400 opacity-80" />;
      case 'legend':
        return <Crown className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isUnlocked ? {
        y: -8,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      } : {}}
      onClick={onClick}
      className={`relative group p-4 rounded-3xl flex flex-col items-center gap-3 cursor-pointer transition-all duration-500 ${isUnlocked
        ? 'bg-white border-white/50 shadow-xl'
        : 'bg-neutral-50/50 border-neutral-100 opacity-60 grayscale'
        } border`}
      style={{
        boxShadow: isUnlocked ? `0 12px 40px -12px ${colors.glow}` : 'none',
      }}
    >
      {/* Background Ambient Glow */}
      {isUnlocked && (
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl pointer-events-none"
          style={{ background: colors.primary }}
        />
      )}

      {/* NEW Tag */}
      {isNew && isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 z-50 bg-gradient-to-r from-lime-500 to-lime-600 text-zinc-950 text-xs font-bold uppercase  px-2 py-0.5 rounded-full shadow-lg border border-white/20"
        >
          NEW
        </motion.div>
      )}

      {/* Badge Visual Core */}
      <div className="relative">
        <div
          className="relative w-20 h-20 flex items-center justify-center"
          style={{ filter: isUnlocked ? `drop-shadow(0 0 12px ${colors.glow})` : 'none' }}
        >
          {/* Layered Animations for higher tiers */}
          {isUnlocked && (
            <>
              {tier === 'legend' && (
                <>
                  <div className="absolute inset-[-8px] rounded-full border border-amber-400/20 animate-[spin_8s_linear_infinite]" />
                  <div className="absolute inset-[-4px] rounded-full border-2 border-amber-500/10 animate-[spin_4s_linear_infinite_reverse]" />
                </>
              )}
              {tier === 'epic' && (
                <div className="absolute inset-[-6px] rounded-full border border-purple-500/20 animate-pulse" />
              )}
            </>
          )}

          {/* Badge Frame / Background */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-500 ${isUnlocked ? 'group-hover:rotate-12 group-hover:scale-110' : ''
              }`}
            style={{
              background: isUnlocked
                ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                : '#cbd5e1',
              clipPath: tier === 'rare'
                ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' // Hexagon
                : tier === 'epic'
                  ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' // Diamond
                  : tier === 'legend'
                    ? 'circle(50% at 50% 50%)' // Circle
                    : 'inset(0% rounded 16px)', // Rounded Square
            }}
          >
            {/* Gloss / Lighting */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 -skew-y-12" />

            {/* Icon */}
            <div className="relative z-10 drop-shadow-lg">
              {badge.icon_url ? (
                <img src={badge.icon_url} alt={badge.name} className="w-9 h-9 object-contain" />
              ) : (
                <BadgeIcon className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-neutral-500'}`} strokeWidth={2.5} />
              )}
            </div>

            {/* Rare/Epic/Legend sparkles */}
            {isUnlocked && (tier === 'legend' || tier === 'epic') && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute bg-white/40 w-full h-[200%] top-[-50%] left-[-150%] rotate-[35deg] animate-[shimmer_3s_infinite]" />
              </div>
            )}
          </div>

          <TierDecorator />
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center space-y-1 z-10">
        <h3
          className={`text-xs font-bold uppercase  leading-none ${isUnlocked ? 'text-neutral-900' : 'text-neutral-400'
            }`}
        >
          {badge.display_name || badge.name}
        </h3>
        {badge.description && (
          <p className="text-xs text-neutral-500 font-medium leading-tight line-clamp-2 px-1">
            {badge.description}
          </p>
        )}
      </div>

      {/* Tier Label */}
      {isUnlocked && (
        <div
          className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold  uppercase border border-white/50"
          style={{
            background: colors.glow,
            color: colors.secondary
          }}
        >
          {tier}
        </div>
      )}

      {/* Progress placeholder if locked - can be added if backend supports */}
      {!isUnlocked && (
        <div className="mt-2 w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-neutral-400 opacity-30" />
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(35deg); }
          50%, 100% { transform: translateX(250%) rotate(35deg); }
        }
      `}} />
    </motion.div>
  );
}
