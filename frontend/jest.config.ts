import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
};

export default createJestConfig(config);