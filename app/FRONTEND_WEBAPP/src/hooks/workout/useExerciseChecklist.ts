import { useCallback, useMemo, useRef, useState } from "react";
import type { ScheduledWorkout, WorkoutLogExercise } from "../../types/workout.types";

// ── Types ─────────────────────────────────────────────────────────────────────

/** One entry per scheduled exercise slot in the checklist. */
export interface ExerciseChecklistItem {
    /** scheduled_workout_exercise_id – the stable primary key for a slot */
    slotId: number;
    /** exercise_id from the session prescription or log */
    exercise_id: number;
    /** Simplified exercise name for UI display */
    exercise_name: string;
    /** Whether the slot has been logged */
    completed: boolean;
    /** Simplified exercise image for UI display */
    image_url?: string | null;
    /** The id from workout_log.exercises (undefined until completed) */
    exerciseLogId?: number;
}

/** Map<slotId, ExerciseChecklistItem> for O(1) lookup */
export type ChecklistMap = Map<number, ExerciseChecklistItem>;

interface UseExerciseChecklistOptions {
    userId: string | number | undefined;
    workout: ScheduledWorkout | null;
    /** Called when all slots are completed so the parent can mark workout COMPLETED */
    onAllCompleted?: (workoutId: number) => void;
    /** Called after ALL exercises are done to sync final state from server */
    refetch?: () => Promise<void>;
    onError?: (message: string) => void;
}

// ── Pure helper: build ChecklistMap from a workout ────────────────────────────

function buildChecklist(workout: ScheduledWorkout | null): ChecklistMap {
    const map: ChecklistMap = new Map();
    if (!workout) return map;

    // Build completion lookup: scheduled_workout_exercise_id → log detail
    const logMap = new Map<number, WorkoutLogExercise>();
    if (workout.workout_log?.exercises) {
        for (const logEx of workout.workout_log.exercises) {
            if (logEx.scheduled_workout_exercise_id != null) {
                logMap.set(logEx.scheduled_workout_exercise_id, logEx);
            }
        }
    }

    // Build ChecklistMap keyed by slotId (= scheduled_workout_exercise_id)
    for (const sessionEx of workout.session.exercises) {
        const logEx = logMap.get(sessionEx.id); // O(1)
        map.set(sessionEx.id, {
            slotId: sessionEx.id,
            // If logged, use the log's exercise_id (might be substituted)
            exercise_id: logEx?.exercise_id ?? sessionEx.exercise_id,
            // If logged, use the log's exercise_name (might be substituted)
            exercise_name: logEx?.exercise_name ?? sessionEx.exercise_name,
            completed: logEx !== undefined,
            image_url: logEx?.image_url ?? (
                sessionEx.image_url ||
                sessionEx.image_full_url ||
                sessionEx.equipment?.[0]?.image_url ||
                sessionEx.equipment?.[0]?.image_full_url
            ),
            exerciseLogId: logEx?.id,
        });
    }
    return map;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useExerciseChecklist({
    workout,
}: UseExerciseChecklistOptions) {
    const prevSnapshotRef = useRef<{
        workoutId: number | null;
        workoutLog: ScheduledWorkout["workout_log"] | undefined;
    }>({ workoutId: null, workoutLog: undefined });

    const currentSnapshot = {
        workoutId: workout?.id ?? null,
        workoutLog: workout?.workout_log,
    };

    const snapshotChanged =
        currentSnapshot.workoutId !== prevSnapshotRef.current.workoutId ||
        currentSnapshot.workoutLog !== prevSnapshotRef.current.workoutLog;

    const freshChecklist = useMemo(
        () => buildChecklist(workout),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [workout?.id, workout?.workout_log]
    );

    const [checklist, setChecklist] = useState<ChecklistMap>(freshChecklist);

    // Re-hydrate when workout identity or its log changes
    if (snapshotChanged) {
        prevSnapshotRef.current = currentSnapshot;
        setChecklist(freshChecklist);
    }

    // ── Toggle ─────────────────────────────────────────────────────────────────

    const toggleExercise = useCallback(
        (slotId: number) => {
            const item = checklist.get(slotId);
            if (!item) return;

            setChecklist((prev) => {
                const next = new Map(prev);
                next.set(slotId, {
                    ...item,
                    completed: !item.completed,
                });
                return next;
            });
        },
        [checklist]
    );

    const substituteExercise = useCallback(
        (slotId: number, newExercise: { id: number; name: string; image_url?: string | null }) => {
            const item = checklist.get(slotId);
            if (!item) return;

            setChecklist((prev) => {
                const next = new Map(prev);
                next.set(slotId, {
                    ...item,
                    exercise_id: newExercise.id,
                    exercise_name: newExercise.name,
                    image_url: newExercise.image_url,
                    // DO NOT auto-complete here so the user can see the Map link 
                    // and mark it done manually after finishing the exercise.
                    completed: false,
                });
                return next;
            });
        },
        [checklist]
    );

    return {
        /** O(1) lookup map: slotId → ExerciseChecklistItem */
        checklist,
        /** slotId currently saving (deprecated in oneshot) */
        loadingSlotId: null,
        /** The workout log id (if it already exists on the server) */
        workoutLogId: workout?.workout_log?.id,
        toggleExercise,
        substituteExercise,
    };
}
