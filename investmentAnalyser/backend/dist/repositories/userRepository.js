"use strict";
/**
 * In-memory repository for User records.
 *
 * Interface designed to be easily swappable with a MongoDB implementation later.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const uuid_1 = require("uuid");
class UserRepository {
    constructor() {
        this.users = new Map();
        this.emailToUserId = new Map();
    }
    /**
     * Create a new user.
     */
    create(name, email) {
        // Check if email already exists
        if (this.emailToUserId.has(email)) {
            throw new Error(`User with email ${email} already exists`);
        }
        const user = {
            userId: (0, uuid_1.v4)(),
            name,
            email,
            createdAt: new Date(),
        };
        this.users.set(user.userId, user);
        this.emailToUserId.set(email, user.userId);
        return user;
    }
    /**
     * Get user by ID.
     */
    findById(userId) {
        return this.users.get(userId) || null;
    }
    /**
     * Get user by email.
     */
    findByEmail(email) {
        const userId = this.emailToUserId.get(email);
        return userId ? (this.users.get(userId) || null) : null;
    }
    /**
     * List all users.
     */
    listAll() {
        return Array.from(this.users.values());
    }
}
exports.UserRepository = UserRepository;
// Global singleton instance
exports.userRepository = new UserRepository();
