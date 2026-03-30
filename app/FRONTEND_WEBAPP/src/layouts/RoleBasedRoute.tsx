import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/common.types";

interface RoleBasedRouteProps {
  /**
   * Roles that are allowed to access this route
   * If not provided, defaults to admin roles only
   */
  allowedRoles?: Role[];
}

/**
 * RoleBasedRoute Component
 * Protects routes based on user role
 * - "user" role: Only access LandingPage
 * - "admin", "trainer", "root" roles: Access all pages
 */
export default function RoleBasedRoute({
  allowedRoles = ["root", "admin", "trainer"],
}: RoleBasedRouteProps) {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  // Show loading while checking auth status
  if (isBootstrapping) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no user data, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  const userRole = user.role;
  const hasAccess = allowedRoles.includes(userRole);

  // If user role is "user", redirect to LandingPage
  if (userRole === "user") {
    return <Navigate to="/" replace />;
  }

  // If user role is not in allowed roles, redirect to LandingPage
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  // User has access, render the route
  return <Outlet />;
}
