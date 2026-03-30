import { memo } from "react";
import type { WorkoutSessionExercise } from "../../types/workout.types";

interface ExercisePreviewProps {
  exercise: WorkoutSessionExercise;
}

function ExercisePreviewInner({ exercise }: ExercisePreviewProps) {
  const meta = [
    `${exercise.sets} × ${exercise.reps}`,
    exercise.weight != null ? `${exercise.weight}kg` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="py-3 border-b border-lime-100/80 last:border-0">
      <div className="text-base font-semibold text-gray-900">
        {exercise.exercise_name}
      </div>
      <div className="text-sm text-gray-600 mt-0.5">{meta}</div>
    </div>
  );
}

export const ExercisePreview = memo(ExercisePreviewInner);
