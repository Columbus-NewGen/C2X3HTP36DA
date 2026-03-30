/**
 * Trainer Types
 * Trainer-trainee relationships and progress tracking
 */

import type { User } from "./auth.types";

export interface Trainee extends User {
  assigned_at?: string;
}

export interface TraineesResponse {
  trainees: Trainee[];
  total: number;
  page: number;
  page_size: number;
}

export interface TrainerActivity {
  trainee_id: number;
  trainee_name: string;
  activity_type: string;
  description: string;
  timestamp: string;
}

export interface TraineeDashboardItem {
  id: number;
  name: string;
  image_url: string | null;
  status: string;
  current_program: string;
  last_workout_date: string;
  workouts_this_week: number;
  upcoming_workouts: number;
}

export interface TrainerDashboard {
  total_trainees: number;
  active_trainees: number;
  suspended_trainees: number;
  recent_activity: TrainerActivity[];
  trainees: TraineeDashboardItem[];
}

export interface CurrentProgram {
  id: number;
  name: string;
  start_date: string;
  duration_weeks: number;
  completion_rate: number;
}

export interface WorkoutStats {
  total_workouts_scheduled: number;
  workouts_completed: number;
  workouts_missed: number;
  workouts_skipped: number;
  completion_rate: number;
  current_streak: number;
}

export interface MuscleProgress {
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
}

export interface ExercisePR {
  exercise_name: string;
  max_weight: number;
  max_reps: number;
  max_volume: number;
  achieved_at: string;
}

export interface RecentWorkout {
  workout_log_id: number;
  workout_date: string;
  program_session_name: string;
  exercise_count: number;
  total_sets: number;
  total_volume: number;
  duration: number;
}

export interface TraineeProgress {
  trainee_id: number;
  trainee_name: string;
  current_program: CurrentProgram | null;
  workout_stats: WorkoutStats;
  muscle_progress: MuscleProgress[];
  exercise_prs: ExercisePR[];
  recent_workouts: RecentWorkout[];
}
