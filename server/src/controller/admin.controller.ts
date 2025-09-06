import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { users, stores, storeRatings } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { hashPassword } from "../utils/auth.utils.js";
import type {
  CreateNormalUserRequest,
  CreateAdminUserRequest,
  CreateStoreOwnerRequest,
  CreateStoreRequest,
} from "../types/admin.types.js";

/**
 * Add a new normal user as an admin
 */
export const createNormalUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address }: CreateNormalUserRequest =
      req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    // Create normal user
    const result = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        address,
        role: "normal_user",
        isActive: true,
        emailVerified: true, // Admin created accounts can be pre-verified
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
      });

    const newUser = result[0];
    if (!newUser) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    res.status(201).json({
      message: "Normal user created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

/**
 * Add a new admin user (only super admins should be able to do this)
 */
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address }: CreateAdminUserRequest = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    // Create admin user
    const result = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        address,
        role: "system_administrator", // Set role as admin
        isActive: true,
        emailVerified: true, // Admin created accounts can be pre-verified
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
      });

    const newUser = result[0];
    if (!newUser) {
      return res.status(500).json({ message: "Failed to create admin user" });
    }

    res.status(201).json({
      message: "Admin user created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    res.status(500).json({ message: "Failed to create admin user" });
  }
};

/**
 * Add a new store owner user
 */
export const createStoreOwner = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address }: CreateStoreOwnerRequest =
      req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    // Create store owner user
    const result = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        address,
        role: "store_owner", // Set role as store owner
        isActive: true,
        emailVerified: true, // Admin created accounts can be pre-verified
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
      });

    const newUser = result[0];
    if (!newUser) {
      return res.status(500).json({ message: "Failed to create store owner" });
    }

    res.status(201).json({
      message: "Store owner created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Store owner creation error:", error);
    res.status(500).json({ message: "Failed to create store owner" });
  }
};

/**
 * Add a new store (and optionally link it to an existing store owner)
 */
export const createStore = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      address,
      description,
      phone,
      ownerId,
    }: CreateStoreRequest = req.body;

    if (!name || !email || !address || !ownerId) {
      return res
        .status(400)
        .json({ message: "Name, email, address, and owner ID are required" });
    }

    // Verify that the owner exists and has a store_owner role
    const ownerCheck = await db
      .select()
      .from(users)
      .where(eq(users.id, ownerId))
      .limit(1);

    if (ownerCheck.length === 0) {
      return res.status(404).json({ message: "Store owner not found" });
    }

    const owner = ownerCheck[0];
    if (owner && owner.role !== "store_owner") {
      return res.status(400).json({
        message:
          "The specified user is not a store owner. Please assign the store owner role first.",
      });
    }

    // Check if store email already exists
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.email, email))
      .limit(1);

    if (existingStore.length > 0) {
      return res
        .status(409)
        .json({ message: "Store with this email already exists" });
    }

    // Create the store
    const result = await db
      .insert(stores)
      .values({
        name,
        email,
        address,
        description,
        phone,
        ownerId,
        isActive: true,
      })
      .returning({
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        description: stores.description,
        phone: stores.phone,
        ownerId: stores.ownerId,
        isActive: stores.isActive,
        averageRating: stores.averageRating,
        totalRatings: stores.totalRatings,
      });

    const newStore = result[0];
    if (!newStore) {
      return res.status(500).json({ message: "Failed to create store" });
    }

    res.status(201).json({
      message: "Store created successfully",
      store: newStore,
    });
  } catch (error) {
    console.error("Store creation error:", error);
    res.status(500).json({ message: "Failed to create store" });
  }
};

/**
 * Get all users (with optional filtering by role, name, email, address)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;

    // Get all users first
    let usersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        address: users.address,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users);

    // Apply filters in-memory
    if (role && typeof role === "string") {
      // Type cast role to the expected enum type
      const typedRole = role as
        | "system_administrator"
        | "normal_user"
        | "store_owner";
      usersList = usersList.filter((user) => user.role === typedRole);
    }

    if (search && typeof search === "string") {
      const searchLower = search.toLowerCase();
      usersList = usersList.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.address && user.address.toLowerCase().includes(searchLower))
      );
    }

    res.status(200).json({
      users: usersList,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * Get all stores
 */
export const getAllStores = async (req: Request, res: Response) => {
  try {
    const { name, email, address } = req.query;

    // Apply filters one by one
    let storesList = await db.select().from(stores);

    if (name && typeof name === "string") {
      storesList = storesList.filter((store) =>
        store.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (email && typeof email === "string") {
      storesList = storesList.filter((store) =>
        store.email.toLowerCase().includes(email.toLowerCase())
      );
    }

    if (address && typeof address === "string") {
      storesList = storesList.filter(
        (store) =>
          store.address &&
          store.address.toLowerCase().includes(address.toLowerCase())
      );
    }

    res.status(200).json({
      stores: storesList,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Failed to fetch stores" });
  }
};

/**
 * Get user details with store rating if they're a store owner
 */
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user details
    const userDetails = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        address: users.address,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userDetails.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userDetails[0];

    // Create response object with user details
    interface StoreResponse {
      id: string;
      name: string;
      email: string;
      address: string;
      ownerId: string;
      averageRating: string | null;
      totalRatings: number | null;
    }

    interface ResponseType {
      user: typeof user;
      stores?: StoreResponse[];
    }

    const response: ResponseType = { user };

    // If the user is a store owner, fetch their store details including rating
    if (user && user.role === "store_owner") {
      const userStores = await db
        .select({
          id: stores.id,
          name: stores.name,
          email: stores.email,
          address: stores.address,
          ownerId: stores.ownerId,
          averageRating: stores.averageRating,
          totalRatings: stores.totalRatings,
        })
        .from(stores)
        .where(eq(stores.ownerId, userId));

      if (userStores.length > 0) {
        response.stores = userStores;
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get total users count
    const usersCount = await db.select({ count: sql`count(*)` }).from(users);

    // Get total stores count
    const storesCount = await db.select({ count: sql`count(*)` }).from(stores);

    // Get total ratings count
    const ratingsCount = await db
      .select({ count: sql`count(*)` })
      .from(storeRatings);

    res.status(200).json({
      stats: {
        totalUsers: Number(usersCount[0]?.count || 0),
        totalStores: Number(storesCount[0]?.count || 0),
        totalRatings: Number(ratingsCount[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};

/**
 * Get all store owners for admin to assign to stores
 */
export const getAllStoreOwners = async (req: Request, res: Response) => {
  try {
    // Get all users with store_owner role
    const storeOwners = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(sql`${users.role} = 'store_owner' AND ${users.isActive} = true`);

    res.status(200).json(storeOwners);
  } catch (error) {
    console.error("Error fetching store owners:", error);
    res.status(500).json({ message: "Failed to fetch store owners" });
  }
};
