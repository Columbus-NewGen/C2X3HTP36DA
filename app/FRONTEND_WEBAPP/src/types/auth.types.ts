/**
 * Auth Types
 * Authentication and user-related types
 */

import type { Role } from "./common.types";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  status?: "ACTIVE" | "SUSPENDED" | string;
  image_url: string | null;
  image_full_url: string | null;
  trainer?: {
    id: number;
    name: string;
    role: Role;
  } | null;
  created_at?: string;
  updated_at?: string;
  // Profile fields
  date_of_birth?: string | null;
  gender?: string | null;
  height_cm?: number | null;
  fitness_level?: string | null;
  fitness_goal?: string | null;
  phone?: string | null;
  bio?: string | null;
  level?: number;
  xp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  message: string;
  user?: User;
  token?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserResponse {
  message: string;
  user: User;
}
