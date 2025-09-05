import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/auth";
import { UserRole } from "../../types/user";
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  Settings,
  Home,
} from "lucide-react";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100",
        active && "bg-gray-100 text-gray-900"
      )}
    >
      <span className="mr-3">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  // Define navigation items based on user role
  const getNavItems = () => {
    const path = location.pathname;

    const commonItems = [
      {
        to: "/",
        icon: <Home size={20} />,
        label: "Home",
        active: path === "/",
      },
    ];

    if (user.role === UserRole.ADMIN) {
      return [
        ...commonItems,
        {
          to: "/admin/dashboard",
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard",
          active: path === "/admin/dashboard",
        },
        {
          to: "/admin/users",
          icon: <Users size={20} />,
          label: "Users",
          active: path.startsWith("/admin/users"),
        },
        {
          to: "/admin/stores",
          icon: <Store size={20} />,
          label: "Stores",
          active: path.startsWith("/admin/stores"),
        },
        {
          to: "/admin/ratings",
          icon: <Star size={20} />,
          label: "Ratings",
          active: path.startsWith("/admin/ratings"),
        },
      ];
    } else if (user.role === UserRole.STORE_OWNER) {
      return [
        ...commonItems,
        {
          to: "/store-owner/dashboard",
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard",
          active: path === "/store-owner/dashboard",
        },
        {
          to: "/store-owner/ratings",
          icon: <Star size={20} />,
          label: "Ratings",
          active: path.startsWith("/store-owner/ratings"),
        },
        {
          to: "/store-owner/profile",
          icon: <Settings size={20} />,
          label: "Profile",
          active: path === "/store-owner/profile",
        },
      ];
    } else {
      // Normal user
      return [
        ...commonItems,
        {
          to: "/user/stores",
          icon: <Store size={20} />,
          label: "Stores",
          active: path.startsWith("/user/stores"),
        },
        {
          to: "/user/ratings",
          icon: <Star size={20} />,
          label: "My Ratings",
          active: path === "/user/ratings",
        },
        {
          to: "/user/profile",
          icon: <Settings size={20} />,
          label: "Profile",
          active: path === "/user/profile",
        },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Store Rating App</h2>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item, index) => (
          <NavItem
            key={index}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={item.active}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
