import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../features/authentication/hooks/useAuth";

export function OwnerOnlyRoute() {
  const { user } = useAuth();

  if (user?.role !== "PROPRIETAIRE") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
