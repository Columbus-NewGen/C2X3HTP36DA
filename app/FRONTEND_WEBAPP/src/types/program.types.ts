export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type ProgramGoal =
  | "muscle gain"
  | "strength"
  | "general fitness"
  | "weight loss";

/* ---------- Exercises ---------- */
export interface ProgramExercisePayload {
  exercise_id: number;
  sets: number;
  reps: number;
  weight?: number;
  rest_seconds?: number;
  order_sequence: number;
}

/* ---------- Sessions ---------- */
export interface ProgramSessionPayload {
  session_name: string;
  workout_split: string;
  day_of_week?: number;
  day_number: number;
  notes?: string;
  exercises: ProgramExercisePayload[];
}

/* ---------- Create ---------- */
export interface CreateProgramPayload {
  program_name: string;
  goal: ProgramGoal;
  duration_weeks: number;
  is_template: boolean;
  difficulty_level: DifficultyLevel;
  days_per_week: number;
  description?: string;
  sessions: ProgramSessionPayload[];
}

/* ---------- Update ---------- */
export interface UpdateProgramPayload {
  program_name?: string;
  goal?: ProgramGoal;
  duration_weeks?: number;
  difficulty_level?: DifficultyLevel;
  days_per_week?: number;
  description?: string;
  is_template?: boolean;
  sessions?: ProgramSessionPayload[];
}

/* ---------- Query Params ---------- */
export interface GetProgramsParams {
  is_template?: boolean;
  difficulty?: DifficultyLevel;
  user_id?: number | null;
}

/* ---------- Program ---------- */
export interface ProgramListItem {
  id: number;
  program_name: string;
  goal: ProgramGoal;
  duration_weeks: number;
  is_template: boolean;
  difficulty_level: DifficultyLevel;
  days_per_week: number;
  description: string;
  is_active: boolean;
  session_count: number;
  created_at: string;
  updated_at: string;
}

/* ---------- Detail Response (from API) ---------- */
export interface ProgramDetailExercise {
  id?: number;
  exercise_id: number;
  exercise_name?: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_seconds?: number;
  order_sequence: number;
}

export interface ProgramDetailSession {
  id?: number;
  session_name: string;
  workout_split: string;
  day_of_week?: number;
  day_number: number;
  notes?: string;
  exercises?: ProgramDetailExercise[];
}

export interface ProgramDetail extends ProgramListItem {
  user_id?: number | null;
  start_date?: string;
  end_date?: string;
  sessions: ProgramDetailSession[];
}
