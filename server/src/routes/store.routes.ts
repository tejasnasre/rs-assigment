import { Router } from "express";
import {
  getAllStores,
  searchStores,
  getStoreDetails,
  submitStoreRating,
  updateStoreRating,
  getStoreRatings,
} from "../controller/store.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Get All Stores
router.get("/", authenticate, getAllStores);

// Search Stores
router.get("/search", authenticate, searchStores);

// Store Details and Ratings
router.get("/:storeId", authenticate, getStoreDetails);

// Store Ratings
router.get("/:storeId/ratings", authenticate, getStoreRatings);

// Submit Store Rating
router.post("/:storeId/ratings", authenticate, submitStoreRating);

// Update Store Rating
router.put("/:storeId/ratings", authenticate, updateStoreRating);

export default router;
