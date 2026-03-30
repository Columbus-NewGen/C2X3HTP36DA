/**
 * Users API Service
 * - getUserById(id): Get single user profile
 * - getAll(page, pageSize, role, status): List/filter all users
 * - updateProfile(id, payload): Update user basic info
 * - updateProfileImageFile/Url(id, data): Update avatar
 * - assignTrainer(id, trainerId): Link user to a trainer
 * - unassignTrainer(id): Remove trainer link
 * - updateStatus(id, status): Patch user active status
 * - updateRole(id, role): Patch user system role
 * - createWeight(id, payload): Add weight tracking entry
 * - getWeightHistory(id, from, to): Get user's weight log
 */
// src/services/UsersAPI.ts

import axiosClient from "./AxiosClient";
import { userStorage } from "../contexts/user.storage";
import type { Role } from "../types/common.types";
import type {
  User,
  GetUsersResponse,
  UserResponse,
  UpdateUserProfilePayload,
  WeightEntry,
  WeightHistoryResponse,
  CreateWeightPayload,
  UserStatus,
  UserProgressResponse,
  UserProgressTrendsResponse,
} from "../types/user.types";
import type { User as AuthUser } from "../types/auth.types";

export const usersApi = {
  async getUserById(id: number): Promise<User> {
    const res = await axiosClient.get<User>(`/api/v1/users/${id}`);
    return res.data;
  },

  async syncUserToStorage(userId: number): Promise<User> {
    const user = await this.getUserById(userId);

    const authUser: AuthUser = {
      ...user,
      trainer: user.trainer ?? undefined,
    };

    userStorage.set(authUser);
    return user;
  },

  async getAll(
    page: number = 1,
    pageSize: number = 20,
    role?: string,
    status?: string,
  ): Promise<GetUsersResponse> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("page_size", String(pageSize));
    if (role) params.append("role", role);
    if (status) params.append("status", status);

    const res = await axiosClient.get<GetUsersResponse>(
      `/api/v1/users?${params.toString()}`,
    );
    return res.data;
  },

  async deleteUser(userId: number): Promise<{ message: string }> {
    const res = await axiosClient.delete<{ message: string }>(
      `/api/v1/users/${userId}`,
    );
    return res.data;
  },

  async updateProfile(
    userId: number,
    payload: UpdateUserProfilePayload,
  ): Promise<UserResponse> {
    const res = await axiosClient.patch<UserResponse>(
      `/api/v1/users/${userId}/profile`,
      payload,
    );
    return res.data;
  },

  async updateProfileImageFile(
    userId: number,
    file: File,
  ): Promise<UserResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axiosClient.put<UserResponse>(
      `/api/v1/users/${userId}/profile/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },

  async updateProfileImageUrl(
    userId: number,
    imageUrl: string | null,
  ): Promise<UserResponse> {
    const res = await axiosClient.put<UserResponse>(
      `/api/v1/users/${userId}/profile/image`,
      { image_url: imageUrl },
    );
    return res.data;
  },

  async assignTrainer(
    userId: number,
    trainerId: number,
  ): Promise<UserResponse> {
    const res = await axiosClient.put<UserResponse>(
      `/api/v1/users/${userId}/trainer`,
      { trainer_id: trainerId },
    );
    return res.data;
  },

  async unassignTrainer(userId: number): Promise<UserResponse> {
    const res = await axiosClient.delete<UserResponse>(
      `/api/v1/users/${userId}/trainer`,
    );
    return res.data;
  },

  async updateStatus(
    userId: number,
    status: UserStatus,
  ): Promise<UserResponse> {
    const res = await axiosClient.patch<UserResponse>(
      `/api/v1/users/${userId}/status`,
      { status },
    );
    return res.data;
  },

  async updateRole(userId: number, role: Role): Promise<UserResponse> {
    const res = await axiosClient.patch<UserResponse>(
      `/api/v1/users/${userId}/role`,
      { role },
    );
    return res.data;
  },

  async createWeight(
    userId: number,
    payload: CreateWeightPayload,
  ): Promise<WeightEntry> {
    const res = await axiosClient.post<WeightEntry>(
      `/api/v1/users/${userId}/weight`,
      payload,
    );
    return res.data;
  },

  async getWeightHistory(
    userId: number,
    from?: string,
    to?: string,
  ): Promise<WeightHistoryResponse> {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosClient.get<WeightHistoryResponse>(
      `/api/v1/users/${userId}/weight?${params.toString()}`,
    );
    return res.data;
  },

  async deleteWeightEntry(
    userId: number,
    entryId: number,
  ): Promise<{ message: string }> {
    const res = await axiosClient.delete<{ message: string }>(
      `/api/v1/users/${userId}/weight/${entryId}`,
    );
    return res.data;
  },

  async getUserProgress(
    from?: string,
    to?: string,
  ): Promise<UserProgressResponse> {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosClient.get<UserProgressResponse>(
      `/api/v1/users/me/progress?${params.toString()}`,
    );
    return res.data;
  },

  async getUserProgressTrends(
    type: "muscle" | "exercise",
  ): Promise<UserProgressTrendsResponse> {
    const res = await axiosClient.get<UserProgressTrendsResponse>(
      `/api/v1/users/me/progress/trends?type=${type}`,
    );
    return res.data;
  },
};