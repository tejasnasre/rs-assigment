import type {
  CreateRatingData,
  CreateStoreData,
  Rating,
  Store,
  StoreWithUserRating,
} from "../types/store";
import { userApi } from "./user";

// Mock stores data
let mockStores: Store[] = [
  {
    id: "1",
    name: "Store One",
    address: "123 Store St",
    ownerId: "3",
    overallRating: 4.2,
    ratingCount: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Store Two",
    address: "456 Store Ave",
    ownerId: "3",
    overallRating: 3.8,
    ratingCount: 12,
    createdAt: new Date().toISOString(),
  },
];

// Add more mock stores
for (let i = 3; i <= 15; i++) {
  mockStores.push({
    id: i.toString(),
    name: `Store ${i}`,
    address: `${i}00 Store Address`,
    ownerId: ((i % 3) + 10).toString(), // Assign to different store owners
    overallRating: Math.round((2 + Math.random() * 3) * 10) / 10, // Rating between 2 and 5
    ratingCount: Math.floor(Math.random() * 30) + 1,
    createdAt: new Date().toISOString(),
  });
}

// Mock ratings data
let mockRatings: Rating[] = [
  {
    id: "1",
    storeId: "1",
    userId: "1",
    rating: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    storeId: "1",
    userId: "2",
    rating: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    storeId: "2",
    userId: "1",
    rating: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Generate some random ratings
for (let i = 4; i <= 30; i++) {
  const storeId = Math.floor(Math.random() * mockStores.length) + 1;
  const userId = Math.floor(Math.random() * 20) + 1;

  mockRatings.push({
    id: i.toString(),
    storeId: storeId.toString(),
    userId: userId.toString(),
    rating: Math.floor(Math.random() * 5) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export const storeApi = {
  getStores: async (filters?: {
    name?: string;
    address?: string;
    userId?: string;
  }) => {
    // In a real app, this would be an actual API call with query params
    // return axios.get(`${API_URL}/stores`, { params: filters });

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredStores = [...mockStores];

        if (filters) {
          if (filters.name) {
            filteredStores = filteredStores.filter((store) =>
              store.name.toLowerCase().includes(filters.name!.toLowerCase())
            );
          }

          if (filters.address) {
            filteredStores = filteredStores.filter((store) =>
              store.address
                .toLowerCase()
                .includes(filters.address!.toLowerCase())
            );
          }

          // Filter stores by owner
          if (filters.userId) {
            filteredStores = filteredStores.filter(
              (store) => store.ownerId === filters.userId
            );
          }
        }

        resolve({
          data: filteredStores,
        });
      }, 500);
    });
  },

  getStoreById: async (id: string) => {
    // In a real app, this would be an actual API call
    // return axios.get(`${API_URL}/stores/${id}`);

    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const store = mockStores.find((s) => s.id === id);

        if (store) {
          resolve({
            data: store,
          });
        } else {
          reject({ message: "Store not found" });
        }
      }, 300);
    });
  },

  // Get stores with the current user's rating included
  getStoresWithUserRating: async (
    userId: string,
    filters?: { name?: string; address?: string }
  ) => {
    // In a real app, this would be an actual API call
    // return axios.get(`${API_URL}/stores/with-user-rating/${userId}`, { params: filters });

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredStores = [...mockStores];

        if (filters) {
          if (filters.name) {
            filteredStores = filteredStores.filter((store) =>
              store.name.toLowerCase().includes(filters.name!.toLowerCase())
            );
          }

          if (filters.address) {
            filteredStores = filteredStores.filter((store) =>
              store.address
                .toLowerCase()
                .includes(filters.address!.toLowerCase())
            );
          }
        }

        const storesWithUserRating: StoreWithUserRating[] = filteredStores.map(
          (store) => {
            const userRating = mockRatings.find(
              (r) => r.storeId === store.id && r.userId === userId
            );

            return {
              ...store,
              userRating: userRating ? userRating.rating : null,
            };
          }
        );

        resolve({
          data: storesWithUserRating,
        });
      }, 500);
    });
  },

  createStore: async (data: CreateStoreData) => {
    // In a real app, this would be an actual API call
    // return axios.post(`${API_URL}/stores`, data);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStore: Store = {
          id: (mockStores.length + 1).toString(),
          name: data.name,
          address: data.address,
          ownerId: data.ownerId || "0", // If no owner is specified
          overallRating: 0,
          ratingCount: 0,
          createdAt: new Date().toISOString(),
        };

        mockStores.push(newStore);

        resolve({
          data: newStore,
        });
      }, 500);
    });
  },

  updateStore: async (id: string, data: Partial<Store>) => {
    // In a real app, this would be an actual API call
    // return axios.put(`${API_URL}/stores/${id}`, data);

    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockStores.findIndex((s) => s.id === id);

        if (index !== -1) {
          mockStores[index] = {
            ...mockStores[index],
            ...data,
          };

          resolve({
            data: mockStores[index],
          });
        } else {
          reject({ message: "Store not found" });
        }
      }, 300);
    });
  },

  deleteStore: async (id: string) => {
    // In a real app, this would be an actual API call
    // return axios.delete(`${API_URL}/stores/${id}`);

    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockStores.findIndex((s) => s.id === id);

        if (index !== -1) {
          const deletedStore = mockStores[index];
          mockStores = mockStores.filter((s) => s.id !== id);

          // Also delete all ratings for this store
          mockRatings = mockRatings.filter((r) => r.storeId !== id);

          resolve({
            data: deletedStore,
          });
        } else {
          reject({ message: "Store not found" });
        }
      }, 300);
    });
  },

  // Rating related functions
  getRatingsForStore: async (storeId: string) => {
    // In a real app, this would be an actual API call
    // return axios.get(`${API_URL}/stores/${storeId}/ratings`);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(async () => {
        const storeRatings = mockRatings.filter((r) => r.storeId === storeId);

        // Add user data to each rating
        const ratingsWithUser = await Promise.all(
          storeRatings.map(async (rating) => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const userResponse: any = await userApi.getUserById(
                rating.userId
              );
              return {
                ...rating,
                user: userResponse.data,
              };
            } catch {
              return rating;
            }
          })
        );

        resolve({
          data: ratingsWithUser,
        });
      }, 500);
    });
  },

  submitRating: async (userId: string, data: CreateRatingData) => {
    // In a real app, this would be an actual API call
    // return axios.post(`${API_URL}/ratings`, { userId, ...data });

    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storeIndex = mockStores.findIndex((s) => s.id === data.storeId);

        if (storeIndex === -1) {
          reject({ message: "Store not found" });
          return;
        }

        // Check if user already rated this store
        const existingRatingIndex = mockRatings.findIndex(
          (r) => r.storeId === data.storeId && r.userId === userId
        );

        if (existingRatingIndex !== -1) {
          // Update existing rating
          const oldRating = mockRatings[existingRatingIndex].rating;
          mockRatings[existingRatingIndex] = {
            ...mockRatings[existingRatingIndex],
            rating: data.rating,
            updatedAt: new Date().toISOString(),
          };

          // Update store overall rating
          const store = mockStores[storeIndex];
          const newAverage =
            (store.overallRating * store.ratingCount -
              oldRating +
              data.rating) /
            store.ratingCount;

          mockStores[storeIndex] = {
            ...store,
            overallRating: parseFloat(newAverage.toFixed(1)),
          };

          resolve({
            data: mockRatings[existingRatingIndex],
          });
        } else {
          // Create new rating
          const newRating: Rating = {
            id: (mockRatings.length + 1).toString(),
            storeId: data.storeId,
            userId,
            rating: data.rating,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          mockRatings.push(newRating);

          // Update store overall rating and count
          const store = mockStores[storeIndex];
          const newAverage =
            (store.overallRating * store.ratingCount + data.rating) /
            (store.ratingCount + 1);

          mockStores[storeIndex] = {
            ...store,
            overallRating: parseFloat(newAverage.toFixed(1)),
            ratingCount: store.ratingCount + 1,
          };

          resolve({
            data: newRating,
          });
        }
      }, 500);
    });
  },

  // Get all ratings submitted by a user
  getUserRatings: async (userId: string) => {
    // In a real app, this would be an actual API call
    // return axios.get(`${API_URL}/users/${userId}/ratings`);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(async () => {
        const userRatings = mockRatings.filter((r) => r.userId === userId);

        // Include store information with each rating
        const ratingsWithStore = await Promise.all(
          userRatings.map(async (rating) => {
            const store = mockStores.find((s) => s.id === rating.storeId);
            return {
              ...rating,
              store,
            };
          })
        );

        resolve({
          data: ratingsWithStore,
        });
      }, 500);
    });
  },

  // Admin dashboard statistics
  getStoreStats: async () => {
    // In a real app, this would be an actual API call
    // return axios.get(`${API_URL}/stores/stats`);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalStores = mockStores.length;
        const totalRatings = mockRatings.length;
        const averageRating =
          mockStores.reduce((sum, store) => sum + store.overallRating, 0) /
          totalStores;

        resolve({
          data: {
            totalStores,
            totalRatings,
            averageRating: parseFloat(averageRating.toFixed(1)),
          },
        });
      }, 300);
    });
  },

  // Store owner dashboard statistics
  getStoreOwnerStats: async (ownerId: string) => {
    // In a real app, this would be an actual API call
    // return axios.get(`${API_URL}/stores/owner/${ownerId}/stats`);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const ownerStores = mockStores.filter((s) => s.ownerId === ownerId);
        const storeIds = ownerStores.map((s) => s.id);

        const storeRatings = mockRatings.filter((r) =>
          storeIds.includes(r.storeId)
        );
        const totalRatings = storeRatings.length;

        const averageRating =
          ownerStores.reduce((sum, store) => sum + store.overallRating, 0) /
          ownerStores.length;

        // Count unique users who rated the owner's stores
        const uniqueUserIds = [...new Set(storeRatings.map((r) => r.userId))];

        resolve({
          data: {
            totalStores: ownerStores.length,
            totalRatings,
            uniqueRaters: uniqueUserIds.length,
            averageRating: parseFloat(averageRating.toFixed(1)),
            storeStats: ownerStores.map((store) => ({
              id: store.id,
              name: store.name,
              rating: store.overallRating,
              ratingCount: store.ratingCount,
            })),
          },
        });
      }, 500);
    });
  },
};
