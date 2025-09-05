import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { Button } from "../ui/button";
import { UserRole } from "../../types/user";

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate("/login");
  };

  // Function to display a formatted role name
  const getRoleName = (role?: UserRole) => {
    if (!role) return "";

    switch (role) {
      case UserRole.ADMIN:
        return "System Administrator";
      case UserRole.USER:
        return "Normal User";
      case UserRole.STORE_OWNER:
        return "Store Owner";
      default:
        return role;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center">
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            Store Rating System
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          {user?.name} ({getRoleName(user?.role)})
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
