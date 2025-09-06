import { Router } from "express";
import {
  createNormalUser,
  createAdminUser,
  createStoreOwner,
  createStore,
  getAllUsers,
  getAllStores,
  getDashboardStats,
  getUserDetails,
  getAllStoreOwners,
  updateUserRole,
  getStoreById,
  recalculateStoreRatings,
} from "../controller/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  createNormalUserSchema,
  createAdminUserSchema,
  createStoreOwnerSchema,
  createStoreSchema,
  updateUserRoleSchema,
} from "../types/admin.types.js";

const router = Router();

// All admin routes are protected and require system_administrator role
const adminMiddleware = [authenticate, authorize(["system_administrator"])];

// User management routes

// Create Normal User
router.post(
  "/users/normal",
  adminMiddleware,
  validateRequest(createNormalUserSchema),
  createNormalUser
);

// Create Admin User
router.post(
  "/users/admin",
  adminMiddleware,
  validateRequest(createAdminUserSchema),
  createAdminUser
);

// Create Store User
router.post(
  "/users/store-owner",
  adminMiddleware,
  validateRequest(createStoreOwnerSchema),
  createStoreOwner
);

// Get All Users
router.get("/users", adminMiddleware, getAllUsers);

// Get All Store Users
router.get("/users/store-owners", adminMiddleware, getAllStoreOwners);

// Get User Details
router.get("/users/:userId", adminMiddleware, getUserDetails);

// Update Role
router.patch(
  "/users/:userId/role",
  adminMiddleware,
  validateRequest(updateUserRoleSchema),
  updateUserRole
);

// Store management routes

// Create Store
router.post(
  "/create-stores",
  adminMiddleware,
  validateRequest(createStoreSchema),
  createStore
);

// Get All Store
router.get("/stores", adminMiddleware, getAllStores);

// Get Store By ID
router.get("/stores/:id", adminMiddleware, getStoreById);

// Dashboard stats
router.get("/stats", adminMiddleware, getDashboardStats);

// Recalculate store ratings
router.post("/recalculate-ratings", adminMiddleware, recalculateStoreRatings);

export default router;
