export type LeaderboardType = "CONSISTENCY" | "VOLUME" | "PROGRAMS";
export type LeaderboardPeriod = "GLOBAL" | "MONTHLY" | "WEEKLY";

export interface LeaderboardUser {
  id: number;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  change: number;
  streak?: number;
}

export interface LeaderboardData {
  users: LeaderboardUser[];
  currentUserId: number;
}
