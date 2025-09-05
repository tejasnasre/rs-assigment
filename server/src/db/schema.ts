// Additional setup for RLS to work with application context
export const RLS_SETUP = `
-- Enable RLS on all tables (automatically handled by Drizzle pgPolicy)
-- Create a function to set current user context
CREATE OR REPLACE FUNCTION set_current_user_context(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, true);
END;
$;

-- Function to get current user context
CREATE OR REPLACE FUNCTION get_current_user_context()
RETURNS TABLE(user_id UUID, user_role user_role, is_active BOOLEAN, email_verified BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  RETURN QUERY
  SELECT u.id, u.role, u.is_active, u.email_verified
  FROM users u
  WHERE u.id = current_setting('app.current_user_id', true)::uuid;
END;
$;

-- Trigger to update store average rating when rating is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_store_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $
BEGIN
  -- Update average rating and total ratings for the store
  UPDATE stores 
  SET 
    average_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1) 
      FROM store_ratings 
      WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
    ), 0),
    total_ratings = COALESCE((
      SELECT COUNT(*) 
      FROM store_ratings 
      WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
    ), 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.store_id, OLD.store_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$;

-- Create triggers for store rating updates
CREATE TRIGGER update_store_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON store_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_rating_stats();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$;

-- Create updated_at triggers for all tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at 
  BEFORE UPDATE ON stores 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_ratings_updated_at 
  BEFORE UPDATE ON store_ratings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

// Application layer helper for setting user context
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class RLSContext {
  static async setUserContext(db: PostgresJsDatabase, userId: string) {
    await db.execute(sql`SELECT set_current_user_context(${userId}::uuid)`);
  }

  static async getCurrentUserContext(db: PostgresJsDatabase) {
    const result = await db.execute(
      sql`SELECT * FROM get_current_user_context()`
    );
    return result[0];
  }
}

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  text,
  index,
  integer,
  decimal,
  unique,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// Define user roles enum
export const userRoleEnum = pgEnum("user_role", [
  "system_administrator",
  "normal_user",
  "store_owner",
]);

// Define roles for policies
export const authenticatedUser = sql`current_setting('app.current_user_id', true)::uuid`;
export const systemAdminRole = sql`(SELECT role FROM get_current_user_context()) = 'system_administrator'`;
export const storeOwnerRole = sql`(SELECT role FROM get_current_user_context()) = 'store_owner'`;

// Users table - Enhanced based on requirements
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 60 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(), // For hashed passwords
    address: varchar("address", { length: 400 }),
    role: userRoleEnum("role").default("normal_user").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    emailVerificationToken: varchar("email_verification_token", {
      length: 255,
    }),
    emailVerificationExpiry: timestamp("email_verification_expiry"),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    passwordResetExpiry: timestamp("password_reset_expiry"),
    lastLogin: timestamp("last_login"),
    loginAttempts: integer("login_attempts").default(0),
    lockedUntil: timestamp("locked_until"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Form validation constraints from requirements
    sql`CHECK (char_length(${table.name}) >= 3 AND char_length(${table.name}) <= 60)`,
    sql`CHECK (char_length(${table.address}) <= 400)`,
    sql`CHECK (${table.email} ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')`,
    sql`CHECK (${table.loginAttempts} >= 0 AND ${table.loginAttempts} <= 10)`,
    // Indexes for performance
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_active_idx").on(table.isActive),
    index("users_name_idx").on(table.name), // For filtering by name
    
    // RLS Policies
    pgPolicy("Users can view their own profile", {
      for: "select",
      using: sql`id = ${authenticatedUser}`
    }),
    
    pgPolicy("Users can update their own profile", {
      for: "update",
      using: sql`id = ${authenticatedUser}`
    }),
    
    pgPolicy("Admins can view all profiles", {
      for: "select",
      using: systemAdminRole
    }),
    
    pgPolicy("Admins can update all profiles", {
      for: "update",
      using: systemAdminRole
    }),
    
    pgPolicy("Admins can delete users", {
      for: "delete",
      using: systemAdminRole
    })
  ]
);

