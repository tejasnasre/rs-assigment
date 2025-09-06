import {
  pgTable,
  index,
  foreignKey,
  unique,
  pgPolicy,
  uuid,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

/**
 * Helper class to manage Row Level Security (RLS) context in PostgreSQL
 * Sets the current user ID in the PostgreSQL session for policy enforcement
 */
export class RLSContext {
  /**
   * Sets the user ID in the PostgreSQL session for RLS policies
   * @param db Database connection
   * @param userId User ID to set in context
   */
  static async setUserContext(
    db: PostgresJsDatabase<Record<string, unknown>>,
    userId: string
  ): Promise<void> {
    await db.execute(
      sql`SELECT set_config('app.current_user_id', ${userId}, false)`
    );
  }
}

export const userRole = pgEnum("user_role", [
  "system_administrator",
  "normal_user",
  "store_owner",
]);

export const storeRatings = pgTable(
  "store_ratings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    storeId: uuid("store_id").notNull(),
    rating: integer().notNull(),
    review: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("store_ratings_created_at_idx").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamp_ops")
    ),
    index("store_ratings_rating_idx").using(
      "btree",
      table.rating.asc().nullsLast().op("int4_ops")
    ),
    index("store_ratings_store_id_idx").using(
      "btree",
      table.storeId.asc().nullsLast().op("uuid_ops")
    ),
    index("store_ratings_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.storeId],
      foreignColumns: [stores.id],
      name: "store_ratings_store_id_stores_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "store_ratings_user_id_users_id_fk",
    }).onDelete("cascade"),
    unique("unique_user_store_rating").on(table.userId, table.storeId),
    pgPolicy("Users can see all store ratings", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("Users can create ratings for stores", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can update their own ratings", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Users can delete their own ratings", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Store owners can see ratings for their stores", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Admins can update any rating", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Admins can delete any rating", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ]
);

export const stores = pgTable(
  "stores",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    ownerId: uuid("owner_id").notNull(),
    name: varchar({ length: 100 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    address: varchar({ length: 400 }).notNull(),
    description: text(),
    phone: varchar({ length: 20 }),
    isActive: boolean("is_active").default(true).notNull(),
    averageRating: numeric("average_rating", {
      precision: 2,
      scale: 1,
    }).default("0.0"),
    totalRatings: integer("total_ratings").default(0),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("stores_active_idx").using(
      "btree",
      table.isActive.asc().nullsLast().op("bool_ops")
    ),
    index("stores_address_idx").using(
      "btree",
      table.address.asc().nullsLast().op("text_ops")
    ),
    index("stores_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    index("stores_name_idx").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops")
    ),
    index("stores_owner_id_idx").using(
      "btree",
      table.ownerId.asc().nullsLast().op("uuid_ops")
    ),
    index("stores_rating_idx").using(
      "btree",
      table.averageRating.asc().nullsLast().op("numeric_ops")
    ),
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
      name: "stores_owner_id_users_id_fk",
    }).onDelete("cascade"),
    unique("stores_email_unique").on(table.email),
    pgPolicy("Anyone can view active stores", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(is_active = true)`,
    }),
    pgPolicy("Store owners can view their own stores", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Store owners can update their own stores", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Store owners can delete their own stores", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Admins can view all stores", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Admins can update all stores", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Admins can delete any store", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Only store owners and admins can create stores", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
  ]
);

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 60 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    address: varchar({ length: 400 }),
    role: userRole().default("normal_user").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    emailVerificationToken: varchar("email_verification_token", {
      length: 255,
    }),
    emailVerificationExpiry: timestamp("email_verification_expiry", {
      mode: "string",
    }),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    passwordResetExpiry: timestamp("password_reset_expiry", { mode: "string" }),
    lastLogin: timestamp("last_login", { mode: "string" }),
    loginAttempts: integer("login_attempts").default(0),
    lockedUntil: timestamp("locked_until", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("users_active_idx").using(
      "btree",
      table.isActive.asc().nullsLast().op("bool_ops")
    ),
    index("users_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    index("users_name_idx").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops")
    ),
    index("users_role_idx").using(
      "btree",
      table.role.asc().nullsLast().op("enum_ops")
    ),
    unique("users_email_unique").on(table.email),
    pgPolicy("Users can view their own profile", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(id = (current_setting('app.current_user_id'::text, true))::uuid)`,
    }),
    pgPolicy("Users can update their own profile", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Admins can view all profiles", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Admins can update all profiles", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Admins can delete users", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ]
);
