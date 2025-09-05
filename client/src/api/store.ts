import type {
  CreateStoreData,
  Rating,
  Store,
  StoreWithUserRating,
} from "../types/store";
// Import apiClient but comment it out since we're using mock data for now
// import apiClient from "./axios";

const mockStores: Store[] = [
  {
    id: "1",
    name: "Store 1",
    address: "123 Store St",
    email: "store1@example.com",
    phone: "123-456-7890",
    overallRating: 4.5,
    ratingCount: 10,
    description: "A great store with excellent products",
  },
  {
    id: "2",
    name: "Store 2",
    address: "456 Shop Ave",
    email: "store2@example.com",
    phone: "098-765-4321",
    overallRating: 3.8,
    ratingCount: 5,
    description: "Quality products at affordable prices",
  },
  {
    id: "3",
    name: "Store 3",
    address: "789 Retail Blvd",
    email: "store3@example.com",
    overallRating: 4.2,
    ratingCount: 15,
    description: "Your one-stop shop for all needs",
  },
];

// Mock ratings data
const mockRatings: Rating[] = [
  {
    id: "1",
    storeId: "1",
    userId: "2",
    rating: 5,
    review: "Excellent service and products!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    storeId: "1",
    userId: "3",
    rating: 4,
    review: "Good experience overall.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    storeId: "2",
    userId: "2",
    rating: 3,
    review: "Average experience, could be better.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const storeApi = {
  getAllStores: async (): Promise<Store[]> => {
    // In a real app, this would be an API call
    // return apiClient.get('/stores').then(response => response.data);
    return Promise.resolve(mockStores);
  },

  getStoreById: async (id: string): Promise<{ data: Store }> => {
    // In a real app, this would be an API call
    // return apiClient.get(`/stores/${id}`).then(response => response.data);
    const store = mockStores.find((s) => s.id === id);
    if (!store) {
      throw new Error(`Store with id ${id} not found`);
    }
    return Promise.resolve({ data: store });
  },

  // Additional method that returns data in the expected format for StoreView.tsx
  getRatingsForStore: async (storeId: string): Promise<{ data: Rating[] }> => {
    // In a real app, this would be an API call
    // return apiClient.get(`/stores/${storeId}/ratings`).then(response => response.data);
    const ratings = mockRatings.filter((r) => r.storeId === storeId);
    return Promise.resolve({ data: ratings });
  },

  getStoreWithUserRating: async (
    storeId: string,
    userId: string
  ): Promise<StoreWithUserRating | null> => {
    // In a real app, this would be an API call
    // return apiClient.get(`/stores/${storeId}/user-rating/${userId}`).then(response => response.data);
    const store = mockStores.find((s) => s.id === storeId);
    if (!store) return Promise.resolve(null);

    const userRating =
      mockRatings.find((r) => r.storeId === storeId && r.userId === userId)
        ?.rating || null;
    return Promise.resolve({
      ...store,
      userRating,
    });
  },

  // Function to get multiple stores with user ratings
  getStoresWithUserRating: async (
    userId: string,
    filters?: {
      name?: string;
      minRating?: number;
      [key: string]: unknown;
    }
  ): Promise<{ data: StoreWithUserRating[] }> => {
    // In a real app, this would be an API call with filters
    // return apiClient.get(`/stores/user-rating/${userId}`, { params: filters }).then(response => response.data);

    let filteredStores = [...mockStores];

    // Apply filters if provided
    if (filters) {
      if (filters.name && typeof filters.name === "string") {
        filteredStores = filteredStores.filter((s) =>
          s.name.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }

      if (filters.minRating && typeof filters.minRating === "number") {
        filteredStores = filteredStores.filter(
          (s) => s.overallRating >= filters.minRating!
        );
      }
    }

    // Add user ratings to stores
    const storesWithRatings: StoreWithUserRating[] = filteredStores.map(
      (store) => {
        const userRating =
          mockRatings.find((r) => r.storeId === store.id && r.userId === userId)
            ?.rating || null;
        return {
          ...store,
          userRating,
        };
      }
    );

    return Promise.resolve({ data: storesWithRatings });
  },

  createStore: async (data: CreateStoreData): Promise<Store> => {
    // In a real app, this would be an API call
    // return apiClient.post('/stores', data).then(response => response.data);
    const newStore: Store = {
      id: `${mockStores.length + 1}`,
      name: data.name,
      address: data.address,
      email: `${data.name.toLowerCase().replace(/\s+/g, "")}@example.com`, // Generate email based on name
      overallRating: 0,
      ratingCount: 0,
      description: `This is ${data.name} located at ${data.address}`,
    };
    mockStores.push(newStore);
    return Promise.resolve(newStore);
  },

  updateStore: async (
    id: string,
    data: Partial<Store>
  ): Promise<Store | null> => {
    // In a real app, this would be an API call
    // return apiClient.put(`/stores/${id}`, data).then(response => response.data);
    const storeIndex = mockStores.findIndex((s) => s.id === id);
    if (storeIndex === -1) return Promise.resolve(null);

    mockStores[storeIndex] = {
      ...mockStores[storeIndex],
      ...data,
    };
    return Promise.resolve(mockStores[storeIndex]);
  },

  deleteStore: async (id: string): Promise<boolean> => {
    // In a real app, this would be an API call
    // return apiClient.delete(`/stores/${id}`).then(() => true).catch(() => false);
    const storeIndex = mockStores.findIndex((s) => s.id === id);
    if (storeIndex === -1) return Promise.resolve(false);

    mockStores.splice(storeIndex, 1);
    return Promise.resolve(true);
  },

  rateStore: async (
    storeId: string,
    userId: string,
    rating: number,
    review?: string
  ): Promise<Rating> => {
    // In a real app, this would be an API call
    // return apiClient.post(`/stores/${storeId}/ratings`, { userId, rating, review }).then(response => response.data);

    const existingRatingIndex = mockRatings.findIndex(
      (r) => r.storeId === storeId && r.userId === userId
    );
    const now = new Date().toISOString();

    if (existingRatingIndex !== -1) {
      // Update existing rating
      mockRatings[existingRatingIndex] = {
        ...mockRatings[existingRatingIndex],
        rating,
        review: review || mockRatings[existingRatingIndex].review,
        updatedAt: now,
      };
      return Promise.resolve(mockRatings[existingRatingIndex]);
    } else {
      // Create new rating
      const newRating: Rating = {
        id: `${mockRatings.length + 1}`,
        storeId,
        userId,
        rating,
        review: review || "",
        createdAt: now,
        updatedAt: now,
      };
      mockRatings.push(newRating);

      // Update store rating
      const store = mockStores.find((s) => s.id === storeId);
      if (store) {
        const newRatingCount = store.ratingCount + 1;
        const newOverallRating =
          (store.overallRating * store.ratingCount + rating) / newRatingCount;
        store.ratingCount = newRatingCount;
        store.overallRating = newOverallRating;
      }

      return Promise.resolve(newRating);
    }
  },

  // Alias for rateStore to match function name used in components
  submitRating: async (
    userId: string,
    data: { storeId: string; rating: number; review?: string }
  ): Promise<Rating> => {
    return storeApi.rateStore(data.storeId, userId, data.rating, data.review);
  },

  getStoreRatings: async (storeId: string): Promise<Rating[]> => {
    // In a real app, this would be an API call
    // return apiClient.get(`/stores/${storeId}/ratings`).then(response => response.data);
    return Promise.resolve(mockRatings.filter((r) => r.storeId === storeId));
  },

  getUserRatings: async (userId: string): Promise<Rating[]> => {
    // In a real app, this would be an API call
    // return apiClient.get(`/users/${userId}/ratings`).then(response => response.data);
    return Promise.resolve(mockRatings.filter((r) => r.userId === userId));
  },
};
