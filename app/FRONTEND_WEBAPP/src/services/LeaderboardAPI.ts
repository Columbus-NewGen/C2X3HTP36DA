/**
 * Leaderboard API Service
 */
import axiosClient from "./AxiosClient";
import type {
    LeaderboardResponse,
    LeaderboardDimension,
    LeaderboardPeriod
} from "../types/leaderboard.types";

export const leaderboardApi = {
    /**
     * Get ranked list of users
     * @param type - Dimension to rank by (volume, program, streak)
     * @param period - Time period (week, month, alltime)
     * @param limit - Max entries (default 10)
     */
    async getLeaderboard(
        type: LeaderboardDimension = "volume",
        period: LeaderboardPeriod = "week",
        limit: number = 10
    ): Promise<LeaderboardResponse> {
        const params = new URLSearchParams();
        params.append("type", type);
        params.append("period", period);
        params.append("limit", limit.toString());

        const res = await axiosClient.get<LeaderboardResponse>(
            `/api/v1/leaderboard?${params.toString()}`
        );
        return res.data;
    }
};
