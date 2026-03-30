import { useCallback, useEffect, useRef, useState } from "react";
import { workoutsApi } from "../../services/workoutsApi";
import type { ScheduledWorkout } from "../../types/workout.types";

export interface UseScheduledWorkoutsOptions {
  userId: string | number | undefined;
  startDate: string;
  endDate: string;
  programStatus?: "ACTIVE" | "PAUSED" | "COMPLETED";
  enabled?: boolean;
}

export interface UseScheduledWorkoutsResult {
  workouts: ScheduledWorkout[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useScheduledWorkouts({
  userId,
  startDate,
  endDate,
  programStatus,
  enabled = true,
}: UseScheduledWorkoutsOptions): UseScheduledWorkoutsResult {
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchWorkouts = useCallback(async () => {
    if (!userId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const data = await workoutsApi.getScheduled(userId, startDate, endDate, programStatus);
      if (!controller.signal.aborted) {
        setWorkouts(data ?? []);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError("ไม่สามารถโหลดตารางการฝึกได้");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [userId, startDate, endDate, programStatus]);

  useEffect(() => {
    if (enabled && userId) {
      fetchWorkouts();
    }
    return () => abortRef.current?.abort();
  }, [enabled, userId, fetchWorkouts]);

  return { workouts, loading, error, refetch: fetchWorkouts };
}
