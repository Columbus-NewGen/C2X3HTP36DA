import type {
  Machine,
  MachineStatus,
  StatusColorConfig,
} from "../types/floorplan.types";

// ==================== CONSTANTS ====================

const API_BASE_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");

export const DEFAULT_PIXELS_PER_METER = 50;
export const PIXELS_PER_CM = 0.5;
export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 2.0;
export const GRID_SIZE_M = 0.1;

// ==================== HELPER FUNCTIONS ====================

/**
 * Resolves a full image URL from a potentially relative URL.
 */
export const resolveImageUrl = (url?: string | null) => {
  if (!url || url.includes("machineImageHolder") || url.includes("exerciseImageHolder")) return null;
  if (url.startsWith("http")) return url;

  // Case 1: Media keys (e.g. "user/...", "equipment/...", "exercise/...") -> needs /api/v1/media/ prefix
  if (url.startsWith("user/") || url.startsWith("equipment/") || url.startsWith("exercise/")) {
    return `${API_BASE_URL}/api/v1/media/${url}`;
  }

  // Case 2: Other relative URLs
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${cleanUrl}`;
};

export function getDefaultMachineImage(_type?: string | undefined): string | null {
  return null;
}

export function getStatusColor(status: MachineStatus | string): StatusColorConfig {
  switch (status) {
    case "ACTIVE":
      return {
        bg: "bg-lime-500",
        border: "border-lime-400",
        text: "text-lime-700",
        light: "bg-lime-50",
      };
    case "MAINTENANCE":
      return {
        bg: "bg-orange-500",
        border: "border-orange-400",
        text: "text-orange-700",
        light: "bg-orange-50",
      };
    default:
      return {
        bg: "bg-slate-500",
        border: "border-slate-400",
        text: "text-slate-700",
        light: "bg-slate-50",
      };
  }
}

export function getHighlightColor(level: 1 | 2): StatusColorConfig {
  if (level === 1) {
    // Selection
    return {
      bg: "bg-slate-900",
      border: "border-slate-900",
      text: "text-white",
      light: "bg-slate-100",
    };
  }
  // Substitute
  return {
    bg: "bg-indigo-500",
    border: "border-indigo-400",
    text: "text-indigo-700",
    light: "bg-indigo-50",
  };
}

export function isSubstituteMachine(target: Machine, other: Machine): boolean {
  if (target.id === other.id) return false;

  // Based on equipment_id or name/type
  if (target.equipment_id > 0 && other.equipment_id > 0) {
    return target.equipment_id === other.equipment_id;
  }

  const tName = (
    target.equipment?.equipment_name || target.label
  ).toLowerCase();
  const oName = (other.equipment?.equipment_name || other.label).toLowerCase();

  return tName.includes(oName) || oName.includes(tName);
}

export function calculateCanvasDimensions(
  widthM: number,
  heightM: number,
  pixelsPerMeter: number,
): { width: number; height: number } {
  return {
    width: widthM * pixelsPerMeter,
    height: heightM * pixelsPerMeter,
  };
}

export function snapToGrid(
  x: number,
  y: number,
  gridSize: number,
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function cmToMeters(cm: number): number {
  return cm / 100;
}

export function metersToCm(m: number): number {
  return m * 100;
}
