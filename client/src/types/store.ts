import type { User } from "./user";

export type Store = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone?: string;
  overallRating: number;
  ratingCount: number;
  description?: string;
};

export interface Rating {
  id: string;
  storeId: string;
  userId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  review?: string;
}

export interface StoreWithUserRating extends Store {
  userRating: number | null;
}

export interface CreateStoreData {
  name: string;
  address: string;
  ownerId?: string; // If admin creates store, they can assign an owner
}

export interface CreateRatingData {
  storeId: string;
  rating: number;
}
