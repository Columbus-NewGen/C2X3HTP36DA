import { memo } from "react";
import type { WorkoutSessionExercise } from "../../types/workout.types";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { Activity } from "lucide-react";

interface WorkoutExerciseItemProps {
  exercise: WorkoutSessionExercise;
}

function WorkoutExerciseItemInner({ exercise }: WorkoutExerciseItemProps) {
  const meta = [
    `${exercise.sets} × ${exercise.reps}`,
    exercise.weight != null ? `${exercise.weight}kg` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 group">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner group-hover:border-lime-200 transition-colors">
        {exercise.image_url ? (
          <img
            src={resolveImageUrl(exercise.image_url) || undefined}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt={exercise.exercise_name}
          />
        ) : (
          <Activity size={18} className="text-gray-200" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-base font-bold text-gray-900 leading-tight">
          {exercise.exercise_name}
        </div>
        {meta && (
          <div className="text-sm font-medium text-lime-600 mt-0.5">{meta}</div>
        )}
      </div>
    </div>
  );
}

export const WorkoutExerciseItem = memo(WorkoutExerciseItemInner);
