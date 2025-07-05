module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/app/lib/(.*)$': '<rootDir>/src/app/lib/$1',
    '^@/app/actions$': '<rootDir>/src/app/actions',
  },
};