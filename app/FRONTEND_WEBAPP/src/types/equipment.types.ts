/**
 * Equipment Types
 * Equipment and machine-related API types
 */

import type { MachineStatus } from "./common.types";

export type EquipmentType =
  | "machine"
  | "free_weight"
  | "bodyweight"
  | "cable"
  | "facility"
  | "area";

export interface Equipment {
  id: number;
  equipment_name: string;
  equipment_type: EquipmentType;
  image_url: string | null;
  image_full_url: string | null;
  status: MachineStatus;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
export interface GetEquipmentResponse {
  equipment: Equipment[];
  count: number;
}

export interface equipment_instances {
  equipment_instances: Machine[];
}

export interface Machine {
  id: number;
  floorplan_id: number;
  equipment_id: number;
  label: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
  status: MachineStatus;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;

  // UI-specific optional fields
  images?: { url: string }[];
  number?: string;
  notes?: string | null;
}

export interface CreateMachineRequest {
  floorplan_id: number;
  equipment_id: number;
  position_x: number;
  position_y: number;
  rotation?: number;
  width: number;
  height: number;
  label?: string;
}

export interface UpdateMachineRequest {
  position_x?: number;
  position_y?: number;
  rotation?: number;
  width?: number;
  height?: number;
  label?: string;
  equipment_id?: number;
}

export interface UpdateStatusRequest {
  status: MachineStatus;
}
