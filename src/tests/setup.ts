import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { logger } from '../src/utils/logger';

// Disable logging during tests
logger.silent = true;

// Set test environment
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Global test helpers
global.cleanup = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};