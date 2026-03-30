import { useCallback, useState } from "react";
import { workoutsApi } from "../../services/workoutsApi";
import { toYYYYMMDD } from "../../utils/workout.utils";
import type { ScheduledWorkout, WorkoutLog } from "../../types/workout.types";

interface UseExerciseToggleOptions {
    userId: string | number | undefined;
    onWorkoutsChange: (fn: (prev: ScheduledWorkout[]) => ScheduledWorkout[]) => void;
    refetch: () => Promise<void>;
    onError?: (message: string) => void;
}

export function useExerciseToggle({
    userId,
    onWorkoutsChange,
    refetch,
    onError,
}: UseExerciseToggleOptions) {
    const [loadingExId, setLoadingExId] = useState<number | null>(null);

    const toggleExercise = useCallback(
        async (workout: ScheduledWorkout, exerciseId: number) => {
            if (!userId) return;

            // check if exercise is already logged
            const loggedEx = workout.workout_log?.exercises.find(
                (ex) => (ex.scheduled_workout_exercise_id || ex.exercise_id) === exerciseId
            );

            if (loggedEx) {
                // For now, if already logged, we don't do anything or we could delete
                // But the requirement just says "show that is completed yet or not"
                // and "when click the exercise done". 
                // Let's just focus on marking as done.
                return;
            }

            setLoadingExId(exerciseId);

            try {
                let currentLog = workout.workout_log;
                const sessionEx = workout.session.exercises.find(ex => ex.id === exerciseId);
                if (!sessionEx) return;

                // 1. If no log, create one WITH the exercise
                if (!currentLog) {
                    currentLog = await workoutsApi.logWorkout(userId, {
                        scheduled_workout_id: workout.id,
                        session_id: workout.session.id || undefined,
                        workout_date: toYYYYMMDD(new Date()),
                        duration_minutes: 30, // Default to 30
                        exercises: [{
                            exercise_id: sessionEx.exercise_id,
                            scheduled_workout_exercise_id: exerciseId,
                            sets_completed: sessionEx.sets,
                            reps_completed: sessionEx.reps,
                            weight_used: sessionEx.weight,
                        }],
                    });
                } else {
                    // 2. Log already exists, add exercise to log
                    await workoutsApi.addExerciseToLog(userId, currentLog.id, {
                        exercise_id: sessionEx.exercise_id,
                        scheduled_workout_exercise_id: exerciseId,
                        sets_completed: sessionEx.sets,
                        reps_completed: sessionEx.reps,
                        weight_used: sessionEx.weight,
                    });
                }

                // 3. Update local state
                onWorkoutsChange((prev) =>
                    prev.map((w) => {
                        if (w.id === workout.id) {
                            const updatedLog: WorkoutLog = currentLog!;
                            // We need to refetch or manually update the exercises in the log
                            // For simplicity and correctness, let's just trigger a refetch in the UI
                            // or manually push the new exercise log.
                            // Manually pushing is faster for UX.
                            const newExLog = {
                                exercise_id: sessionEx?.exercise_id || 0,
                                scheduled_workout_exercise_id: exerciseId,
                                sets_completed: sessionEx?.sets || 0,
                                reps_completed: sessionEx?.reps || 0,
                                weight_used: sessionEx?.weight,
                            };

                            return {
                                ...w,
                                workout_log: {
                                    ...updatedLog,
                                    exercises: [...(updatedLog.exercises || []), newExLog],
                                },
                            };
                        }
                        return w;
                    })
                );

                // 4. Refetch to get updated completeness from server
                await refetch();
            } catch (err) {
                console.error("Failed to toggle exercise", err);
                onError?.("ไม่สามารถบันทึกท่าฝึกได้");
            } finally {
                setLoadingExId(null);
            }
        },
        [userId, onWorkoutsChange, refetch, onError]
    );

    return { toggleExercise, loadingExId };
}
