/**
 * Jest Configuration for Backend Tests
 *
 * This configuration is optimized for testing Express.js backend modules
 * with mocked external services (Stripe, Claude, eBay, PostgreSQL)
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Root directory for tests
  rootDir: '..',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Setup files to run before each test file
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module paths for cleaner imports
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Coverage configuration
  collectCoverageFrom: [
    '**/routes/**/*.js',
    '**/services/**/*.js',
    '**/middleware/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Coverage thresholds (start conservative, increase over time)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Coverage output directory
  coverageDirectory: '<rootDir>/tests/coverage',

  // Reporter configuration
  coverageReporters: ['text', 'lcov', 'html'],

  // Verbose output for debugging
  verbose: true,

  // Timeout for tests (10 seconds)
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Force exit after tests complete (helps with hanging tests)
  forceExit: true,

  // Detect open handles (helps find async issues)
  detectOpenHandles: true,

  // Module name mapper for common modules
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Transform configuration (for ES modules if needed)
  transform: {},

  // Global setup/teardown
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js'
};
