/**
 * User controller — handles HTTP requests for user endpoints.
 */

import { Request, Response } from "express";
import { userRepository } from "../repositories/userRepository";
import { Validator, ValidationError } from "../utils/validator";

export class UserController {
  /**
   * POST /api/v1/users
   * Create a new user.
   */
  createUser(req: Request, res: Response): void {
    try {
      const { name, email } = Validator.validateCreateUserRequest(req.body);

      const user = userRepository.create(name, email);

      res.status(201).json({
        userId: user.userId,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /api/v1/users/:userId
   * Get a user by ID.
   */
  getUser(req: Request, res: Response): void {
    try {
      const { userId } = req.params;

      const user = userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          error: {
            code: "USER_NOT_FOUND",
            message: `User ${userId} not found`,
          },
        });
        return;
      }

      res.json({
        userId: user.userId,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      res.status(409).json({
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: error.message,
        },
      });
      return;
    }

    console.error("Unhandled error in UserController:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
}

export const userController = new UserController();
