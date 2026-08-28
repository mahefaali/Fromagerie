import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../features/authentication/hooks/useAuth";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="flex min-h-screen items-center justify-center px-4 text-center"
      >
        <p>Vérification de la session...</p>
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
