import { db } from "../db/index.js";
import { stores, storeRatings } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

/**
 * Recalculates and updates the average rating and total ratings for a store
 * @param storeId The ID of the store to update
 */
export const recalculateStoreRating = async (
  storeId: string
): Promise<void> => {
  try {
    // Get all ratings for the store
    const ratingsResult = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${storeRatings.rating}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(storeRatings)
      .where(eq(storeRatings.storeId, storeId));

    if (!ratingsResult[0]) {
      throw new Error(`No ratings result found for store ${storeId}`);
    }

    const averageRating = ratingsResult[0].averageRating;
    const count = ratingsResult[0].count;

    // Update the store with the new average rating and count
    await db
      .update(stores)
      .set({
        averageRating: averageRating.toString(),
        totalRatings: count,
      })
      .where(eq(stores.id, storeId));
  } catch (error) {
    console.error(`Error recalculating rating for store ${storeId}:`, error);
    throw error;
  }
};
