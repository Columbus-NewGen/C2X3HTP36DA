/**
 * Common Types
 * Shared types across all modules
 */

export type MachineStatus = "ACTIVE" | "MAINTENANCE";

export type Role = "root" | "admin" | "trainer" | "user";

// "image_url": "user/550e8400-e29b-41d4-a716-446655440000.jpg",
// "image_full_url": "/api/v1/media/user/550e8400-e29b-41d4-a716-446655440000.jpg"
// called as "https://api.gymmate.site/api/v1/media/user/550e8400-e29b-41d4-a716-446655440000.jpg"
export type ImageUrl = {
  image_url?: string;
  image_full_url?: string;
};
