import type {
  CreateStoreData,
  Rating,
  Store,
  StoreWithUserRating,
} from "../types/store";
import apiClient from "./axios";

export const storeApi = {
  getAllStores: async (): Promise<{ data: Store[] }> => {
    return apiClient.get("/stores").then((response) => response.data);
  },

  getStoreById: async (id: string): Promise<{ data: Store }> => {
    return apiClient.get(`/stores/${id}`).then((response) => response.data);
  },

  // Get ratings for a specific store
  getRatingsForStore: async (storeId: string): Promise<{ data: Rating[] }> => {
    return apiClient
      .get(`/stores/${storeId}/ratings`)
      .then((response) => response.data);
  },

  getStoreWithUserRating: async (
    storeId: string,
    userId: string
  ): Promise<StoreWithUserRating | null> => {
    return apiClient
      .get(`/stores/${storeId}/user-rating/${userId}`)
      .then((response) => response.data);
  },

  // Function to get multiple stores with user ratings
  getStoresWithUserRating: async (
    // userId: string,
    filters?: {
      name?: string;
      address?: string;
      [key: string]: unknown;
    }
  ): Promise<{ data: StoreWithUserRating[] }> => {
    return apiClient
      .get(`/stores/search`, { params: filters })
      .then((response) => {
        // Transform the response to match the expected format
        const stores = response.data.stores;

        // Add the user's rating to each store
        const storesWithRatings = stores.map(
          (store: {
            id: string;
            name: string;
            address: string;
            email: string;
            phone?: string;
            description?: string;
            averageRating: number;
            totalRatings: number;
            userRating?: number;
          }) => ({
            id: store.id,
            name: store.name,
            address: store.address,
            email: store.email,
            phone: store.phone,
            description: store.description,
            overallRating: store.averageRating,
            ratingCount: store.totalRatings,
            userRating: store.userRating || null,
          })
        );

        return { data: storesWithRatings };
      });
  },

  createStore: async (data: CreateStoreData): Promise<Store> => {
    return apiClient
      .post("/admin/create-stores", data)
      .then((response) => response.data);
  },

  updateStore: async (
    id: string,
    data: Partial<Store>
  ): Promise<Store | null> => {
    return apiClient
      .put(`/stores/${id}`, data)
      .then((response) => response.data);
  },

  deleteStore: async (id: string): Promise<boolean> => {
    return apiClient
      .delete(`/stores/${id}`)
      .then(() => true)
      .catch(() => false);
  },

  rateStore: async (
    storeId: string,
    userId: string,
    rating: number,
    review?: string
  ): Promise<Rating> => {
    return apiClient
      .post(`/stores/${storeId}/ratings`, {
        userId,
        rating,
        review,
      })
      .then((response) => response.data.rating);
  },

  // Alias for rateStore to match function name used in components
  submitRating: async (
    userId: string,
    data: { storeId: string; rating: number; review?: string }
  ): Promise<Rating> => {
    return apiClient
      .post(`/stores/${data.storeId}/ratings`, {
        userId,
        rating: data.rating,
        review: data.review,
      })
      .then((response) => response.data.rating);
  },

  getStoreRatings: async (storeId: string): Promise<Rating[]> => {
    return apiClient
      .get(`/stores/${storeId}/ratings`)
      .then((response) => response.data);
  },

  getUserRatings: async (userId: string): Promise<Rating[]> => {
    return apiClient
      .get(`/users/${userId}/ratings`)
      .then((response) => response.data);
  },
};
