// Gamification Types - Extended

export type BadgeTier = 'common' | 'rare' | 'epic' | 'legend';
export type LevelTier = 'bronze' | 'silver' | 'platinum' | 'lime';
export type StreakStage = 'starter' | 'warming' | 'fire' | 'blazing' | 'inferno' | 'eternal';

export interface Badge {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  icon_url?: string | null;
  tier?: BadgeTier;
  earned_at?: string | null;
  unlocked_at?: string;
  is_new?: boolean;
}

export interface GamificationProfile {
  user_id: number;
  current_level: number;
  total_xp: number;
  xp_to_next_level: number;
  next_level_xp: number;
  xp_progress: number;
  current_streak: number;
  longest_streak: number;
  weekly_completed: number;
  weekly_target: number;
  total_workouts: number;
  badges: Badge[];
  level_tier?: LevelTier;
  streak_stage?: StreakStage;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  icon: string;
}

export interface StreakPetConfig {
  days: number;
  stage: StreakStage;
  stageLabel: string;
  description: string;
  color: string;
  glow: string;
  hasRing: boolean;
  isGold: boolean;
  features: {
    band: boolean;
    scar: boolean;
    spikes: boolean;
    muscles: boolean;
    flames: boolean;
    crown: boolean;
    sparkles: boolean;
  };
}

export interface BadgesResponse {
  badges: Badge[];
}
