/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ["./app/**"],
  coverageReporters: ['html', 'json'],
  coverageDirectory: './coverage'
};