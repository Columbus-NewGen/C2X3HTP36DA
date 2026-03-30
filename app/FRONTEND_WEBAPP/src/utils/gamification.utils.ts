import {
  Trophy, Star, Zap, Sunrise, Flame, Target,
  Sword, ShieldCheck, Rocket, Crown, CalendarDays,
  BicepsFlexed, Mountain, Medal, PartyPopper, Footprints
} from 'lucide-react';
import type { LevelTier, BadgeTier, StreakPetConfig } from '../types/gamification.types';

/**
 * Get level tier based on current level
 */
export function getLevelTier(level: number): LevelTier {
  if (level <= 1) return 'bronze';
  if (level <= 5) return 'silver';
  if (level <= 10) return 'platinum';
  return 'lime';
}

/**
 * Get tier display name
 */
export function getTierName(tier: LevelTier): string {
  const names: Record<LevelTier, string> = {
    bronze: 'Bronze',
    silver: 'Silver',
    platinum: 'Platinum',
    lime: 'Lime Elite',
  };
  return names[tier];
}

/**
 * Get tier colors
 */
export function getTierColors(tier: LevelTier | BadgeTier) {
  const colors = {
    bronze: {
      primary: '#D97706',
      secondary: '#92400E',
      glow: 'rgba(217, 119, 6, 0.25)',
      gradient: 'from-amber-600 to-amber-900',
    },
    silver: {
      primary: '#94A3B8',
      secondary: '#475569',
      glow: 'rgba(148, 163, 184, 0.25)',
      gradient: 'from-slate-400 to-slate-600',
    },
    platinum: {
      primary: '#CBD5E1',
      secondary: '#475569',
      glow: 'rgba(203, 213, 225, 0.5)',
      gradient: 'from-slate-300 via-white to-slate-400',
    },
    lime: {
      primary: '#84CC16',
      secondary: '#4D7C0F',
      glow: 'rgba(132, 204, 22, 0.4)',
      gradient: 'from-lime-500 to-lime-700',
    },
    common: {
      primary: '#10B981',
      secondary: '#065F46',
      glow: 'rgba(16, 185, 129, 0.2)',
      gradient: 'from-emerald-500 to-emerald-800',
    },
    rare: {
      primary: '#3B82F6',
      secondary: '#1E3A8A',
      glow: 'rgba(59, 130, 246, 0.25)',
      gradient: 'from-blue-500 to-blue-800',
    },
    epic: {
      primary: '#A855F7',
      secondary: '#581C87',
      glow: 'rgba(168, 85, 247, 0.3)',
      gradient: 'from-purple-500 to-purple-800',
    },
    legend: {
      primary: '#F59E0B',
      secondary: '#78350F',
      glow: 'rgba(245, 158, 11, 0.4)',
      gradient: 'from-orange-500 via-yellow-500 to-orange-700',
    },
  };
  return colors[tier];
}

/**
 * Get streak pet configuration based on days
 */
