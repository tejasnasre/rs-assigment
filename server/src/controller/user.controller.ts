import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  comparePassword,
  signToken,
} from "../utils/auth.utils.js";
import type { LoginRequest, SignupRequest } from "../types/auth.types.js";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address }: SignupRequest = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

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

    const result = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        address,
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

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Set token in HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds (should match JWT expiry)
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

/**
 * Login a user
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role }: LoginRequest = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required" });
    }

    // Find the user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts (you might want to implement account locking)
      await db
        .update(users)
        .set({ loginAttempts: (user.loginAttempts ?? 0) + 1 })
        .where(eq(users.id, user.id));

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Validate role
    if (user.role !== role) {
      return res.status(403).json({ message: "Invalid role for this user" });
    }

    // Reset login attempts and update last login
    await db
      .update(users)
      .set({
        loginAttempts: 0,
        lastLogin: new Date(),
      })
      .where(eq(users.id, user.id));

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set token in HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds (should match JWT expiry)
    });

    // Return user info and token (still include token in response for flexibility)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Logout a user by clearing the auth cookie
 */
export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Clear the auth cookie
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a user's password - requires authentication
 */
export const updatePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user from database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in database
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.userId));

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};
