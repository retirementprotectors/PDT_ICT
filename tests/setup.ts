import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import fsExtra from 'fs-extra';

// Test environment setup
class TestEnvironment {
  static async createTempDirectory(): Promise<string> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdt-ict-test-'));
    return tempDir;
  }

  static async cleanup(directory: string): Promise<void> {
    await fsExtra.remove(directory);
  }
}

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'pdt_ict_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';

// Enable fake timers for all tests
beforeEach(() => {
  jest.useFakeTimers();
});

// Clean up after each test
afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Global test utilities
global.testUtils = {
  TestEnvironment,
  createTestUser: async () => {
    // Utility function to create a test user
    return {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedPassword123!'
    };
  },
  createAuthToken: () => {
    // Utility function to create a test JWT token
    return 'test-jwt-token';
  }
};

// Type declarations for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        TestEnvironment: typeof TestEnvironment;
        createTestUser: () => Promise<{
          id: number;
          email: string;
          username: string;
          password: string;
        }>;
        createAuthToken: () => string;
      };
    }
  }
} 