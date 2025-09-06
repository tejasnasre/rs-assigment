import type { Rating, Store } from "../types/store";
import type { User } from "../types/user";
import apiClient from "./axios";

interface StoreRatingWithUser extends Omit<Rating, "user"> {
  user: Pick<User, "id" | "name" | "email">;
}

interface StoreWithRatings extends Store {
  ratings: StoreRatingWithUser[];
}

export const storeOwnerApi = {
  /**
   * Get store details for the authenticated store owner
   */
  getMyStore: async (): Promise<{ data: Store }> => {
    return apiClient
      .get("/store-owner/store")
      .then((response) => response.data);
  },

  /**
   * Get all ratings for the authenticated store owner's store
   */
  getStoreRatings: async (): Promise<{ data: StoreRatingWithUser[] }> => {
    return apiClient
      .get("/store-owner/ratings")
      .then((response) => response.data);
  },

  /**
   * Get store with all ratings for the authenticated store owner
   */
  getStoreWithRatings: async (): Promise<{ data: StoreWithRatings }> => {
    return apiClient
      .get("/store-owner/store-with-ratings")
      .then((response) => response.data);
  },
};
