import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import { AuthContext } from "@/providers/AuthProvider";

export default function ProtectedRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
