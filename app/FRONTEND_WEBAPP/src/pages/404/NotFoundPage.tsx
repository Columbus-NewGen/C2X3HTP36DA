import type { JSX } from "react";
import { NavLink } from "react-router-dom";
export default function NotFoundPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600">Page Not Found</p>
      <NavLink to="/" className="mt-6 text-blue-500 hover:underline">
        Go to Home Page
      </NavLink>
    </div>
  );
}
