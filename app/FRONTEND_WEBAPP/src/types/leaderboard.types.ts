/**
 * Leaderboard Types
 */

export type LeaderboardDimension = "volume" | "program" | "streak";
export type LeaderboardPeriod = "week" | "month" | "alltime";

export interface LeaderboardEntry {
    rank: number;
    user_id: number;
    user_name: string;
    avatar_url: string | null;
    value: number;
    value_label: string;
}

export interface LeaderboardResponse {
    type: LeaderboardDimension;
    period: LeaderboardPeriod;
    entries: LeaderboardEntry[];
}
