import { relations } from "drizzle-orm/relations";
import { stores, storeRatings, users } from "./schema.js";

export const storeRatingsRelations = relations(storeRatings, ({ one }) => ({
  store: one(stores, {
    fields: [storeRatings.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [storeRatings.userId],
    references: [users.id],
  }),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  storeRatings: many(storeRatings),
  user: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  storeRatings: many(storeRatings),
  stores: many(stores),
}));
