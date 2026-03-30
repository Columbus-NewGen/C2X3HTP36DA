/**
 * Exercise API Service
 * - getAll(): Get all exercises
 * - getById(id): Get exercise by ID
 * - create(data): Create new exercise
 * - update(id, data): Update existing exercise
 * - delete(id): Delete exercise
 * - getSubstitutes(id, options): Get alternative exercises
 * - getEquipment(id): Get equipment used by exercise
 * - getMuscles(id): Get muscles targeted by exercise
 */
import axiosClient from "./AxiosClient";
import type {
  Exercise,
  GetExercisesResponse,
  CreateExerciseResponse,
  UpdateExerciseResponse,
  DeleteExerciseResponse,
  GetSubstitutesResponse,
  GetExerciseEquipmentResponse,
  GetExerciseMusclesResponse,
} from "../types/exercise.types";

export const exerciseApi = {
  async getAll(): Promise<GetExercisesResponse> {
    const res =
      await axiosClient.get<GetExercisesResponse>("/api/v1/exercises");
    return res.data;
  },

  async getById(id: number): Promise<Exercise> {
    const res = await axiosClient.get<Exercise>(`/api/v1/exercises/${id}`);
    return res.data;
  },

  async create(
    data: Partial<Exercise> | FormData,
  ): Promise<CreateExerciseResponse> {
    // Accept either pre-constructed FormData (for multipart) or a JSON payload
    const headers: Record<string, string> = {};
    let payload: any = data;
    if (data instanceof FormData) {
      // Let axios set the multipart boundary
      payload = data;
    } else {
      headers["Content-Type"] = "application/json";
    }

    const res = await axiosClient.post<CreateExerciseResponse>(
      "/api/v1/exercises",
      payload,
      { headers },
    );
    return res.data;
  },

  async update(
    id: number,
    data: Partial<Exercise> | FormData,
  ): Promise<UpdateExerciseResponse> {
    const headers: Record<string, string> = {};
    let payload: any = data;
    if (data instanceof FormData) {
      payload = data;
    } else {
      headers["Content-Type"] = "application/json";
    }

    const res = await axiosClient.put<UpdateExerciseResponse>(
      `/api/v1/exercises/${id}`,
      payload,
      { headers },
    );
    return res.data;
  },

  async delete(id: number): Promise<DeleteExerciseResponse> {
    const res = await axiosClient.delete<DeleteExerciseResponse>(
      `/api/v1/exercises/${id}`,
    );
    return res.data;
  },

  async getSubstitutes(
    id: number,
    options?: {
      min_similarity?: number;
      exclude_ids?: number[];
      limit?: number;
    },
  ): Promise<GetSubstitutesResponse> {
    const params: Record<string, any> = {};
    if (options?.min_similarity !== undefined)
      params.min_similarity = options.min_similarity;
    if (options?.exclude_ids && options.exclude_ids.length > 0)
      params.exclude_ids = options.exclude_ids.join(",");
    if (options?.limit !== undefined) params.limit = options.limit;

    const res = await axiosClient.get<GetSubstitutesResponse>(
      `/api/v1/exercises/${id}/substitutes`,
      { params },
    );
    return res.data;
  },

  async getEquipment(id: number): Promise<GetExerciseEquipmentResponse> {
    const res = await axiosClient.get<GetExerciseEquipmentResponse>(
      `/api/v1/exercises/${id}/equipment`,
    );
    return res.data;
  },

  async getMuscles(id: number): Promise<GetExerciseMusclesResponse> {
    const res = await axiosClient.get<GetExerciseMusclesResponse>(
      `/api/v1/exercises/${id}/muscles`,
    );
    return res.data;
  },
};
