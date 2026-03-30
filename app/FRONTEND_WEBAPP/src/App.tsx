// src/App.tsx
import React from "react";

import MainLayout from "./layouts/MainLayout";
import WorkoutLayout from "./layouts/WorkoutLayout";
import StandaloneLayout from "./layouts/StandaloneLayout";
import FullScreenLayout from "./layouts/FullScreenLayout";
import AuthGuard from "./layouts/AuthGuard";
import RoleGuard from "./layouts/RoleGuard";
import AppEntryRedirect from "./layouts/AppEntryRedirect";

import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PageLoader } from "./components/ui";

// Lazy Load Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFoundPage = lazy(() => import("./pages/404/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const AuthPage = lazy(() => import("./pages/Auth/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const FloorplanEditorPage = lazy(() => import("./pages/Floorplan/FloorplanEditorPage"));
const FloorplanViewerPage = lazy(() => import("./pages/Floorplan/FloorplanViewerPage"));
const MachinesPage = lazy(() => import("./pages/Machines/MachinesPage"));
const ProgramsPage = lazy(() => import("./pages/Programs/ProgramsPage"));
const ExercisesPage = lazy(() => import("./pages/Exercises/ExercisesPage"));
const MusclesPage = lazy(() => import("./pages/Muscles/MusclesPage"));
const TrainerDashboardPage = lazy(() => import("./pages/Trainer/TrainerDashboardPage"));
const UsersPage = lazy(() => import("./pages/Users/UsersPage"));
const SessionExpiredPage = lazy(() => import("./pages/SessionExpired/SessionExpiredPage"));
const MyprofilePage = lazy(() => import("./pages/Me/MyprofilePage"));
const WorkoutTodayPage = lazy(() => import("./pages/Workout/WorkoutTodayPage"));
const WorkoutCalendarPage = lazy(() => import("./pages/Workout/WorkoutCalendarPage"));
const WorkoutHistoryPage = lazy(() => import("./pages/Workout/WorkoutHistoryPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const LeaderboardPage = lazy(() => import("./pages/Leaderboard/LeaderboardPage"));
const HelpPage = lazy(() => import("./pages/Help"));
const PrivacyPage = lazy(() => import("./pages/Privacy"));
const TermsPage = lazy(() => import("./pages/Terms"));
const AdminLogReaderPage = lazy(() => import("./pages/Admin/AdminLogReaderPage"));

import type { Role } from "./types/common.types";

const TRAINER_ROLES: Role[] = ["trainer", "admin", "root"];
const ADMIN_ROLES: Role[] = ["admin", "root"];
const ALL_ROLES: Role[] = ["user", "trainer", "admin", "root"];

export default function App(): React.ReactElement {
  return (
    <Suspense fallback={<PageLoader message="หุ่นดีรอสักครู่..." />}>
      <Routes>
        {/* Public */}
        <Route element={<StandaloneLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/session-expired" element={<SessionExpiredPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route path="/app" element={<AppEntryRedirect />} />

          {/* User App: workout */}
          <Route element={<RoleGuard allowedRoles={ALL_ROLES} />}>
            <Route element={<WorkoutLayout />}>
              <Route
                path="/workout"
                element={<Navigate to="/workout/today" replace />}
              />
              <Route path="/workout/today" element={<WorkoutTodayPage />} />
              <Route path="/workout/calendar" element={<WorkoutCalendarPage />} />
              <Route path="/workout/history" element={<WorkoutHistoryPage />} />
            </Route>
          </Route>

          {/* Shared Routes: profile, about, help, privacy, leaderboard, programs, exercises */}
          <Route element={<RoleGuard allowedRoles={ALL_ROLES} />}>
            <Route element={<MainLayout />}>
              <Route path="/profile" element={<MyprofilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/muscles" element={<MusclesPage />} />
            </Route>
            <Route element={<FullScreenLayout />}>
              <Route path="/floorplan" element={<FloorplanViewerPage />} />
            </Route>
          </Route>

          {/* Trainer Panel: programs, exercises, dashboard, trainees */}
          <Route element={<RoleGuard allowedRoles={TRAINER_ROLES} />}>
            <Route element={<MainLayout />}>
              <Route
                path="/trainer/dashboard"
                element={<TrainerDashboardPage />}
              />
            </Route>
          </Route>

          {/* Admin Panel: dashboard, users, settings, machines, announcements, floorplan editor */}
          <Route element={<RoleGuard allowedRoles={ADMIN_ROLES} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/machines" element={<MachinesPage />} />
              <Route path="/admin/logs" element={<AdminLogReaderPage />} />
            </Route>
            <Route element={<FullScreenLayout />}>
              <Route
                path="/floorplan/editor/:id?"
                element={<FloorplanEditorPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
