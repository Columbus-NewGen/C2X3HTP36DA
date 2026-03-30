/**
 * Machines API Service (Floorplan Instances)
 * - getByFloorplanId(id): Get all machines for a floorplan
 * - getAll(): Get all machines from the active floorplan
 * - getById(id): Get specific machine by ID
 * - create(data): Instantiate an equipment item on a floorplan
 * - update(id, data): Update machine position, rotation, or label
 * - updateStatus(id, status): Update machine operational status
 * - delete(id): Remove machine from floorplan
 */
import axiosClient from "./AxiosClient";
import type {
  equipment_instances,
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
} from "../types/equipment.types";
import type { MachineStatus } from "../types/common.types";
import { floorplanApi } from "./FloorplanAPI";

export const machinesApi = {
  async getByFloorplanId(floorplanId: string | number): Promise<Machine[]> {
    const res = await axiosClient.get<equipment_instances>(
      `/api/v1/floorplan/${floorplanId}/equipment-instances`,
    );
    return res.data.equipment_instances;
  },

  /**
   * Get all machines from active floorplan
   */
  async getAll(): Promise<Machine[]> {
    const activeFloorplan = await floorplanApi.getById(1);
    return this.getByFloorplanId(activeFloorplan.id);
  },

  /**
   * Get machine by ID (from active floorplan)
   */
  async getById(id: string | number): Promise<Machine | undefined> {
    const machines = await this.getAll();
    return machines.find((m) => m.id === Number(id));
  },

  async create(data: CreateMachineRequest): Promise<Machine> {
    if (import.meta.env.DEV) console.log("[API] Creating machine:", data);
    const res = await axiosClient.post<{
      message: string;
      machine: Machine;
    }>("/api/v1/floorplan/equipment-instances", data);
    return res.data.machine;
  },

  async update(
    id: string | number,
    data: UpdateMachineRequest,
  ): Promise<Machine> {
    if (import.meta.env.DEV) console.log("[API] Updating machine:", { id, data });
    const res = await axiosClient.put<{
      message: string;
      machine: Machine;
    }>(`/api/v1/floorplan/equipment-instances/${id}`, data);
    return res.data.machine;
  },

  async updateStatus(
    id: string | number,
    status: MachineStatus,
  ): Promise<Machine> {
    const res = await axiosClient.put<{
      message: string;
      machine: Machine;
    }>(`/api/v1/floorplan/equipment-instances/${id}/status`, { status });
    return res.data.machine;
  },

  async delete(id: string | number): Promise<void> {
    await axiosClient.delete(`/api/v1/floorplan/equipment-instances/${id}`);
  },
};
