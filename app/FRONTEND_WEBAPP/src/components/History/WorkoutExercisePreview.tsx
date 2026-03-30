import { memo } from "react";
import type { WorkoutLogExercise } from "../../types/workout.types";

interface WorkoutExercisePreviewProps {
  exercises: WorkoutLogExercise[];
}

export const WorkoutExercisePreview = memo(
  ({ exercises }: WorkoutExercisePreviewProps) => {
    if (!exercises.length) return null;

    const displayCount = 1;
    const mainExercises = exercises.slice(0, displayCount);
    const remainingCount = exercises.length - displayCount;

    return (
      <div className="space-y-3">
        {mainExercises.map((ex, i) => (
          <div key={i} className="flex items-center justify-between group/ex">
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-800 truncate transition-colors group-hover/ex:text-lime-600">
                {ex.exercise_name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-neutral-400 uppercase ">
                  {ex.sets_completed} เซ็ต · {ex.reps_completed} ครั้ง
                </span>
                {ex.weight_used ? (
                  <span className="px-1.5 py-0.5 rounded-md bg-neutral-50 text-xs font-bold text-neutral-500 border border-neutral-100/50">
                    {ex.weight_used} KG
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-50/50 rounded-xl">
            <div className="w-1 h-1 rounded-full bg-lime-400 animate-pulse" />
            <p className="text-xs font-extrabold text-lime-600 uppercase ">
              และอีก {remainingCount} ท่าที่เหลือ
            </p>
          </div>
        )}
      </div>
    );
  },
);

WorkoutExercisePreview.displayName = "WorkoutExercisePreview";
