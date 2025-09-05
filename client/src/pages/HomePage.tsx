import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { UserRole } from "../types/user";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Determine the redirect based on user role
  const getRedirectUrl = () => {
    if (!isAuthenticated || !user) return "/login";

    switch (user.role) {
      case UserRole.ADMIN:
        return "/admin/dashboard";
      case UserRole.STORE_OWNER:
        return "/store-owner/dashboard";
      case UserRole.USER:
        return "/user/stores";
      default:
        return "/login";
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Welcome to Store Rating System
          </CardTitle>
          <CardDescription>
            A platform where users can rate stores and store owners can track
            their ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>This application allows users to:</p>
            <ul>
              <li>Create an account and rate stores</li>
              <li>
                Store owners can view their ratings and manage their profile
              </li>
              <li>
                Administrators can manage users, stores, and view analytics
              </li>
            </ul>
            <p>
              Please sign in to access the features relevant to your account
              type.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to={getRedirectUrl()}>
              {isAuthenticated ? "Go to Dashboard" : "Sign In"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HomePage;
