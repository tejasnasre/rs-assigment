import { Router } from "express";
import {
  getStoreOwnerStore,
  getStoreOwnerRatings,
  getStoreWithRatings,
} from "../controller/store-owner.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Ensure user is authenticated and is a store owner
router.use(authenticate);

// Routes for store owner dashboard

// Route to get store owner's store details
router.get("/store", getStoreOwnerStore);

// Route to get store owner ratings
router.get("/ratings", getStoreOwnerRatings);

// Route to get store with ratings
router.get("/store-with-ratings", getStoreWithRatings);

export default router;
