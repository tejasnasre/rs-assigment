import apiClient from "./axios";
import axios from "axios"; // Keep for isAxiosError
import type { SignInData, SignUpData } from "../types/user";

export const authApi = {
  login: async (data: SignInData) => {
    try {
      const response = await apiClient.post("/auth/login", data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw { message: "Login failed" };
    }
  },

  register: async (data: SignUpData) => {
    try {
      const response = await apiClient.post("/auth/signup", data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw { message: "Registration failed" };
    }
  },

  logout: async () => {
    try {
      // Call the server-side logout endpoint to clear the cookie
      const response = await apiClient.post("/auth/logout");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw { message: "Logout failed" };
    }
  },

  getCurrentUser: async () => {
    try {
      // To implement this, we would need a /profile endpoint on the backend
      // For now, we'll rely on the stored user in localStorage via zustand persist
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
            ?.token
        : null;

      if (!token) {
        throw new Error("No authentication token found");
      }

      // This can be implemented when you have a profile endpoint
      // const response = await apiClient.get('/auth/profile');
      // return response;

      // For now, return the stored user
      const storedUser = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
        : null;

      return Promise.resolve({ data: storedUser });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: "Failed to get current user" };
    }
  },
};
