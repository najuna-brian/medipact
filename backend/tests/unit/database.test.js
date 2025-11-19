/**
 * Simple database connection tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initDatabase, closeDatabase } from '../../src/db/database.js';

describe('Database', () => {
  beforeAll(async () => {
    // Initialize database if not already initialized
    try {
      await initDatabase();
    } catch (error) {
      // Database might already be initialized, that's okay
    }
  });

  afterAll(async () => {
    try {
      await closeDatabase();
    } catch (error) {
      // Ignore errors on cleanup
    }
  });

  it('should be able to initialize database', async () => {
    await expect(initDatabase()).resolves.not.toThrow();
  });

  it('should have database functions available', async () => {
    const db = await import('../../src/db/database.js');
    expect(db).toHaveProperty('initDatabase');
    expect(db).toHaveProperty('closeDatabase');
    expect(db).toHaveProperty('all');
    expect(db).toHaveProperty('run');
  });
});


