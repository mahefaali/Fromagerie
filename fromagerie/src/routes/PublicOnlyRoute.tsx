import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../features/authentication/hooks/useAuth";

export function PublicOnlyRoute() {
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

  if (status === "authenticated") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
