import { useCallback, useState } from "react";
import { workoutsApi } from "../../services/workoutsApi";
import type {
  ScheduledWorkout,
  ScheduledWorkoutStatus,
} from "../../types/workout.types";

export interface UseWorkoutStatusOptions {
  userId: string | number | undefined;
  workouts: ScheduledWorkout[];
  onWorkoutsChange: (fn: (prev: ScheduledWorkout[]) => ScheduledWorkout[]) => void;
  onSuccess?: () => void;
  onCompleted?: (workout: ScheduledWorkout) => void;
  onError?: (message: string) => void;
}

export function useWorkoutStatus({
  userId,
  workouts,
  onWorkoutsChange,
  onSuccess,
  onCompleted,
  onError,
}: UseWorkoutStatusOptions) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const updateStatus = useCallback(
    async (id: number, status: ScheduledWorkoutStatus) => {
      if (!userId) return;

      const snapshot = [...workouts];
      const workout = workouts.find((w) => w.id === id);
      setUpdatingId(id);
      onWorkoutsChange((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status } : w))
      );

      try {
        await workoutsApi.updateScheduledStatus(userId, id, { status });
        onSuccess?.();

        // After completing, trigger the log sheet
        if (status === "COMPLETED" && workout) {
          onCompleted?.(workout);
        }
      } catch {
        onWorkoutsChange(() => snapshot);
        onError?.("ไม่สามารถอัปเดตสถานะได้");
      } finally {
        setUpdatingId(null);
      }
    },
    [userId, workouts, onWorkoutsChange, onSuccess, onCompleted, onError]
  );

  return { updateStatus, isUpdating: (id: number) => updatingId === id };
}