export function getStreakPetConfig(days: number): StreakPetConfig {
  if (days >= 365) {
    return {
      days: 365,
      stage: 'eternal',
      stageLabel: 'ETERNAL',
      description: 'ไฟนิรันดร์',
      color: '#FFD700',
      glow: 'rgba(255, 215, 0, 0.6)',
      hasRing: true,
      isGold: true,
      features: {
        band: false,
        scar: true,
        spikes: true,
        muscles: true,
        flames: true,
        crown: true,
        sparkles: true,
      },
    };
  }
  if (days >= 200) {
    return {
      days: 200,
      stage: 'inferno',
      stageLabel: 'INFERNO',
      description: 'ควบคุมไม่ได้แล้ว',
      color: '#64b5f6',
      glow: 'rgba(100, 181, 246, 0.45)',
      hasRing: true,
      isGold: false,
      features: {
        band: false,
        scar: true,
        spikes: true,
        muscles: true,
        flames: true,
        crown: false,
        sparkles: true,
      },
    };
  }
  if (days >= 100) {
    return {
      days: 100,
      stage: 'blazing',
      stageLabel: 'BLAZING',
      description: 'ลุกท่วม',
      color: '#ce93d8',
      glow: 'rgba(206, 147, 216, 0.42)',
      hasRing: true,
      isGold: false,
      features: {
        band: true,
        scar: true,
        spikes: true,
        muscles: true,
        flames: true,
        crown: false,
        sparkles: false,
      },
    };
  }
  if (days >= 60) {
    return {
      days: 60,
      stage: 'fire',
      stageLabel: 'ON FIRE',
      description: 'ไฟลุกแล้ว',
      color: '#f44336',
      glow: 'rgba(244, 67, 54, 0.4)',
      hasRing: true,
      isGold: false,
      features: {
        band: true,
        scar: true,
        spikes: false,
        muscles: false,
        flames: true,
        crown: false,
        sparkles: false,
      },
    };
  }
  if (days >= 30) {
    return {
      days: 30,
      stage: 'warming',
      stageLabel: 'WARMING UP',
      description: 'ไฟเริ่มติด',
      color: '#FF9800',
      glow: 'rgba(255, 152, 0, 0.38)',
      hasRing: true,
      isGold: false,
      features: {
        band: true,
        scar: false,
        spikes: false,
        muscles: false,
        flames: false,
        crown: false,
        sparkles: false,
      },
    };
  }
  return {
    days: 7,
    stage: 'starter',
    stageLabel: 'STARTER',
    description: 'เพิ่งจุดไฟ',
    color: '#9e9e9e',
    glow: 'rgba(158, 158, 158, 0.3)',
    hasRing: false,
    isGold: false,
    features: {
      band: false,
      scar: false,
      spikes: false,
      muscles: false,
      flames: false,
      crown: false,
      sparkles: false,
    },
  };
}

/**
 * Calculate XP for level
 */
export function getXPForLevel(level: number): number {
  const xpTable = [
    0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
  ];
  return xpTable[level - 1] || level * 1000;
}

/**
 * Get default badge tier based on badge name
 * Used when API doesn't provide tier information
 */
export function getDefaultBadgeTier(badgeName: string): BadgeTier {
  const tierMap: Record<string, BadgeTier> = {
    // Common badges (starter achievements)
    first_workout: 'common',
    first_week: 'common',
    early_bird: 'common',

    // Rare badges (consistent effort)
    streak_7: 'rare',
    streak_30: 'rare',
    volume_milestone: 'rare',

    // Epic badges (major achievements)
    program_complete: 'epic',
    streak_60: 'epic',
    streak_100: 'epic',

    // Legend badges (ultimate achievements)
    streak_365: 'legend',
    level_20: 'legend',
    master_trainer: 'legend',
  };

  return tierMap[badgeName] || 'common';
}

export const getBadgeIcon = (badgeName: string) => {
  const label = badgeName.toLowerCase();

  // 1. ความต่อเนื่องและรางวัลสูงสุด (Streaks & High Honors)
  if (label.includes('streak') || label.includes('discipline')) {
    if (label.includes('365')) return Crown;
    if (label.includes('100')) return Trophy;
    return Flame;
  }

  // 2. ความแข็งแกร่งและพลัง (Strength & Power)
  if (label.includes('volume') || label.includes('weight') || label.includes('power')) return BicepsFlexed;
  if (label.includes('zap') || label.includes('fast')) return Zap;

  // 3. การเริ่มต้นและก้าวแรก (Beginnings)
  if (label.includes('first_step') || label.includes('first_workout')) return Rocket;
  if (label.includes('early') || label.includes('bird')) return Sunrise;

  // 4. การเติบโตและการต่อสู้ (Growth & Combat)
  if (label.includes('week') || label.includes('warrior')) return Sword;
  if (label.includes('level') || label.includes('athlete')) return Mountain; // หรือ TrendingUp
  if (label.includes('rising') || label.includes('star')) return Star;

  // 5. ความแม่นยำและการจบหลักสูตร (Mastery & Graduation)
  if (label.includes('master') || label.includes('trainer')) return Target;
  if (label.includes('program') || label.includes('graduate')) return PartyPopper; // ดูฉลองมากกว่า ShieldCheck
  if (label.includes('pro')) return ShieldCheck;

  // 6. การออกกำลังกายทั่วไป (General Cardio/Workout)
  if (label.includes('cardio') || label.includes('run')) return Footprints;
  if (label.includes('workout')) return CalendarDays;

  // ค่าเริ่มต้นกรณีไม่ตรงกับอะไรเลย
  return Medal;
};
