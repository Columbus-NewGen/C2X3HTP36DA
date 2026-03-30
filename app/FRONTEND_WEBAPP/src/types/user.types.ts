// src/types/user.types.ts

import type { Role } from "./common.types";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export type TrainerSummary = {
    id: number;
    name: string;
    role: Role;
};

export type User = {
    id: number;
    email: string;
    name: string;
    role: Role;
    status?: UserStatus;

    image_url: string | null;
    image_full_url: string | null;

    trainer?: TrainerSummary | null;

    date_of_birth?: string | null;
    gender?: string | null;
    height_cm?: number | null;
    fitness_level?: string | null;
    fitness_goal?: string | null;
    phone?: string | null;
    bio?: string | null;
    created_at?: string;
    level?: number;
    xp?: number;
};

export type GetUsersResponse = {
    users: User[];
    total: number;
    page: number;
    page_size: number;
};

export type UserResponse = {
    message: string;
    user: User;
};

export type UpdateUserProfilePayload = {
    date_of_birth?: string;
    gender?: string;
    height_cm?: number;
    fitness_level?: string;
    fitness_goal?: string;
    phone?: string;
    bio?: string;
};

export type WeightEntry = {
    id: number;
    weight_kg: number;
    recorded_at: string;
    note?: string | null;
    created_at: string;
};

export type WeightHistoryResponse = {
    entries: WeightEntry[];
    total: number;
};

export type CreateWeightPayload = {
    weight_kg: number;
    recorded_at: string;
    note?: string;
};

export interface UserProgressResponse {
    user_id: number;
    user_name: string;
    current_program: {
        id: number;
        name: string;
        start_date: string;
        duration_weeks: number;
        completion_rate: number;
    } | null;
    workout_stats: {
        total_workouts_scheduled: number;
        workouts_completed: number;
        workouts_missed: number;
        workouts_skipped: number;
        completion_rate: number;
        current_streak: number;
    };
    muscle_progress: {
        muscle_name: string;
        body_region: string;
        total_sets: number;
        weighted_sets: number;
        total_reps: number;
        total_volume: number;
        average_weight: number;
        workouts_targeted: number;
        last_trained: string | null;
        intensity_score: number;
    }[];
    exercise_prs: {
        exercise_name: string;
        max_weight: number;
        max_reps: number;
        max_volume: number;
        achieved_at: string;
    }[];
    recent_workouts: {
        workout_log_id: number;
        workout_date: string;
        program_session_name: string;
        exercise_count: number;
        total_sets: number;
        total_volume: number;
        duration: number;
    }[];
}

export interface UserProgressTrendsResponse {
    type: "muscle" | "exercise";
    items: {
        name: string;
        frequency: number;
        last_trained: string;
    }[];
}