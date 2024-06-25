export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "babel",
  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/test/",
    "/models/",
    "/middlewares/",
    "/routes/",
    "/utils/",
  ],
};
