/**
 * Muscle API Service
 * - getAllMuscles(): List all muscles in system
 * - getExercisesByMuscle(id): Find exercises targeting a muscle
 * - getAllGroups(): Get muscle groups (Chest, Legs, etc.)
 * - getMusclesByGroup(id): List muscles within a specific group
 */
// src/services/MuscleAPI.ts

import axiosClient from "./AxiosClient";
import type {
    MusclesResponse,
    MuscleGroupsResponse,
    MuscleExercisesResponse,
} from "../types/muscles.types";

export const muscleApi = {
    async getAllMuscles(): Promise<MusclesResponse> {
        const res = await axiosClient.get<MusclesResponse>("/api/v1/muscles");
        return res.data;
    },

    async getExercisesByMuscle(
        muscleId: number,
    ): Promise<MuscleExercisesResponse> {
        const res = await axiosClient.get<MuscleExercisesResponse>(
            `/api/v1/muscles/${muscleId}/exercises`,
        );
        return res.data;
    },

    async getAllGroups(): Promise<MuscleGroupsResponse> {
        const res = await axiosClient.get<MuscleGroupsResponse>(
            "/api/v1/muscles/groups",
        );
        return res.data;
    },

    async getMusclesByGroup(groupId: number): Promise<MusclesResponse> {
        const res = await axiosClient.get<MusclesResponse>(
            `/api/v1/muscles/groups/${groupId}/muscles`,
        );
        return res.data;
    },
};