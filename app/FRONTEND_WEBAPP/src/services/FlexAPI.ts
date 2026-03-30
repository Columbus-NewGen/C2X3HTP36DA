/**
 * Flex API Service (Substitutions)
 * - getRecommendations(payload): Get exercise recommendations
 * - updateEquipmentStatus(id, status): Update equipment operational status
 */
import axiosClient from "./AxiosClient";
import type { Equipment } from "../types/equipment.types";

export interface FlexSubRequest {
  exercise_id: number;
  equipment_id: number;
}

export interface FlexSubResponse {
  [key: string]: unknown;
}

export const flexApi = {
  async getRecommendations(payload: FlexSubRequest): Promise<FlexSubResponse> {
    const res = await axiosClient.post<FlexSubResponse>(
      "/api/v1/flex-substitute",
      payload,
    );
    return res.data;
  },

  async updateEquipmentStatus(
    id: number,
    status: "ACTIVE" | "MAINTENANCE",
  ): Promise<Equipment> {
    const res = await axiosClient.put<{ message: string; equipment: Equipment }>(
      `/api/v1/equipment/${id}/status`,
      { status },
    );
    return res.data.equipment;
  },
};
