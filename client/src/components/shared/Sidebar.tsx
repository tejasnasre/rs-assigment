import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/auth";
import { UserRole } from "../../types/user";
import {
  LayoutDashboard,
  Users,
  Store,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  active,
  isCollapsed,
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100",
              active && "bg-gray-100 text-gray-900"
            )}
          >
            <span className="mr-3">{icon}</span>
            {!isCollapsed && (
              <span className="text-sm font-medium">{label}</span>
            )}
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside
      className={cn(
        "bg-white border-r border-gray-200 min-h-screen transition-all duration-300 flex-shrink-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "px-6 py-4 border-b border-gray-200 flex items-center justify-between",
          isCollapsed && "px-4 justify-center"
        )}
      >
        {!isCollapsed && (
          <h2 className="text-xl font-semibold">Store Rating</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item, index) => (
          <NavItem
            key={index}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={item.active}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
