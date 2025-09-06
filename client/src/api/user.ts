import type { SignUpData, User } from "../types/user";
import apiClient from "./axios";

export const userApi = {
  getUsers: async (filters?: {
    name?: string;
    email?: string;
    address?: string;
    role?: string;
  }) => {
    return apiClient.get("/users", { params: filters });
  },

  getUserById: async (id: string) => {
    return apiClient.get(`/users/${id}`);
  },

  createUser: async (data: SignUpData) => {
    return apiClient.post("/users", data);
  },

  updateUser: async (id: string, data: Partial<User>) => {
    return apiClient.put(`/users/${id}`, data);
  },

  deleteUser: async (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },

  // Admin dashboard statistics
  getUserStats: async () => {
    return apiClient.get("/users/stats");
  },

  // Get all store owners for admin to assign to stores
  getStoreOwners: async (): Promise<
    { id: string; name: string; email: string }[]
  > => {
    // Real API implementation
    return apiClient
      .get("/admin/users/store-owners")
      .then((response) => response.data);
  },
};
