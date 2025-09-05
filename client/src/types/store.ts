import type { User } from "./user";

export interface Store {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  overallRating: number;
  ratingCount: number;
  createdAt: string;
}

export interface Rating {
  id: string;
  storeId: string;
  userId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
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
