/**
 * Walls API Service
 * - getByFloorplanId(id): Get all walls for a floorplan
 * - create(data): Add a new wall to a floorplan
 * - update(id, data): Update wall coordinates or appearance
 * - delete(id): Remove wall from floorplan
 */
import axiosClient from "./AxiosClient";
import type {
  Wall,
  CreateWallRequest,
  UpdateWallRequest,
} from "../types/floorplan.types";

export const wallsApi = {
  async getByFloorplanId(floorplanId: string | number): Promise<Wall[]> {
    const res = await axiosClient.get<{ walls: Wall[] }>(
      `/api/v1/floorplan/${floorplanId}/walls`
    );
    return res.data.walls;
  },

  async create(data: CreateWallRequest): Promise<Wall> {
    // Workaround: Backend may not accept values <= 0 or < 0.001, so use 0.001 as minimum
    const MIN_VALUE = 0.001;
    const requestData = { ...data };

    // If value is 0 or < 0.001, set to 0.001
    if (requestData.start_x < MIN_VALUE) {
      requestData.start_x = MIN_VALUE;
    }
    if (requestData.start_y < MIN_VALUE) {
      requestData.start_y = MIN_VALUE;
    }
    if (requestData.end_x < MIN_VALUE) {
      requestData.end_x = MIN_VALUE;
    }
    if (requestData.end_y < MIN_VALUE) {
      requestData.end_y = MIN_VALUE;
    }

    const res = await axiosClient.post<{
      message: string;
      wall: Wall;
    }>("/api/v1/floorplan/walls", requestData);
    return res.data.wall;
  },

  async update(id: string | number, data: UpdateWallRequest): Promise<Wall> {
    // Workaround: Backend may not accept values <= 0 or < 0.001, so use 0.001 as minimum
    const MIN_VALUE = 0.001;
    const requestData: UpdateWallRequest = { ...data };

    // If value is 0 or < 0.001, set to 0.001 (only if field is defined)
    if (requestData.start_x !== undefined && requestData.start_x < MIN_VALUE) {
      requestData.start_x = MIN_VALUE;
    }
    if (requestData.start_y !== undefined && requestData.start_y < MIN_VALUE) {
      requestData.start_y = MIN_VALUE;
    }
    if (requestData.end_x !== undefined && requestData.end_x < MIN_VALUE) {
      requestData.end_x = MIN_VALUE;
    }
    if (requestData.end_y !== undefined && requestData.end_y < MIN_VALUE) {
      requestData.end_y = MIN_VALUE;
    }

    const res = await axiosClient.put<{
      message: string;
      wall: Wall;
    }>(`/api/v1/floorplan/walls/${id}`, requestData);
    return res.data.wall;
  },

  async delete(id: string | number): Promise<void> {
    await axiosClient.delete(`/api/v1/floorplan/walls/${id}`);
  },
};
