import apiClient from "./axios";

export const adminApi = {
  // User management
  getAllUsers: async (filters?: { role?: string; search?: string }) => {
    return apiClient.get("/admin/users", { params: filters });
  },

  getUserDetails: async (userId: string) => {
    return apiClient.get(`/admin/users/${userId}`);
  },

  createNormalUser: async (data: {
    name: string;
    email: string;
    password: string;
    address?: string;
  }) => {
    return apiClient.post("/admin/users/normal", data);
  },

  createAdminUser: async (data: {
    name: string;
    email: string;
    password: string;
    address?: string;
  }) => {
    return apiClient.post("/admin/users/admin", data);
  },

  createStoreOwner: async (data: {
    name: string;
    email: string;
    password: string;
    address?: string;
  }) => {
    return apiClient.post("/admin/users/store-owner", data);
  },

  updateUserRole: async (userId: string, role: string) => {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  // Store management
  getAllStores: async (filters?: {
    name?: string;
    email?: string;
    address?: string;
  }) => {
    return apiClient.get("/admin/stores", { params: filters });
  },

  getStoreById: async (id: string) => {
    return apiClient.get(`/admin/stores/${id}`);
  },

  getStoreOwners: async () => {
    return apiClient.get("/admin/users/store-owners");
  },

  createStore: async (data: {
    name: string;
    email: string;
    address: string;
    description?: string;
    phone?: string;
    ownerId: string;
  }) => {
    return apiClient.post("/admin/create-stores", data);
  },

  // Dashboard
  getDashboardStats: async () => {
    return apiClient.get("/admin/stats");
  },
};
