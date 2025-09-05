import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  updatePassword,
  getAllStores,
  searchStores,
  getStoreDetails,
  submitStoreRating,
  updateStoreRating,
} from "../controller/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/login", loginUser);
router.post("/signup", createUser);
router.post("/logout", logoutUser);

// Protected routes
router.get("/profile", authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Normal user routes
router.put("/password", authenticate, updatePassword);
router.get("/stores", authenticate, getAllStores);
router.get("/stores/search", authenticate, searchStores);
router.get("/stores/:storeId", authenticate, getStoreDetails);
router.post("/stores/:storeId/ratings", authenticate, submitStoreRating);
router.put("/stores/:storeId/ratings", authenticate, updateStoreRating);

// Admin-only routes (example)
router.get(
  "/admin",
  authenticate,
  authorize(["system_administrator"]),
  (req, res) => {
    res.status(200).json({ message: "Admin access granted" });
  }
);

export default router;
