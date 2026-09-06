/**
 * In-memory repository for User records.
 *
 * Interface designed to be easily swappable with a MongoDB implementation later.
 */

import { User } from "../types";
import { v4 as uuidv4 } from "uuid";

export class UserRepository {
  private users: Map<string, User> = new Map();
  private emailToUserId: Map<string, string> = new Map();

  /**
   * Create a new user.
   */
  create(name: string, email: string): User {
    // Check if email already exists
    if (this.emailToUserId.has(email)) {
      throw new Error(`User with email ${email} already exists`);
    }

    const user: User = {
      userId: uuidv4(),
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
  findById(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  /**
   * Get user by email.
   */
  findByEmail(email: string): User | null {
    const userId = this.emailToUserId.get(email);
    return userId ? (this.users.get(userId) || null) : null;
  }

  /**
   * List all users.
   */
  listAll(): User[] {
    return Array.from(this.users.values());
  }
}

// Global singleton instance
export const userRepository = new UserRepository();