// Stores table - Core entity for the platform
export const stores = pgTable(
  "stores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    address: varchar("address", { length: 400 }).notNull(),
    description: text("description"),
    phone: varchar("phone", { length: 20 }),
    isActive: boolean("is_active").default(true).notNull(),
    averageRating: decimal("average_rating", {
      precision: 2,
      scale: 1,
    }).default("0.0"),
    totalRatings: integer("total_ratings").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Validation constraints
    sql`CHECK (char_length(${table.name}) >= 2 AND char_length(${table.name}) <= 100)`,
    sql`CHECK (char_length(${table.address}) <= 400)`,
    sql`CHECK (${table.email} ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')`,
    sql`CHECK (${table.averageRating} >= 0 AND ${table.averageRating} <= 5)`,
    sql`CHECK (${table.totalRatings} >= 0)`,
    // Indexes for search and filtering
    index("stores_owner_id_idx").on(table.ownerId),
    index("stores_name_idx").on(table.name), // For search by name
    index("stores_address_idx").on(table.address), // For search by address
    index("stores_email_idx").on(table.email),
    index("stores_active_idx").on(table.isActive),
    index("stores_rating_idx").on(table.averageRating), // For sorting by rating
    
    // RLS Policies
    pgPolicy("Anyone can view active stores", {
      for: "select",
      using: sql`is_active = true`
    }),
    
    pgPolicy("Store owners can view their own stores", {
      for: "select",
      using: sql`owner_id = ${authenticatedUser}`
    }),
    
    pgPolicy("Store owners can update their own stores", {
      for: "update",
      using: sql`owner_id = ${authenticatedUser}`
    }),
    
    pgPolicy("Store owners can delete their own stores", {
      for: "delete",
      using: sql`owner_id = ${authenticatedUser}`
    }),
    
    pgPolicy("Admins can view all stores", {
      for: "select",
      using: systemAdminRole
    }),
    
    pgPolicy("Admins can update all stores", {
      for: "update",
      using: systemAdminRole
    }),
    
    pgPolicy("Admins can delete any store", {
      for: "delete",
      using: systemAdminRole
    }),
    
    pgPolicy("Only store owners and admins can create stores", {
      for: "insert",
      withCheck: sql`(SELECT role FROM get_current_user_context()) IN ('store_owner', 'system_administrator')`
    })
  ]
);

// Store Ratings table - Core functionality
export const storeRatings = pgTable(
  "store_ratings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    review: text("review"), // Optional review text
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Rating must be between 1-5 as per requirements
    sql`CHECK (${table.rating} >= 1 AND ${table.rating} <= 5)`,
    // One rating per user per store
    unique("unique_user_store_rating").on(table.userId, table.storeId),
    // Indexes for performance
    index("store_ratings_user_id_idx").on(table.userId),
    index("store_ratings_store_id_idx").on(table.storeId),
    index("store_ratings_rating_idx").on(table.rating),
    index("store_ratings_created_at_idx").on(table.createdAt),
    
    // RLS Policies
    pgPolicy("Users can see all store ratings", {
      for: "select",
      using: sql`true`
    }),
    
    pgPolicy("Users can create ratings for stores", {
      for: "insert",
      withCheck: sql`user_id = ${authenticatedUser}`
    }),
    
    pgPolicy("Users can update their own ratings", {
      for: "update",
      using: sql`user_id = ${authenticatedUser}`
    }),
    
    pgPolicy("Users can delete their own ratings", {
      for: "delete",
      using: sql`user_id = ${authenticatedUser}`
    }),
    
    pgPolicy("Admins can update any rating", {
      for: "update",
      using: systemAdminRole
    }),
    
    pgPolicy("Admins can delete any rating", {
      for: "delete",
      using: systemAdminRole
    }),
    
    pgPolicy("Store owners can see ratings for their stores", {
      for: "select",
      using: sql`store_id IN (SELECT id FROM stores WHERE owner_id = ${authenticatedUser})`
    })
  ]
);

