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
} from "../controller/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  createNormalUserSchema,
  createAdminUserSchema,
  createStoreOwnerSchema,
  createStoreSchema,
} from "../types/admin.types.js";

const router = Router();

// All admin routes are protected and require system_administrator role
const adminMiddleware = [authenticate, authorize(["system_administrator"])];

// User management routes
router.post(
  "/users/normal",
  adminMiddleware,
  validateRequest(createNormalUserSchema),
  createNormalUser
);
router.post(
  "/users/admin",
  adminMiddleware,
  validateRequest(createAdminUserSchema),
  createAdminUser
);
router.post(
  "/users/store-owner",
  adminMiddleware,
  validateRequest(createStoreOwnerSchema),
  createStoreOwner
);
router.get("/users", adminMiddleware, getAllUsers);
router.get("/users/:userId", adminMiddleware, getUserDetails);

// Store management routes
router.post(
  "/stores",
  adminMiddleware,
  validateRequest(createStoreSchema),
  createStore
);
router.get("/stores", adminMiddleware, getAllStores);

// Dashboard stats
router.get("/stats", adminMiddleware, getDashboardStats);

export default router;
