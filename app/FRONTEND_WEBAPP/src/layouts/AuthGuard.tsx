import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PageLoader } from "../components/ui";

/**
 * AuthGuard: Protects routes from unauthenticated access.
 * - Checks isBootstrapping (shows loading)
 * - Redirects to /login if not authenticated
 * - Renders <Outlet /> when authenticated
 * - NO role logic; use RoleGuard for authorization.
 */
export default function AuthGuard(): React.ReactElement {
  const { isBootstrapping, isAuthenticated } = useAuth();

  if (isBootstrapping) {
    return <PageLoader message="Loading..." variant="compact" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