// JWT Refresh Tokens table for secure token management
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    isRevoked: boolean("is_revoked").default(false).notNull(),
    deviceInfo: varchar("device_info", { length: 500 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => [
    index("refresh_tokens_user_id_idx").on(table.userId),
    index("refresh_tokens_token_idx").on(table.token),
    index("refresh_tokens_expires_at_idx").on(table.expiresAt),
  ]
);

// User Sessions table for tracking active sessions
export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionToken: text("session_token").notNull().unique(),
    refreshTokenId: uuid("refresh_token_id").references(
      () => refreshTokens.id,
      { onDelete: "cascade" }
    ),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    deviceInfo: varchar("device_info", { length: 500 }),
    location: varchar("location", { length: 200 }),
    isActive: boolean("is_active").default(true).notNull(),
    lastActivity: timestamp("last_activity").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [
    index("user_sessions_user_id_idx").on(table.userId),
    index("user_sessions_token_idx").on(table.sessionToken),
    index("user_sessions_active_idx").on(table.isActive),
  ]
);

// Login Attempts table for security tracking
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }).notNull(),
    userAgent: text("user_agent"),
    success: boolean("success").default(false).notNull(),
    failureReason: varchar("failure_reason", { length: 100 }),
    attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
  },
  (table) => [
    index("login_attempts_email_idx").on(table.email),
    index("login_attempts_ip_idx").on(table.ipAddress),
    index("login_attempts_attempted_at_idx").on(table.attemptedAt),
  ]
);

// Role Permissions table for extensible permission system
export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role: userRoleEnum("role").notNull(),
    permission: varchar("permission", { length: 100 }).notNull(),
    resource: varchar("resource", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("role_permissions_role_idx").on(table.role),
    index("role_permissions_permission_idx").on(table.permission),
    unique("unique_role_permission_resource").on(
      table.role,
      table.permission,
      table.resource
    ),
  ]
);

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  ownedStores: many(stores),
  ratings: many(storeRatings),
  refreshTokens: many(refreshTokens),
  userSessions: many(userSessions),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
  ratings: many(storeRatings),
}));

export const storeRatingsRelations = relations(storeRatings, ({ one }) => ({
  user: one(users, {
    fields: [storeRatings.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [storeRatings.storeId],
    references: [stores.id],
  }),
}));

export const refreshTokensRelations = relations(
  refreshTokens,
  ({ one, many }) => ({
    user: one(users, {
      fields: [refreshTokens.userId],
      references: [users.id],
    }),
    userSessions: many(userSessions),
  })
);

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
  refreshToken: one(refreshTokens, {
    fields: [userSessions.refreshTokenId],
    references: [refreshTokens.id],
  }),
}));

// Type exports for TypeScript
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;
export type SelectStore = typeof stores.$inferSelect;
export type InsertStoreRating = typeof storeRatings.$inferInsert;
export type SelectStoreRating = typeof storeRatings.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;
export type SelectRefreshToken = typeof refreshTokens.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;
export type SelectUserSession = typeof userSessions.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;
export type SelectLoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;
export type SelectRolePermission = typeof rolePermissions.$inferSelect;

// User roles enum for TypeScript
export type UserRole = "system_administrator" | "normal_user" | "store_owner";

// Utility types for the application
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: Date | null;
}

export interface StoreWithRating extends SelectStore {
  userRating?: number; // Current user's rating for this store
  ratingsCount?: number;
}

export interface UserWithProfile extends SelectUser {
  storeCount?: number; // For store owners
  ratingsGiven?: number; // For normal users
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  activeUsers: number;
  activeStores: number;
}

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  address?: string;
  password: string;
}

export interface CreateStoreRequest {
  name: string;
  email: string;
  address: string;
  description?: string;
  phone?: string;
  ownerId: string; // For admin creating stores
}

export interface SubmitRatingRequest {
  storeId: string;
  rating: number;
  review?: string;
}

