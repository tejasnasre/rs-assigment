import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { stores, storeRatings } from "../db/schema.js";
import { eq, asc, desc, like, sql } from "drizzle-orm";

/**
 * Get a list of all active stores
 * This can be used by any authenticated user
 */
export const getAllStores = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Optional sorting
    const sortBy = (req.query.sortBy as string) || "name";
    const sortOrder = (req.query.sortOrder as string) || "asc";

    // Determine sort expression based on parameters
    let sortExpression;
    if (sortBy === "name") {
      sortExpression =
        sortOrder.toLowerCase() === "desc"
          ? desc(stores.name)
          : asc(stores.name);
    } else if (sortBy === "averageRating") {
      sortExpression =
        sortOrder.toLowerCase() === "desc"
          ? desc(stores.averageRating)
          : asc(stores.averageRating);
    } else {
      sortExpression =
        sortOrder.toLowerCase() === "desc"
          ? desc(stores.createdAt)
          : asc(stores.createdAt);
    }

    // Get stores with pagination
    const storeResults = await db
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
      .where(eq(stores.isActive, true))
      .orderBy(sortExpression)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination info
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(stores)
      .where(eq(stores.isActive, true));

    const totalStores = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalStores / limit);

    res.status(200).json({
      stores: storeResults,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalStores,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Failed to fetch stores" });
  }
};

/**
 * Search for stores by name and/or address
 * This can be used by any authenticated user
 */
export const searchStores = async (req: Request, res: Response) => {
  try {
    // Get search parameters
    const { name, address } = req.query;

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Start with base condition
    let whereClause = eq(stores.isActive, true);

    // Add name filter if provided
    if (name) {
      whereClause = sql`${whereClause} AND ${like(stores.name, `%${name}%`)}`;
    }

    // Add address filter if provided
    if (address) {
      whereClause = sql`${whereClause} AND ${like(
        stores.address,
        `%${address}%`
      )}`;
    }

    // Execute query with conditions
    const storeResults = await db
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
      .where(whereClause)
      .orderBy(asc(stores.name))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination info with the same filters
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(stores)
      .where(whereClause);

    const totalStores = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalStores / limit);

    res.status(200).json({
      stores: storeResults,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalStores,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error searching stores:", error);
    res.status(500).json({ message: "Failed to search stores" });
  }
};

/**
 * Get detailed information about a specific store, including user's rating if any
 */
export const getStoreDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    // Get store details
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
      .where(sql`${stores.id} = ${storeId} AND ${stores.isActive} = true`)
      .limit(1);

    if (storeResult.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const store = storeResult[0];

    // Get user's rating for this store if exists
    const userRatingResult = await db
      .select({
        id: storeRatings.id,
        rating: storeRatings.rating,
        review: storeRatings.review,
        createdAt: storeRatings.createdAt,
        updatedAt: storeRatings.updatedAt,
      })
      .from(storeRatings)
      .where(
        sql`${storeRatings.storeId} = ${storeId} AND ${storeRatings.userId} = ${req.user.userId}`
      )
      .limit(1);

    const userRating = userRatingResult.length > 0 ? userRatingResult[0] : null;

    // Return combined information
    res.status(200).json({
      store,
      userRating,
    });
  } catch (error) {
    console.error("Error fetching store details:", error);
    res.status(500).json({ message: "Failed to fetch store details" });
  }
};

/**
 * Submit a rating for a store
 */
export const submitStoreRating = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { storeId } = req.params;
    const { rating, review } = req.body;

    if (!storeId) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    // Validate rating
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if store exists and is active
    const storeExists = await db
      .select({ id: stores.id })
      .from(stores)
      .where(sql`${stores.id} = ${storeId} AND ${stores.isActive} = true`)
      .limit(1);

    if (storeExists.length === 0) {
      return res.status(404).json({ message: "Store not found or inactive" });
    }

    // Check if user already rated this store
    const existingRating = await db
      .select({ id: storeRatings.id })
      .from(storeRatings)
      .where(
        sql`${storeRatings.storeId} = ${storeId} AND ${storeRatings.userId} = ${req.user.userId}`
      )
      .limit(1);

    if (existingRating.length > 0) {
      return res.status(409).json({
        message:
          "You have already rated this store. Use the update endpoint instead.",
      });
    }

    // Create new rating
    const result = await db
      .insert(storeRatings)
      .values({
        userId: req.user.userId,
        storeId,
        rating,
        review: review || null,
      })
      .returning();

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: result[0],
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Failed to submit rating" });
  }
};

/**
 * Update an existing rating for a store
 */
export const updateStoreRating = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { storeId } = req.params;
    const { rating, review } = req.body;

    if (!storeId) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    // Validate rating
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user's rating exists
    const existingRating = await db
      .select({ id: storeRatings.id })
      .from(storeRatings)
      .where(
        sql`${storeRatings.storeId} = ${storeId} AND ${storeRatings.userId} = ${req.user.userId}`
      )
      .limit(1);

    if (existingRating.length === 0) {
      return res.status(404).json({
        message:
          "You haven't rated this store yet. Submit a new rating instead.",
      });
    }

    // Update rating
    const result = await db
      .update(storeRatings)
      .set({
        rating,
        review: review || null,
        updatedAt: new Date().toISOString(),
      })
      .where(
        sql`${storeRatings.storeId} = ${storeId} AND ${storeRatings.userId} = ${req.user.userId}`
      )
      .returning();

    res.status(200).json({
      message: "Rating updated successfully",
      rating: result[0],
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Failed to update rating" });
  }
};
