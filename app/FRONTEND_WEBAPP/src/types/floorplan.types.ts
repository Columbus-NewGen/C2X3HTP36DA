/**
 * Floorplan Types
 * All floorplan-related types: API types and frontend-specific types
 */

// ==================== IMPORTS ====================
import type { Machine } from "./equipment.types";
import type { MachineStatus } from "./common.types";

// ==================== API TYPES ====================

export interface Floorplan {
  id: number;
  name: string;
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  equipment_instances?: Machine[];
  walls?: Wall[];
}

export interface Wall {
  id: number;
  floorplan_id: number;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  thickness: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFloorplanRequest {
  name: string;
  canvas_width: number;
  canvas_height: number;
  grid_size?: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateFloorplanRequest extends Partial<CreateFloorplanRequest> { }

export interface CreateWallRequest {
  floorplan_id: number;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  thickness?: number;
  color?: string;
}

export interface UpdateWallRequest {
  start_x?: number;
  start_y?: number;
  end_x?: number;
  end_y?: number;
  thickness?: number;
  color?: string;
}

// Re-export related types for convenience
export type {
  Machine,
  Equipment,
  CreateMachineRequest,
  UpdateMachineRequest,
  UpdateStatusRequest,
} from "./equipment.types";
export type { MachineStatus } from "./common.types";

export type EquipmentType = "machine" | "free_weight" | "bodyweight" | "cable";

// ==================== FRONTEND SPECIFIC TYPES ====================

export interface FloorSettings {
  widthM: number;
  heightM: number;
  gridSizeM: number;
  snapToGrid: boolean;
  pixelsPerMeter: number;
}

export interface HistoryAction {
  machines: Machine[];
  walls: Wall[];
}

export interface StatusColorConfig {
  bg: string;
  border: string;
  text: string;
  light: string;
}

export interface MachineFormData {
  label: string;
  machine: string;
  equipmentId?: number;
  status: MachineStatus;
  widthM: number;
  heightM: number;
}

// For Editor Canvas Interactions
export interface PanOffset {
  x: number;
  y: number;
}

export interface DragOffset {
  x: number;
  y: number;
}

export type ItemType = "machine" | "wall";

export type SelectedItem = { id: number; type: "machine" | "wall" };
export type HoveredItem = { id: number; type: "machine" | "wall" };

/** Editor interaction mode: controls toolbar, sidebar panel, and canvas behavior */
export type EditorMode = "select" | "machine" | "wall";

/** Wall being drawn (preview during click-drag) */
export interface WallPreview {
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  thickness: number;
}

export interface WallFormData {
  orientation: "HORIZONTAL" | "VERTICAL";
  lengthM: number;
  thickness: number;
}

export interface FloorplanFilters {
  searchQuery: string;
  statusFilter: MachineStatus | "ALL";
}

export interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}
