// types/exercise.types.ts

export type MovementType = "compound" | "isolation" | string;
export type MovementPattern =
  | "squat"
  | "hinge"
  | "push"
  | "pull"
  | "carry"
  | string;

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: number;
  exercise_name: string;
  movement_type: MovementType;
  movement_pattern: MovementPattern;
  description: string;
  difficulty_level: DifficultyLevel;
  is_compound: boolean;
  image_url: string | null;
  image_full_url: string | null;
  video_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  primary_muscle?: string;
  primary_muscles?: string[];
}

export interface GetExercisesResponse {
  exercises: Exercise[];
  count: number;
}

export interface CreateExerciseResponse {
  message: string;
  exercise: Exercise;
}

export interface UpdateExerciseResponse {
  message: string;
  exercise: Exercise;
}

export interface DeleteExerciseResponse {
  message: string;
}

export interface SubstituteEntry {
  exercise: Exercise;
  similarity_score: number; // 0-100
  reason?: string | null;
}

export interface GetSubstitutesResponse {
  exercise_id: number;
  substitutes: SubstituteEntry[];
  count: number;
  excluded_ids?: number[];
}

export interface ExerciseEquipment {
  id: number;
  equipment_name: string;
  equipment_type: string;
  description: string | null;
  image_url: string | null;
  image_full_url: string | null;
  is_required: boolean;
}

export interface GetExerciseEquipmentResponse {
  exercise_id: number;
  equipment: ExerciseEquipment[];
  count: number;
}

export interface ExerciseMuscle {
  id: number;
  muscle_name: string;
  scientific_name: string | null;
  body_region: string;
  involvement_type: "primary" | "secondary" | string;
  activation_percentage: number | null;
}

export interface GetExerciseMusclesResponse {
  exercise_id: number;
  muscles: ExerciseMuscle[];
  count: number;
}

/* ---------- UI SPECIFIC TYPES ---------- */

export type ExerciseSortKey = "updatedDesc" | "nameAsc" | "patternAsc";
export type ExerciseDrawerMode = "VIEW" | "CREATE" | "EDIT";

export interface ExerciseDisplay {
  id: number;
  name: string;
  movementPattern: MovementPattern;
  movementType: string;
  difficulty: DifficultyLevel;
  description: string;
  isCompound: boolean;
  image: string | null;
  videoUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ExerciseFormData {
  exercise_name: string;
  movement_type: string;
  movement_pattern: MovementPattern;
  description: string;
  difficulty_level: DifficultyLevel;
  is_compound: boolean;
  image_key: string | null;
  video_url: string;
  muscles?: Array<{
    muscle_id: number;
    involvement_type: string;
    activation_percentage: number;
  }>;
  equipment?: Array<{
    equipment_id: number;
    is_required: boolean;
  }>;
}
