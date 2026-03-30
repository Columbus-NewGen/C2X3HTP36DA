/**
 * Auth API Service
 * - login(payload): Authenticate user and get tokens
 * - register(payload): Create new user account
 */

import axiosClient from "./AxiosClient";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "../types/auth.types";

/**
 * Transform API user response to User type
 * Ensures consistent field names from backend response
 */
function transformUser(apiUser: any): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role,
    status: apiUser.status,
    image_url: apiUser.image_url || null,
    image_full_url: apiUser.image_full_url || null,
    trainer: apiUser.trainer,
    created_at: apiUser.created_at,
    updated_at: apiUser.updated_at,
  };
}

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await axiosClient.post<any>("/api/v1/auth/login", payload, {
      skipAuthRedirect: true,
    });
    return {
      message: res.data.message,
      token: res.data.token,
      user: transformUser(res.data.user),
    };
  },
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const res = await axiosClient.post<any>("/api/v1/auth/register", payload, {
      skipAuthRedirect: true,
    });
    return {
      message: res.data.message,
      user: res.data.user ? transformUser(res.data.user) : undefined,
      token: res.data.token,
    };
  },
};
