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
        "^@rebasepro/(.*)$": "<rootDir>/../$1/src"
    }
};
