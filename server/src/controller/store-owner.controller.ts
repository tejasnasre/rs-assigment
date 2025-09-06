import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { stores, storeRatings, users } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

/**
 * Get the store owned by the authenticated store owner
 */
export const getStoreOwnerStore = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is a store owner
    if (req.user.role !== "store_owner") {
      return res
        .status(403)
        .json({ message: "Access denied. Store owner role required." });
    }

    // Get the store owned by the authenticated user
    const storeResult = await db
      .select({
        id: stores.id,
        name: stores.name,
        address: stores.address,
        email: stores.email,
        phone: stores.phone,
        description: stores.description,
        averageRating: stores.averageRating,
        totalRatings: stores.totalRatings,
        createdAt: stores.createdAt,
      })
      .from(stores)
      .where(
        sql`${stores.ownerId} = ${req.user.userId} AND ${stores.isActive} = true`
      )
      .limit(1);

    if (storeResult.length === 0) {
      return res.status(404).json({ message: "No store found for this owner" });
    }

    const storeData = storeResult[0];
    if (!storeData) {
      return res.status(404).json({ message: "No store found for this owner" });
    }

    // Format response to match client-side expected structure
    const store = {
      id: storeData.id,
      name: storeData.name,
      address: storeData.address,
      email: storeData.email,
      phone: storeData.phone,
      description: storeData.description,
      overallRating: storeData.averageRating,
      ratingCount: storeData.totalRatings,
      createdAt: storeData.createdAt,
    };

    res.status(200).json({ data: store });
  } catch (error) {
    console.error("Error fetching store owner's store:", error);
    res.status(500).json({ message: "Failed to fetch store information" });
  }
};

/**
 * Get all ratings for the store owned by the authenticated store owner
 */
export const getStoreOwnerRatings = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is a store owner
    if (req.user.role !== "store_owner") {
      return res
        .status(403)
        .json({ message: "Access denied. Store owner role required." });
    }

    // First, get the store ID
    const storeResult = await db
      .select({ id: stores.id })
      .from(stores)
      .where(
        sql`${stores.ownerId} = ${req.user.userId} AND ${stores.isActive} = true`
      )
      .limit(1);

    if (storeResult.length === 0) {
      return res.status(404).json({ message: "No store found for this owner" });
    }

    const storeData = storeResult[0];
    if (!storeData || !storeData.id) {
      return res.status(404).json({ message: "Store ID not found" });
    }

    // Get all ratings with user information
    const ratingsResult = await db
      .select({
        id: storeRatings.id,
        storeId: storeRatings.storeId,
        userId: storeRatings.userId,
        rating: storeRatings.rating,
        review: storeRatings.review,
        createdAt: storeRatings.createdAt,
        updatedAt: storeRatings.updatedAt,
        // User information
        userName: users.name,
        userEmail: users.email,
      })
      .from(storeRatings)
      .leftJoin(users, eq(storeRatings.userId, users.id))
      .where(eq(storeRatings.storeId, storeData.id))
      .orderBy(sql`${storeRatings.createdAt} DESC`);

    // Format the ratings to match client-side expected structure
    const formattedRatings = ratingsResult.map((rating) => ({
      id: rating.id,
      storeId: rating.storeId,
      userId: rating.userId,
      rating: rating.rating,
      review: rating.review,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      user: {
        id: rating.userId,
        name: rating.userName,
        email: rating.userEmail,
      },
    }));

    res.status(200).json({ data: formattedRatings });
  } catch (error) {
    console.error("Error fetching store ratings:", error);
    res.status(500).json({ message: "Failed to fetch store ratings" });
  }
};

/**
 * Get store with all ratings for the authenticated store owner
 */
export const getStoreWithRatings = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is a store owner
    if (req.user.role !== "store_owner") {
      return res
        .status(403)
        .json({ message: "Access denied. Store owner role required." });
    }

    // Get the store owned by the authenticated user
    const storeResult = await db
      .select({
        id: stores.id,
        name: stores.name,
        address: stores.address,
        email: stores.email,
        phone: stores.phone,
        description: stores.description,
        averageRating: stores.averageRating,
        totalRatings: stores.totalRatings,
        createdAt: stores.createdAt,
      })
      .from(stores)
      .where(
        sql`${stores.ownerId} = ${req.user.userId} AND ${stores.isActive} = true`
      )
      .limit(1);

    if (storeResult.length === 0) {
      return res.status(404).json({ message: "No store found for this owner" });
    }

    const storeData = storeResult[0];
    if (!storeData || !storeData.id) {
      return res.status(404).json({ message: "Store data not found" });
    }

    // Get all ratings with user information
    const ratingsResult = await db
      .select({
        id: storeRatings.id,
        storeId: storeRatings.storeId,
        userId: storeRatings.userId,
        rating: storeRatings.rating,
        review: storeRatings.review,
        createdAt: storeRatings.createdAt,
        updatedAt: storeRatings.updatedAt,
        // User information
        userName: users.name,
        userEmail: users.email,
      })
      .from(storeRatings)
      .leftJoin(users, eq(storeRatings.userId, users.id))
      .where(eq(storeRatings.storeId, storeData.id))
      .orderBy(sql`${storeRatings.createdAt} DESC`);

    // Format the ratings to match client-side expected structure
    const formattedRatings = ratingsResult.map((rating) => ({
      id: rating.id,
      storeId: rating.storeId,
      userId: rating.userId,
      rating: rating.rating,
      review: rating.review,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      user: {
        id: rating.userId,
        name: rating.userName,
        email: rating.userEmail,
      },
    }));

    // Format store data
    const formattedStore = {
      id: storeData.id,
      name: storeData.name,
      address: storeData.address,
      email: storeData.email,
      phone: storeData.phone,
      description: storeData.description,
      overallRating: storeData.averageRating,
      ratingCount: storeData.totalRatings,
      createdAt: storeData.createdAt,
      ratings: formattedRatings,
    };

    res.status(200).json({ data: formattedStore });
  } catch (error) {
    console.error("Error fetching store with ratings:", error);
    res.status(500).json({ message: "Failed to fetch store information" });
  }
};