export interface FilterOptions {
  name?: string;
  email?: string;
  address?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Row Level Security (RLS) Policies
// Note: These need to be applied after table creation via SQL commands

export const RLS_POLICIES = `
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Users Table RLS Policies
-- System administrators can see all users
CREATE POLICY "system_admin_all_users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'system_administrator'
      AND admin_user.is_active = true
    )
  );

-- Users can see their own profile
CREATE POLICY "users_own_profile" ON users
  FOR ALL USING (id = auth.uid());

-- Normal users can see store owners (for store listings)
CREATE POLICY "view_store_owners" ON users
  FOR SELECT USING (
    role = 'store_owner' 
    AND is_active = true
    AND EXISTS (
      SELECT 1 FROM users viewer 
      WHERE viewer.id = auth.uid() 
      AND viewer.is_active = true
    )
  );

-- Stores Table RLS Policies
-- Everyone can view active stores
CREATE POLICY "view_active_stores" ON stores
  FOR SELECT USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM users viewer 
      WHERE viewer.id = auth.uid() 
      AND viewer.is_active = true
    )
  );

-- System administrators can manage all stores
CREATE POLICY "system_admin_all_stores" ON stores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'system_administrator'
      AND admin_user.is_active = true
    )
  );

-- Store owners can manage their own stores
CREATE POLICY "store_owners_own_stores" ON stores
  FOR ALL USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users store_user 
      WHERE store_user.id = auth.uid() 
      AND store_user.role = 'store_owner'
      AND store_user.is_active = true
    )
  );

-- Store owners can insert stores (for admin creating stores for them)
CREATE POLICY "admin_create_stores" ON stores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'system_administrator'
      AND admin_user.is_active = true
    )
  );

-- Store Ratings Table RLS Policies
-- Users can see all ratings for stores (public information)
CREATE POLICY "view_all_store_ratings" ON store_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users viewer 
      WHERE viewer.id = auth.uid() 
      AND viewer.is_active = true
    )
  );

-- Normal users can insert/update/delete their own ratings
CREATE POLICY "users_own_ratings" ON store_ratings
  FOR ALL USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users rating_user 
      WHERE rating_user.id = auth.uid() 
      AND rating_user.role = 'normal_user'
      AND rating_user.is_active = true
    )
  );

-- Normal users can only insert ratings (not update system fields)
CREATE POLICY "users_insert_ratings" ON store_ratings
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users rating_user 
      WHERE rating_user.id = auth.uid() 
      AND rating_user.role = 'normal_user'
      AND rating_user.is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM stores target_store 
      WHERE target_store.id = store_id 
      AND target_store.is_active = true
    )
  );

-- Store owners can view ratings for their stores
CREATE POLICY "store_owners_view_ratings" ON store_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores owner_store 
      JOIN users store_owner ON owner_store.owner_id = store_owner.id
      WHERE owner_store.id = store_id 
      AND store_owner.id = auth.uid()
      AND store_owner.role = 'store_owner'
      AND store_owner.is_active = true
    )
  );

-- System administrators can see all ratings
CREATE POLICY "system_admin_all_ratings" ON store_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'system_administrator'
      AND admin_user.is_active = true
    )
  );

-- Refresh Tokens RLS Policies
-- Users can only access their own refresh tokens
CREATE POLICY "users_own_refresh_tokens" ON refresh_tokens
  FOR ALL USING (user_id = auth.uid());

-- User Sessions RLS Policies
-- Users can only access their own sessions
CREATE POLICY "users_own_sessions" ON user_sessions
  FOR ALL USING (user_id = auth.uid());

-- System administrators can view all sessions for monitoring
CREATE POLICY "system_admin_all_sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'system_administrator'
      AND admin_user.is_active = true
    )
  );

-- Login Attempts RLS Policies
-- System administrators can view all login attempts
CREATE POLICY "system_admin_login_attempts" ON login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'system_administrator'
      AND admin_user.is_active = true
    )
  );

-- Users can view their own login attempts
CREATE POLICY "users_own_login_attempts" ON login_attempts
  FOR SELECT USING (
    email = (
      SELECT email FROM users 
      WHERE id = auth.uid()
    )
  );

-- Role Permissions are read-only and public to authenticated users
CREATE POLICY "view_role_permissions" ON role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users viewer 
      WHERE viewer.id = auth.uid() 
      AND viewer.is_active = true
    )
  );

-- System administrators can manage role permissions
CREATE POLICY "system_admin_manage_permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'system_administrator'
      AND admin_user.is_active = true
    )
  );
`;

// Helper function to get current user context (to be used in application layer)
export const getCurrentUserContext = `
-- Function to get current user's role and status
CREATE OR REPLACE FUNCTION get_current_user_context()
RETURNS TABLE(user_id UUID, user_role user_role, is_active BOOLEAN, email_verified BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  RETURN QUERY
  SELECT u.id, u.role, u.is_active, u.email_verified
  FROM users u
  WHERE u.id = auth.uid();
END;
$;

-- Function to check if user can access store
CREATE OR REPLACE FUNCTION can_access_store(store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  user_context RECORD;
  store_owner_id UUID;
BEGIN
  -- Get current user context
  SELECT * INTO user_context FROM get_current_user_context();
  
  -- If no user context, deny access
  IF user_context IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- System administrators can access all stores
  IF user_context.user_role = 'system_administrator' THEN
    RETURN TRUE;
  END IF;
  
  -- Get store owner
  SELECT owner_id INTO store_owner_id FROM stores WHERE id = store_id;
  
  -- Store owners can access their own stores
  IF user_context.user_role = 'store_owner' AND user_context.user_id = store_owner_id THEN
    RETURN TRUE;
  END IF;
  
  -- Normal users can access active stores
  IF user_context.user_role = 'normal_user' AND EXISTS (
    SELECT 1 FROM stores WHERE id = store_id AND is_active = TRUE
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$;

-- Function to check if user can rate store
CREATE OR REPLACE FUNCTION can_rate_store(store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  user_context RECORD;
BEGIN
  -- Get current user context
  SELECT * INTO user_context FROM get_current_user_context();
  
  -- Only normal users can rate stores
  IF user_context.user_role != 'normal_user' OR NOT user_context.is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check if store exists and is active
  IF NOT EXISTS (SELECT 1 FROM stores WHERE id = store_id AND is_active = TRUE) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$;
`;

// Database triggers for maintaining data consistency
export const DATABASE_TRIGGERS = `
-- Trigger to update store average rating when rating is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_store_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $
BEGIN
  -- Update average rating and total ratings for the store
  UPDATE stores 
  SET 
    average_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1) 
      FROM store_ratings 
      WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
    ), 0),
    total_ratings = COALESCE((
      SELECT COUNT(*) 
      FROM store_ratings 
      WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
    ), 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.store_id, OLD.store_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$;

-- Create triggers for store rating updates
CREATE TRIGGER update_store_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON store_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_rating_stats();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$;

-- Create updated_at triggers for all tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at 
  BEFORE UPDATE ON stores 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_ratings_updated_at 
  BEFORE UPDATE ON store_ratings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

// Default role permissions based on requirements
export const DEFAULT_PERMISSIONS = {
  system_administrator: [
    { permission: "manage_users", resource: "users" },
    { permission: "manage_stores", resource: "stores" },
    { permission: "view_dashboard", resource: "dashboard" },
    { permission: "manage_system", resource: "system" },
  ],
  store_owner: [
    { permission: "manage_own_store", resource: "own_store" },
    { permission: "view_store_ratings", resource: "own_ratings" },
    { permission: "view_store_dashboard", resource: "own_dashboard" },
    { permission: "update_password", resource: "own_profile" },
  ],
  normal_user: [
    { permission: "view_stores", resource: "stores" },
    { permission: "submit_ratings", resource: "ratings" },
    { permission: "update_ratings", resource: "own_ratings" },
    { permission: "update_password", resource: "own_profile" },
    { permission: "search_stores", resource: "stores" },
  ],
} as const;
