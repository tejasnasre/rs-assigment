import axios from "axios";

// API base URL
const API_URL = "http://localhost:3000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This allows cookies to be sent with requests
});

// Add request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try to get the token from localStorage
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.user?.token) {
          config.headers.Authorization = `Bearer ${state.user.token}`;
        }
      } catch (error) {
        console.error("Error parsing auth storage", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
