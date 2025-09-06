import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// Middleware to validate request body against a Zod schema

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const validatedData = schema.parse(req.body);

      // Replace request body with validated data
      req.body = validatedData;

      next();
    } catch (error) {
      // If validation fails, return 400 with validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.format(),
        });
      }

      return res.status(400).json({
        message: "Invalid request data",
        error: "Request validation failed",
      });
    }
  };
};
