/**
 * Equipment API Service
 * - getAll(): Get all equipment catalog items
 * - getById(id): Get equipment by ID
 * - create(data): Add new equipment to catalog
 * - update(id, data): Update equipment details
 * - delete(id): Remove equipment from catalog
 */
import axiosClient from "./AxiosClient";
import type { Equipment, GetEquipmentResponse } from "../types/equipment.types";
import type { Exercise } from "../types/exercise.types";

export interface GetEquipmentExercisesResponse {
  equipment_id: number;
  exercises: Exercise[];
  count: number;
}

export const equipmentApi = {
  async getAll(): Promise<GetEquipmentResponse> {
    const res = await axiosClient.get<GetEquipmentResponse>(
      "/api/v1/equipment"
    );
    return res.data;
  },

  async getById(id: number): Promise<Equipment> {
    const res = await axiosClient.get<Equipment>(`/api/v1/equipment/${id}`);
    return res.data;
  },

  async getExercises(id: number): Promise<GetEquipmentExercisesResponse> {
    const res = await axiosClient.get<GetEquipmentExercisesResponse>(
      `/api/v1/equipment/${id}/exercises`
    );
    return res.data;
  },

  async create(data: Partial<Equipment>): Promise<Equipment> {
    const res = await axiosClient.post<Equipment>("/api/v1/equipment", data);
    return res.data;
  },

  async update(id: number, data: Partial<Equipment>): Promise<Equipment> {
    const res = await axiosClient.put<{
      message: string;
      equipment: Equipment;
    }>(`/api/v1/equipment/${id}`, data);
    return res.data.equipment;
  },

  async delete(id: number): Promise<void> {
    await axiosClient.delete(`/api/v1/equipment/${id}`);
  },
};
