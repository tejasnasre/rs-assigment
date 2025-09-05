import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { UserRole } from "../../types/user";

interface LoginRedirectProps {
  children: React.ReactNode;
}

const LoginRedirect: React.FC<LoginRedirectProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || getDefaultRoute(user.role);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
};

// Helper function to get default route based on user role
const getDefaultRoute = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin/dashboard";
    case UserRole.STORE_OWNER:
      return "/store-owner/dashboard";
    case UserRole.USER:
      return "/user/stores";
    default:
      return "/";
  }
};

export default LoginRedirect;
