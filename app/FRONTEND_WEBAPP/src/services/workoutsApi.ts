/**
 * Workouts API Service
 * - getCalendar(userId, start, end): Get daily workout status for calendar
 * - getScheduled(userId, start, end, status): Get list of upcoming workouts
 * - updateScheduledStatus(userId, workoutId, data): Mark workout as complete/skip
 * - logWorkout(userId, data): Save a workout session log
 * - getLogs(userId, start, end): Get historical workout logs
 * - add/update/deleteExerciseInLog(...): Manage individual exercise sets within a log
 */
// src/services/workoutsApi.ts
import axiosClient from "./AxiosClient";
import type {
  CalendarWorkoutDay,
  ScheduledWorkout,
  WorkoutLog,
  UpdateWorkoutStatusRequest,
  LogWorkoutRequest,
  AddExerciseToLogRequest,
  WorkoutLogExercise,
  WorkoutLogExerciseResponse,
  UpdateExerciseInLogRequest,
  UpdateScheduledExerciseRequest,
  UpdateScheduledExerciseResponse,
} from "../types/workout.types";

export const workoutsApi = {
  /* ---------- CALENDAR VIEW ---------- */
  async getCalendar(
    userId: string | number,
    start_date: string,
    end_date: string,
  ): Promise<CalendarWorkoutDay[]> {
    const res = await axiosClient.get<{ calendar: CalendarWorkoutDay[] }>(
      `/api/v1/users/${userId}/workouts/calendar`,
      { params: { start_date, end_date } },
    );

    return res.data.calendar;
  },

  /* ---------- SCHEDULED WORKOUTS ---------- */
  async getScheduled(
    userId: string | number,
    start_date: string,
    end_date: string,
    program_status?: "ACTIVE" | "PAUSED" | "COMPLETED",
  ): Promise<ScheduledWorkout[]> {
    const params: Record<string, string> = {
      start_date,
      end_date,
    };

    if (program_status) {
      params.program_status = program_status;
    }

    const res = await axiosClient.get<{ workouts: ScheduledWorkout[] }>(
      `/api/v1/users/${userId}/workouts/scheduled`,
      { params },
    );

    return res.data.workouts;
  },

  async getScheduledById(
    userId: string | number,
    workoutId: string | number,
  ): Promise<ScheduledWorkout> {
    const res = await axiosClient.get<{ workout: ScheduledWorkout }>(
      `/api/v1/users/${userId}/workouts/scheduled/${workoutId}`,
    );

    return res.data.workout;
  },

  async updateScheduledStatus(
    userId: string | number,
    workoutId: string | number,
    data: UpdateWorkoutStatusRequest,
  ): Promise<ScheduledWorkout> {
    const res = await axiosClient.put<{
      message: string;
      workout: ScheduledWorkout;
    }>(`/api/v1/users/${userId}/workouts/scheduled/${workoutId}/status`, data);

    return res.data.workout;
  },

  async updateScheduledExercise(
    userId: string | number,
    workoutId: string | number,
    exerciseId: string | number,
    data: UpdateScheduledExerciseRequest,
  ): Promise<UpdateScheduledExerciseResponse> {
    const res = await axiosClient.put<UpdateScheduledExerciseResponse>(
      `/api/v1/users/${userId}/workouts/scheduled/${workoutId}/exercises/${exerciseId}`,
      data,
    );
    return res.data;
  },

  async deleteScheduledExercise(
    userId: string | number,
    workoutId: string | number,
    exerciseId: string | number,
  ): Promise<{ message: string }> {
    const res = await axiosClient.delete<{ message: string }>(
      `/api/v1/users/${userId}/workouts/scheduled/${workoutId}/exercises/${exerciseId}`,
    );
    return res.data;
  },

  async addScheduledExercise(
    userId: string | number,
    workoutId: string | number,
    data: { exercise_id: number; sets: number; reps: number; weight: number }
  ): Promise<UpdateScheduledExerciseResponse> {
    const res = await axiosClient.post<UpdateScheduledExerciseResponse>(
      `/api/v1/users/${userId}/workouts/scheduled/${workoutId}/exercises`,
      data,
    );
    return res.data;
  },

  /* ---------- WORKOUT LOG ---------- */
  async logWorkout(
    userId: string | number,
    data: LogWorkoutRequest,
  ): Promise<WorkoutLog> {
    const res = await axiosClient.post<{
      message: string;
      workout_log: WorkoutLog;
    }>(`/api/v1/users/${userId}/workouts/log`, data);

    return res.data.workout_log;
  },

  async getLogs(
    userId: string | number,
    start_date?: string,
    end_date?: string,
  ): Promise<WorkoutLog[]> {
    const res = await axiosClient.get<{ logs: WorkoutLog[] }>(
      `/api/v1/users/${userId}/workouts/logs`,
      {
        params: start_date || end_date ? { start_date, end_date } : undefined,
      },
    );

    return res.data.logs;
  },

  async getLogById(
    userId: string | number,
    logId: string | number,
  ): Promise<WorkoutLog> {
    const res = await axiosClient.get<{ workout_log: WorkoutLog }>(
      `/api/v1/users/${userId}/workouts/logs/${logId}`,
    );

    return res.data.workout_log;
  },

  async addExerciseToLog(
    userId: string | number,
    logId: string | number,
    data: AddExerciseToLogRequest,
  ): Promise<WorkoutLogExercise> {
    const res = await axiosClient.post<WorkoutLogExerciseResponse>(
      `/api/v1/users/${userId}/workouts/logs/${logId}/exercises`,
      data,
    );

    return res.data.exercise;
  },
  async updateExerciseInLog(
    userId: string | number,
    logId: string | number,
    exerciseLogId: string | number,
    data: UpdateExerciseInLogRequest,
  ): Promise<WorkoutLogExercise> {
    const res = await axiosClient.put<WorkoutLogExerciseResponse>(
      `/api/v1/users/${userId}/workouts/logs/${logId}/exercises/${exerciseLogId}`,
      data,
    );

    return res.data.exercise;
  },
  async deleteExerciseInLog(
    userId: string | number,
    logId: string | number,
    exerciseLogId: string | number,
  ): Promise<void> {
    await axiosClient.delete(
      `/api/v1/users/${userId}/workouts/logs/${logId}/exercises/${exerciseLogId}`,
    );
  },
};
