import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { getLevelTier, getTierColors } from '../../utils/gamification.utils';
import AuthenticatedImage from '../ui/AuthenticatedImage';

interface LevelFrameAvatarProps {
  level: number;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function LevelFrameAvatar({
  level,
  imageUrl,
  size = 'lg',
  showLabel = true,
}: LevelFrameAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when image URL changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const tier = getLevelTier(level);
  const colors = getTierColors(tier);

  const sizeClasses = {
    sm: { container: 'w-16 h-16', avatar: 'w-14 h-14', frame: 'inset-[-1px]', dot: 'w-1.5 h-1.5', badge: 'text-xs px-1.5 py-0.5' },
    md: { container: 'w-20 h-20', avatar: 'w-[72px] h-[72px]', frame: 'inset-[-2px]', dot: 'w-2 h-2', badge: 'text-xs px-2 py-0.5' },
    lg: { container: 'w-24 h-24', avatar: 'w-[88px] h-[88px]', frame: 'inset-[-3px]', dot: 'w-2.5 h-2.5', badge: 'text-xs px-2.5 py-1' },
  };

  const s = sizeClasses[size];


  return (
    <div className="relative inline-block group">
      <div className={`relative ${s.container} flex items-center justify-center`}>
        {/* Main Glow - Subtle ambient glow behind everything */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundColor: colors.glow }}
        />

        {/* Avatar Container */}
        <div
          className={`${s.avatar} rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden relative z-30 border-2 border-white/10 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/20`}
        >
          {imageUrl && !imageError ? (
            <AuthenticatedImage
              src={imageUrl}
              alt="Avatar"
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-110"
              fallback={<UserRound className="w-1/2 h-1/2 text-neutral-400" />}
              onError={() => setImageError(true)}
            />
          ) : (
            <UserRound className="w-1/2 h-1/2 text-neutral-400" />
          )}

          {/* Subtle Inner Shadow for Depth */}
          <div className="absolute inset-0 shadow-inner pointer-events-none" />
        </div>

        {/* Outer Pulsing Ring - Enhanced */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0 opacity-20"
          style={{
            width: 'calc(100% + 12px)',
            height: 'calc(100% + 12px)',
            border: `1px solid ${colors.primary}`,
            animation: 'ringPulse 3s ease-in-out infinite',
          }}
        />

        {/* Premium Animated Ring */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10 overflow-hidden"
          style={{
            width: 'calc(100% + 6px)',
            height: 'calc(100% + 6px)',
            padding: '1.5px',
            background: `conic-gradient(from 0deg, transparent, ${colors.primary}, ${colors.secondary}, ${colors.primary}, transparent)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            animation: 'ringRotate 3s linear infinite',
          }}
        />

        {/* Static Base Ring - Always visible/polished */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-20 border-[0.5px] border-white/10 opacity-30"
          style={{
            width: 'calc(100% + 6px)',
            height: 'calc(100% + 6px)',
          }}
        />

        {/* Level Badge - Refined Typography */}
        {showLabel && (
          <div
            className={`absolute bottom-[-1px] left-1/2 -translate-x-1/2 z-50 px-2 py-0.5 rounded-full border border-white/20 shadow-lg flex items-center gap-0.5 overflow-hidden group-hover:scale-110 transition-transform duration-300`}
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="text-xs font-bold text-zinc-950/40 uppercase ">LV.</span>
            <span className="text-xs font-bold text-zinc-950 leading-none tabular-nums">{level}</span>

            {/* Glossy overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 -skew-x-12 animate-gloss" />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1.0); opacity: 0.1; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
        @keyframes gloss {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50%, 100% { transform: translateX(200%) skewX(-20deg); }
        }
        .animate-gloss {
          animation: gloss 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
