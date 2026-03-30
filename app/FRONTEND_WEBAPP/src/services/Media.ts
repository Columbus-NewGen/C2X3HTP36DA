/**
 * Media API Service
 * - upload(file, entityType): Upload image/file for a specific entity
 * - getUrl(key): Get the full resolution URL for a media key
 * - delete(key): Remove media from server
 */
import axiosClient from "./AxiosClient";
import type { MediaFile } from "../types/media.types";

export const mediaApi = {
  async upload(
    file: File,
    entityType: "equipment" | "exercise" | "user"
  ): Promise<MediaFile> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity_type", entityType);

    const res = await axiosClient.post<MediaFile>(
      "/api/v1/media/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // API returns: { key, url, file_name, file_size, mime_type }
    // url is relative path like "/api/v1/media/exercise/..."
    return res.data;
  },

  //key as "equipment/5987e84d-ba4c-48fb-85a0-cf59b922bae4.png  "
  //return the url as "https://api.gymmate.site/api/v1/media/equipment/5987e84d-ba4c-48fb-85a0-cf59b922bae4.png"
  async getUrl(key: string): Promise<string> {
    const res = await axiosClient.get<{ url: string }>(`/api/v1/media/${key}`);
    return res.data.url;
  },

  async delete(key: string): Promise<void> {
    await axiosClient.delete(`/api/v1/media/${key}`);
  },
};
