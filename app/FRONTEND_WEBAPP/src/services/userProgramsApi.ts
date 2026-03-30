/**
 * User Programs API Service (Assignments)
 * - assignToUser(userId, data): Assign a program to a specific user
 * - getByUserId(userId, status): Get all programs assigned to a user
 * - updateProgress(userId, userProgramId, data): Update status or progress of user's program
 */
// src/services/userProgramsApi.ts
import axiosClient from "./AxiosClient";
import type {
  AssignProgramRequest,
  UpdateUserProgramRequest,
  UserProgram,
  UserProgramStatus,
  GetUserProgramsResponse,
} from "../types/userProgram.types";

export const userProgramsApi = {
  /* ---------- ASSIGN PROGRAM ---------- */
  async assignToUser(
    userId: string | number,
    data: AssignProgramRequest
  ): Promise<UserProgram> {
    const res = await axiosClient.post<{
      message: string;
      user_program: UserProgram;
    }>(`/api/v1/users/${userId}/programs`, data);

    return res.data.user_program;
  },

  /* ---------- GET USER PROGRAMS ---------- */
  async getByUserId(
    userId: string | number,
    status?: UserProgramStatus
  ): Promise<UserProgram[]> {
    const res = await axiosClient.get<GetUserProgramsResponse>(`/api/v1/users/${userId}/programs`, {
      params: status ? { status } : undefined,
    });

    return res.data.programs;
  },

  /* ---------- GET SINGLE USER PROGRAM ---------- */
  async getById(
    userId: string | number,
    userProgramId: string | number
  ): Promise<UserProgram> {
    const res = await axiosClient.get<{ program: UserProgram }>(
      `/api/v1/users/${userId}/programs/${userProgramId}`
    );

    return res.data.program;
  },

  /* ---------- UPDATE USER PROGRAM ---------- */

  async updateProgress(
    userId: string | number,
    userProgramId: string | number,
    data: UpdateUserProgramRequest
  ): Promise<UserProgram> {
    const res = await axiosClient.put<{
      message: string;
      user_program: UserProgram;
    }>(`/api/v1/users/${userId}/programs/${userProgramId}`, data);

    return res.data.user_program;
  },
};
