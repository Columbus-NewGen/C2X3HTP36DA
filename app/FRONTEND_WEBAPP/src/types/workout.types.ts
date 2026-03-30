/* ---------- Enums ---------- */
export type ScheduledWorkoutStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "MISSED"
  | "SKIPPED";

/* ---------- Calendar ---------- */
export interface CalendarWorkoutDay {
  date: string; // YYYY-MM-DD
  workouts: ScheduledWorkout[];
}

/* ---------- Scheduled Workout ---------- */
export interface ScheduledWorkout {
  id: number;
  user_program_id: number;
  scheduled_date: string;
  week_number: number;
  status: ScheduledWorkoutStatus;
  completed_at?: string;
  notes?: string;
  session: WorkoutSession;
  workout_log?: WorkoutLog;
  created_at: string;
  updated_at: string;
}

/* ---------- Session ---------- */
export interface WorkoutSession {
  id: number;
  session_name: string;
  workout_split: string;
  day_number: number;
  notes?: string;
  exercises: WorkoutSessionExercise[];
}

export interface WorkoutSessionExercise {
  id: number;
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_seconds?: number;
  order_sequence: number;
  image_url?: string | null;
  image_full_url?: string | null;
  equipment?: {
    id: number;
    equipment_name: string;
    description?: string;
    image_url?: string | null;
    image_full_url?: string;
    equipment_instances?: {
      id: number;
      floorplan_id: number;
      label: string;
      status: string;
    }[];
  }[];
}

/* ---------- Workout Log ---------- */
export interface WorkoutLog {
  id: number;
  user_id: number;
  scheduled_workout_id?: number;
  workout_date: string;
  duration_minutes: number;
  notes?: string;
  session?: WorkoutSession;
  exercises: WorkoutLogExercise[];
  completeness?: {
    total_prescribed: number;
    completed_slots: number;
    extra_exercises: number;
  };
  created_at: string;
  updated_at: string;
}

export interface WorkoutLogExercise {
  id?: number;
  exercise_id: number;
  exercise_name?: string;
  sets_completed: number;
  reps_completed: number;
  weight_used?: number;
  rpe_rating?: number;
  notes?: string;
  image_url?: string | null;
  scheduled_workout_exercise_id?: number;
}

/* ---------- Requests ---------- */
export interface UpdateWorkoutStatusRequest {
  status: ScheduledWorkoutStatus;
  notes?: string;
}

export interface LogWorkoutRequest {
  scheduled_workout_id?: number;
  session_id?: number;
  workout_date: string;
  duration_minutes: number;
  notes?: string;
  exercises: WorkoutLogExercise[];
}

export interface AddExerciseToLogRequest {
  exercise_id: number;
  scheduled_workout_exercise_id?: number; // optional เพราะ manual log อาจไม่มี
  sets_completed: number;
  reps_completed: number;
  weight_used?: number;
  rpe_rating?: number;
  notes?: string;
}

export interface UpdateExerciseInLogRequest {
  exercise_id?: number;
  scheduled_workout_exercise_id?: number;
  sets_completed?: number;
  reps_completed?: number;
  weight_used?: number;
  rpe_rating?: number;
  notes?: string;
}

export interface WorkoutLogExerciseResponse {
  message: string;
  exercise: WorkoutLogExercise;
}

/* ---------- Scheduled Workout Exercise Update ---------- */
export interface UpdateScheduledExerciseRequest {
  exercise_id?: number;
  sets?: number;
  reps?: number;
  weight?: number;
  rest_seconds?: number;
  order_sequence?: number;
}

export interface UpdateScheduledExerciseResponse {
  message: string;
  exercise: {
    id: number;
    exercise_id: number;
    exercise_name: string;
    sets: number;
    reps: number;
    weight: number;
    rest_seconds: number;
    order_sequence: number;
  };
}
