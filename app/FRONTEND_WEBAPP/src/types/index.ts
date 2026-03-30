/**
 * API Types (Barrel File)
 * @deprecated This file is kept for backward compatibility.
 * Please import from specific type files instead:
 * - common.types.ts for MachineStatus, Role
 * - auth.types.ts for User, LoginResponse, etc.
 * - equipment.types.ts for Equipment, Machine, etc.
 * - floorplan.types.ts for Floorplan, Wall, etc.
 * - program.types.ts for Program
 */

// Common
export type { MachineStatus, Role } from "./common.types";

// Auth
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthState,
  AuthContextValue,
} from "./auth.types";

// Equipment
export type {
  Equipment,
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
  UpdateStatusRequest,
} from "./equipment.types";

// Floorplan
export type {
  Floorplan,
  Wall,
  CreateFloorplanRequest,
  UpdateFloorplanRequest,
  CreateWallRequest,
  UpdateWallRequest,
} from "./floorplan.types";

// Program
export type {
  CreateProgramPayload,
  UpdateProgramPayload,
  GetProgramsParams,
  ProgramListItem,
  ProgramDetail,
} from "./program.types";

// Exercise
export * from "./exercise.types";

// Workout
export * from "./workout.types";

// Leaderboard
export * from "./leaderboard.types";

// User
export type { UserProgressResponse } from "./user.types";

// Gamification
export * from "./gamification.types";
