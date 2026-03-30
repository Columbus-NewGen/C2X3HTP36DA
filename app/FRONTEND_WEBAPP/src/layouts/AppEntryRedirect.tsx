import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRouteForRole } from "../constants/routes";

/**
 * Redirects authenticated users to their role-specific default route.
 * Mount under AuthGuard; use for /app and post-login flows.
 */
export default function AppEntryRedirect(): React.ReactElement {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}
