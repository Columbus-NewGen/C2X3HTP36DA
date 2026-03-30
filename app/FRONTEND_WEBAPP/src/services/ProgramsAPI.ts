/**
 * Programs API Service
 * - getList(params): List all training programs with optional filters
 * - getById(id): Get program details including phases/days
 * - create(data): Create a new training program
 * - update(id, data): Update program metadata or layout
 * - delete(id): Remove program
 */
import axiosClient from "./AxiosClient";
import type {
  CreateProgramPayload,
  UpdateProgramPayload,
  GetProgramsParams,
  ProgramListItem,
  ProgramDetail,
} from "../types/program.types";

export const programAPI = {
  /* ---------- GET LIST ---------- */
  async getList(params?: GetProgramsParams): Promise<ProgramListItem[]> {
    const res = await axiosClient.get<{ programs: ProgramListItem[] }>(
      "/api/v1/programs",
      { params }
    );
    return res.data.programs;
  },

  /* ---------- GET DETAIL ---------- */
  async getById(id: string | number): Promise<ProgramDetail> {
    const res = await axiosClient.get<{ program: ProgramDetail }>(
      `/api/v1/programs/${id}`
    );
    return res.data.program;
  },

  /* ---------- CREATE ---------- */
  async create(data: CreateProgramPayload): Promise<{ program_id: number }> {
    const res = await axiosClient.post<{ program_id: number }>(
      "/api/v1/programs",
      data
    );
    return res.data;
  },

  /* ---------- UPDATE ---------- */
  async update(id: string | number, data: UpdateProgramPayload): Promise<void> {
    await axiosClient.put(`/api/v1/programs/${id}`, data);
  },

  /* ---------- DELETE ---------- */
  async delete(id: string | number): Promise<void> {
    await axiosClient.delete(`/api/v1/programs/${id}`);
  },

  /* ---------- CLONE ---------- */
  async clone(id: string | number): Promise<ProgramDetail> {
    const detail = await this.getById(id);
    const payload: CreateProgramPayload = {
      program_name: `${detail.program_name} (Cloned)`,
      goal: detail.goal,
      duration_weeks: detail.duration_weeks,
      difficulty_level: detail.difficulty_level,
      days_per_week: detail.days_per_week,
      description: detail.description,
      is_template: detail.is_template,
      sessions: detail.sessions.map((s, sIdx) => ({
        session_name: s.session_name,
        workout_split: s.workout_split,
        day_of_week: s.day_of_week,
        day_number: s.day_number || sIdx + 1,
        notes: s.notes,
        exercises: (s.exercises || []).map((e, eIdx) => ({
          exercise_id: e.exercise_id,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          rest_seconds: e.rest_seconds,
          order_sequence: e.order_sequence || eIdx + 1,
        })),
      })),
    };
    const { program_id } = await this.create(payload);
    return this.getById(program_id);
  },
};
