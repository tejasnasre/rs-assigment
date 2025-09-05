import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { UserRole } from "../../types/user";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role if trying to access unauthorized route
    if (user.role === UserRole.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === UserRole.STORE_OWNER) {
      return <Navigate to="/store-owner/dashboard" replace />;
    } else {
      return <Navigate to="/user/stores" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
