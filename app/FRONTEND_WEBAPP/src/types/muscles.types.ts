export type MuscleGroup = {
    id: number;
    group_name: string;
    split_category: string;
    created_at: string;
    updated_at: string;
};

export type Muscle = {
    id: number;
    muscle_name: string;
    scientific_name: string;
    body_region: string;
    function: string;
    groups: MuscleGroup[];
    created_at: string;
    updated_at: string;
};

export type ExerciseByMuscle = {
    id: number;
    exercise_name: string;
    movement_type: string;
    movement_pattern: string;
    difficulty_level: string;
    is_compound: boolean;
    image_url: string | null;
    image_full_url: string | null;
    involvement_type: string;
    activation_percentage: number;
};

export type MusclesResponse = {
    muscles: Muscle[];
    count: number;
};

export type MuscleGroupsResponse = {
    muscle_groups: MuscleGroup[];
    count: number;
};

export type MuscleExercisesResponse = {
    muscle_id: number;
    exercises: ExerciseByMuscle[];
    count: number;
};