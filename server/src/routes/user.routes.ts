import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  updatePassword,
} from "../controller/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes

//Login
router.post("/login", loginUser);

// Singup
router.post("/signup", createUser);

// Logout
router.post("/logout", logoutUser);

// Protected routes
router.get("/profile", authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Normal user routes
router.put("/update-password", authenticate, updatePassword);

export default router;
