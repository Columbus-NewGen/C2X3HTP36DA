/**
 * Gamification API Service
 */
import axiosClient from "./AxiosClient";
import type { GamificationProfile, BadgesResponse } from "../types/gamification.types";

export const gamificationApi = {
    /**
     * Get full gamification profile (XP, level, streaks, badges, etc.)
     */
    async getProfile(): Promise<GamificationProfile> {
        const res = await axiosClient.get<GamificationProfile>("/api/v1/users/me/gamification");
        return res.data;
    },

    /**
     * Get all badges with earned status
     */
    async getAllBadges(): Promise<BadgesResponse> {
        const res = await axiosClient.get<BadgesResponse>("/api/v1/users/me/gamification/badges");
        return res.data;
    }
};
