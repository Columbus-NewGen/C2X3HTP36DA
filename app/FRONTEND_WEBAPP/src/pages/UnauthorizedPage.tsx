import type { JSX } from "react";
import { NavLink } from "react-router-dom";

export default function UnauthorizedPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-2">Access Denied</p>
      <p className="text-gray-500 mb-6">You do not have permission to view this page.</p>
      <div className="flex gap-4">
        <NavLink to="/" className="text-blue-500 hover:underline">
          Go to Home
        </NavLink>
        <NavLink to="/login" className="text-blue-500 hover:underline">
          Sign in
        </NavLink>
      </div>
    </div>
  );
}
