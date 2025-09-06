import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.utils.js";
import { RLSContext } from "../db/schema.js";
import { db } from "../db/index.js";

// Extend Express Request type to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

//  Authentication middleware to protect routes
//  Verifies JWT token and sets user context for RLS

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check cookie first (preferred method)
    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    } else {
      // Fallback to Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const tokenParts = authHeader.split(" ");
        if (tokenParts.length === 2) {
          token = tokenParts[1];
        }
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      // Clear the invalid cookie if it exists
      if (req.cookies && req.cookies.auth_token) {
        res.clearCookie("auth_token");
      }
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Set user in request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    // Set user context for Row Level Security
    await RLSContext.setUserContext(db, decoded.userId);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Role-based authorization middleware

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};
