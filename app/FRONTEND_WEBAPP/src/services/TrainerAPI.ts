/**
 * Trainer API Service
 * - getTrainees(trainerId, page, pageSize): Get users assigned to a trainer
 * - getDashboard(): Get trainer's personal dashboard data
 * - getTraineeProgress(traineeId): Get detailed training history for a trainee
 */
import axiosClient from "./AxiosClient";
import type {
  TraineesResponse,
  TrainerDashboard,
  TraineeProgress,
} from "../types/trainer.types";

export const trainerApi = {
  /**
   * Get all trainees assigned to a trainer
   * @param trainerId - Trainer ID
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 20)
   */
  async getTrainees(
    trainerId: number,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<TraineesResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());

    const res = await axiosClient.get<TraineesResponse>(
      `/api/v1/trainers/${trainerId}/trainees?${params.toString()}`,
    );
    return res.data;
  },

  /**
   * Get trainer dashboard with overview of trainees and recent activity
   * (Trainer only)
   */
  async getDashboard(): Promise<TrainerDashboard> {
    const res = await axiosClient.get<TrainerDashboard>(
      "/api/v1/trainers/me/dashboard",
    );
    return res.data;
  },

  /**
   * Get detailed progress analytics for a specific trainee
   * (Trainer only, must be assigned to this trainer)
   * @param traineeId - Trainee user ID
   * @param from - Start date filter (YYYY-MM-DD)
   * @param to - End date filter (YYYY-MM-DD)
   */
  async getTraineeProgress(
    traineeId: number,
    from?: string,
    to?: string,
  ): Promise<TraineeProgress> {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosClient.get<TraineeProgress>(
      `/api/v1/trainers/me/trainees/${traineeId}/progress?${params.toString()}`,
    );
    return res.data;
  },
};
