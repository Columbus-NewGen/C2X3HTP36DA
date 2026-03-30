import axiosClient from "./AxiosClient";

export interface AdminLogReadResponse {
  path: string;
  content: string;
}

export const adminLogApi = {
  async read(path: string): Promise<AdminLogReadResponse> {
    const params = new URLSearchParams();
    params.append("path", path);
    const res = await axiosClient.get<AdminLogReadResponse>(
      `/api/v1/admin/logs/read?${params.toString()}`,
    );
    return res.data;
  },
};
