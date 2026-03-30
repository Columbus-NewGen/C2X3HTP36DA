/**
 * Trainer Dashboard — component prop types
 */

import type { TraineeDashboardItem, TrainerActivity } from "./trainer.types";

/* ── Avatar ─────────────────────────────────────────────────── */
export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
    src?: string | null;
    name: string;
    size?: AvatarSize;
}

/* ── Exercise Picker Modal ──────────────────────────────────── */
export interface ExercisePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exercise: ExerciseOption) => void;
}

export interface ExerciseOption {
    id: number;
    exercise_name: string;
    image_url?: string | null;
    primary_muscle?: string;
    primary_muscles?: string[];
}

/* ── Exercise Row ───────────────────────────────────────────── */
export interface ExerciseRowExercise {
    id: number;
    exercise_name: string;
    image_url?: string | null;
    sets: number;
    reps: number;
    weight: number;
}

export interface ExerciseRowProps {
    exercise: ExerciseRowExercise;
    onUpdate: (data: { sets: number; reps: number; weight: number }) => void;
    onDelete: () => void;
    onReplace: () => void;
    readOnly?: boolean;
}

/* ── Workout Log Detail Modal ───────────────────────────────── */
export interface WorkoutLogDetailModalProps {
    isOpen: boolean;
    logId: number | null;
    traineeId: number;
    onClose: () => void;
}

/* ── Trainee Modal ──────────────────────────────────────────── */
export interface TraineeModalProps {
    isOpen: boolean;
    trainee: TraineeDashboardItem | null;
    onClose: () => void;
}

/* ── Trainee Card ───────────────────────────────────────────── */
export interface TraineeCardProps {
    trainee: TraineeDashboardItem;
    onClick: () => void;
}

/* ── Activity Feed ──────────────────────────────────────────── */
export interface ActivityFeedProps {
    activities: TrainerActivity[];
}

/* ── Confirm Delete Modal ───────────────────────────────────── */
export interface ConfirmDeleteInfo {
    workoutId: number;
    exerciseId: number;
    name: string;
}

export interface ConfirmDeleteModalProps {
    info: ConfirmDeleteInfo | null;
    isPending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/* ── Picker action state ────────────────────────────────────── */
export interface PickerAction {
    type: "add" | "replace";
    exerciseId?: number;
}
