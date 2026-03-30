import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/common.types";

interface RoleGuardProps {
  allowedRoles: Role[];
}

/**
 * RoleGuard: Enforces role-based access.
 * - Must be nested inside AuthGuard.
 * - Redirects to /login if no user (edge case).
 * - Redirects to /unauthorized if user role not in allowedRoles.
 * - Renders <Outlet /> when authorized.
 */
export default function RoleGuard({ allowedRoles }: RoleGuardProps): React.ReactElement {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.includes(user.role);
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
