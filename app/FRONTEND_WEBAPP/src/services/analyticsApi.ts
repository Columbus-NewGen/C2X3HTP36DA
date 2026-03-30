/**
 * Analytics API Service
 * - getTrainerCount(): Get total number of trainers
 * - getUserCount(): Get total number of users
 * - getMachineStats(): Get detailed machine status and counts
 */
import axiosClient from "./AxiosClient";
import type { CountResponse, MachineStats } from "../types/analytics.types";

export const analyticsApi = {
  /* ---------- Trainers ---------- */
  async getTrainerCount(): Promise<number> {
    const res = await axiosClient.get<CountResponse>(
      "/api/v1/analytics/trainers/count",
    );
    return res.data.count;
  },

  /* ---------- Users ---------- */
  async getUserCount(): Promise<number> {
    const res = await axiosClient.get<CountResponse>(
      "/api/v1/analytics/users/count",
    );
    return res.data.count;
  },

  /* ---------- Machines ---------- */
  async getMachineStats(): Promise<MachineStats> {
    const res = await axiosClient.get<MachineStats>(
      "/api/v1/analytics/equipment-instances/stats",
    );
    return res.data;
  },
};
