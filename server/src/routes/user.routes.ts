import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  updatePassword,
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
router.put("/update-password", authenticate, updatePassword);

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
