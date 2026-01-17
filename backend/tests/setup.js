/**
 * Jest Test Setup
 *
 * This file runs before each test file and sets up:
 * - Environment variables for testing
 * - Global mocks for external services
 * - Test database configuration
 * - Utility functions for testing
 */

// Load test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake_webhook_secret';
process.env.CLAUDE_API_KEY = 'test-claude-api-key';
process.env.EBAY_APP_ID = 'test-ebay-app-id';
process.env.EBAY_CERT_ID = 'test-ebay-cert-id';
process.env.EBAY_DEV_ID = 'test-ebay-dev-id';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/blink_test';

// Import mocks
const stripeMock = require('./mocks/stripe');
const claudeMock = require('./mocks/claude');
const ebayMock = require('./mocks/ebay');
const dbMock = require('./mocks/database');

// Mock external modules globally
jest.mock('stripe', () => {
  return jest.fn(() => stripeMock);
});

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn(() => claudeMock)
  };
});

// Mock ioredis for velocity tracker
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    pipeline: jest.fn(() => ({
      incr: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([[null, 1], [null, 'OK'], [null, 1], [null, 'OK']])
    })),
    mget: jest.fn().mockResolvedValue([null, null]),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK')
  }));
});

// Global test utilities
global.testUtils = {
  /**
   * Generate a valid JWT token for testing
   */
  generateTestToken: (userId = 1, email = 'test@example.com', isAdmin = false) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: userId, userId, email, is_admin: isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  /**
   * Generate an expired JWT token for testing
   */
  generateExpiredToken: (userId = 1, email = 'test@example.com') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: userId, userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' }
    );
  },

  /**
   * Create a mock request object
   */
  createMockRequest: (overrides = {}) => ({
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'accept-language': 'en-US,en;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept': 'text/html,application/xhtml+xml',
      ...overrides.headers
    },
    ip: '127.0.0.1',
    body: {},
    params: {},
    query: {},
    user: null,
    ...overrides
  }),

  /**
   * Create a mock response object
   */
  createMockResponse: () => {
    const res = {
      statusCode: 200,
      data: null
    };
    res.status = jest.fn((code) => {
      res.statusCode = code;
      return res;
    });
    res.json = jest.fn((data) => {
      res.data = data;
      return res;
    });
    res.send = jest.fn((data) => {
      res.data = data;
      return res;
    });
    return res;
  },

  /**
   * Wait for a specified time (useful for async tests)
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Reset all mocks to their initial state
   */
  resetMocks: () => {
    stripeMock._reset();
    claudeMock._reset();
    ebayMock._reset();
    dbMock._reset();
  }
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Suppress console output during tests (optional - comment out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn()
// };

// Increase timeout for async operations
jest.setTimeout(10000);
