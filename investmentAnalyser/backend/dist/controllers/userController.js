"use strict";
/**
 * User controller — handles HTTP requests for user endpoints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const userRepository_1 = require("../repositories/userRepository");
const validator_1 = require("../utils/validator");
class UserController {
    /**
     * POST /api/v1/users
     * Create a new user.
     */
    createUser(req, res) {
        try {
            const { name, email } = validator_1.Validator.validateCreateUserRequest(req.body);
            const user = userRepository_1.userRepository.create(name, email);
            res.status(201).json({
                userId: user.userId,
                name: user.name,
                email: user.email,
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    /**
     * GET /api/v1/users/:userId
     * Get a user by ID.
     */
    getUser(req, res) {
        try {
            const { userId } = req.params;
            const user = userRepository_1.userRepository.findById(userId);
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
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    handleError(error, res) {
        if (error instanceof validator_1.ValidationError) {
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
exports.UserController = UserController;
exports.userController = new UserController();
