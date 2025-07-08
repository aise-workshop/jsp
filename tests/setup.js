/**
 * Jest setup file
 */

// Global test setup
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn()
};

// Increase timeout for integration tests
jest.setTimeout(30000);