import type { Role } from "../types/common.types";

// Application Routes
export const ROUTES = {
  announcements: "/announcements",
  announcementDetail: (id: string) => `/announcements/${id}`,
  machines: "/machines",
  machineDetail: (id: string) => `/machines/${id}`,
  floorplan: "/floorplan",
  users: "/users",
  dashboard: "/dashboard",
  trainerDashboard: "/trainer/dashboard",
  workout: "/workout/today",
  programs: "/programs",
  leaderboard: "/leaderboard",
  exercises: "/exercises",
  muscles: "/muscles",
  app: "/app",
} as const;

/** Default route per role (used for post-login and "go to app" redirects) */
export function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case "user":
      return ROUTES.workout;
    case "trainer":
      return ROUTES.programs;
    case "admin":
    case "root":
      return ROUTES.dashboard;
    default:
      return "/";
  }
}
