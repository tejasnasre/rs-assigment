import { Router } from "express";
import {
  getAllStores,
  searchStores,
  getStoreDetails,
  submitStoreRating,
  updateStoreRating,
} from "../controller/store.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = Router();

router.get("/", authenticate, getAllStores);
router.get("/search", authenticate, searchStores);
router.get("/:storeId", authenticate, getStoreDetails);
router.post("/:storeId/ratings", authenticate, submitStoreRating);
router.put("/:storeId/ratings", authenticate, updateStoreRating);

export default router;
