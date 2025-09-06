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
router.get("/store", getStoreOwnerStore);
router.get("/ratings", getStoreOwnerRatings);
router.get("/store-with-ratings", getStoreWithRatings);

export default router;
