import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class UserService {
  async create(userData: CreateUserDto): Promise<User> {
    try {
      const [user] = await db('users')
        .insert({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning('*');

      return user;
    } catch (error) {
      throw new AppError('Error creating user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await db('users')
        .where({ email })
        .first();

      return user || null;
    } catch (error) {
      throw new AppError('Error finding user');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await db('users')
        .where({ id })
        .first();

      return user || null;
    } catch (error) {
      throw new AppError('Error finding user');
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      await db('users')
        .where({ id })
        .update({
          password: newPassword,
          updatedAt: new Date()
        });
    } catch (error) {
      throw new AppError('Error updating password');
    }
  }

  async update(id: string, userData: Partial<CreateUserDto>): Promise<User> {
    try {
      const [user] = await db('users')
        .where({ id })
        .update({
          ...userData,
          updatedAt: new Date()
        })
        .returning('*');

      return user;
    } catch (error) {
      throw new AppError('Error updating user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db('users')
        .where({ id })
        .delete();
    } catch (error) {
      throw new AppError('Error deleting user');
    }
  }
} 