/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/src/**/*.test.ts",
        "**/test/**/*.test.ts"
    ],
    moduleNameMapper: {
        "^@firecms/(.*)$": "<rootDir>/../$1/src"
    },
    // mongodb-memory-server needs more time to start
    testTimeout: 30000
};
