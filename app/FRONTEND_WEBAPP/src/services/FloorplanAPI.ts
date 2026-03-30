/**
 * Floorplan API Service
 * - getActive(): Get the currently active floorplan
 * - getById(id): Get specific floorplan by ID
 * - create(data): Create new floorplan
 * - update(id, data): Update floorplan metadata and elements
 * - delete(id): Remove floorplan
 * - downloadFloorplanJson(data): Helper to download floorplan as JSON file
 */
import axiosClient from "./AxiosClient";
import type {
  Floorplan,
  UpdateFloorplanRequest,
  CreateFloorplanRequest,
} from "../types/floorplan.types";


export const floorplanApi = {
  async getActive(): Promise<Floorplan> {
    const res = await axiosClient.get<{ floorplan: Floorplan }>(
      "/api/v1/floorplan/active"
    );
    return res.data.floorplan;
  },

  async getById(id: string | number): Promise<Floorplan> {
    const res = await axiosClient.get<{ floorplan: Floorplan }>(
      `/api/v1/floorplan/${id}`
    );
    return res.data.floorplan;
  },

  async create(data: CreateFloorplanRequest): Promise<Floorplan> {
    const res = await axiosClient.post<{
      message: string;
      floorplan: Floorplan;
    }>("/api/v1/floorplan", data);
    return res.data.floorplan;
  },

  async update(
    id: string | number,
    data: Partial<UpdateFloorplanRequest> & { walls?: any[]; machines?: any[] } // Allow nested update if backend supports it
  ): Promise<Floorplan> {
    const res = await axiosClient.put<{
      message: string;
      floorplan: Floorplan;
    }>(`/api/v1/floorplan/${id}`, data);
    return res.data.floorplan;
  },

  async delete(id: string | number): Promise<void> {
    await axiosClient.delete(`/api/v1/floorplan/${id}`);
  },
};

// Re-export utilities to minimize breakage during refactor, or we can move them.
// For now, wrapping them here.
export function downloadFloorplanJson(
  data: Floorplan,
  filename: string = "floorplan.json"
): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
