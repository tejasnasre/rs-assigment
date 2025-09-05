import type { RouteObject } from "react-router-dom";
import { UserRole } from "../types/user";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/routing/ProtectedRoute";
import LoginRedirect from "../components/routing/LoginRedirect";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersList from "../pages/admin/UsersList";
import StoresList from "../pages/admin/StoresList";
import RatingsList from "../pages/admin/RatingsList";
import CreateUser from "../pages/admin/CreateUser";
import CreateStore from "../pages/admin/CreateStore";
import UserDetails from "../pages/admin/UserDetails";
import StoreDetails from "../pages/admin/StoreDetails";

// Store owner pages
import StoreOwnerDashboard from "../pages/store-owner/StoreOwnerDashboard";
import StoreOwnerRatings from "../pages/store-owner/StoreOwnerRatings";
import StoreOwnerProfile from "../pages/store-owner/StoreOwnerProfile";

// Normal user pages
import UserStores from "../pages/user/UserStores";
import UserRatings from "../pages/user/UserRatings";
import UserProfile from "../pages/user/UserProfile";
import StoreView from "../pages/user/StoreView";

// Routes configuration
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // Admin routes
      {
        path: "admin",
        element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]} />,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "users",
            element: <UsersList />,
          },
          {
            path: "users/create",
            element: <CreateUser />,
          },
          {
            path: "users/:id",
            element: <UserDetails />,
          },
          {
            path: "stores",
            element: <StoresList />,
          },
          {
            path: "stores/create",
            element: <CreateStore />,
          },
          {
            path: "stores/:id",
            element: <StoreDetails />,
          },
          {
            path: "ratings",
            element: <RatingsList />,
          },
        ],
      },
      // Store owner routes
      {
        path: "store-owner",
        element: <ProtectedRoute allowedRoles={[UserRole.STORE_OWNER]} />,
        children: [
          {
            path: "dashboard",
            element: <StoreOwnerDashboard />,
          },
          {
            path: "ratings",
            element: <StoreOwnerRatings />,
          },
          {
            path: "profile",
            element: <StoreOwnerProfile />,
          },
        ],
      },
      // Normal user routes
      {
        path: "user",
        element: <ProtectedRoute allowedRoles={[UserRole.USER]} />,
        children: [
          {
            path: "stores",
            element: <UserStores />,
          },
          {
            path: "stores/:id",
            element: <StoreView />,
          },
          {
            path: "ratings",
            element: <UserRatings />,
          },
          {
            path: "profile",
            element: <UserProfile />,
          },
        ],
      },
    ],
  },
  // Auth routes
  {
    path: "/login",
    element: (
      <LoginRedirect>
        <LoginPage />
      </LoginRedirect>
    ),
  },
  {
    path: "/register",
    element: (
      <LoginRedirect>
        <RegisterPage />
      </LoginRedirect>
    ),
  },
  // 404 route
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
