module.exports = {
  maxWorkers: 1,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  clearMocks: true,
  testEnvironment: 'node',
};