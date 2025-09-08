/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    // This pattern tells Jest to look for .test.ts files
    testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/src/**/*.test.ts",
        "**/test/**/*.test.ts"
    ],
    // This helps Jest resolve monorepo packages
    moduleNameMapper: {
        "^@firecms/(.*)$": "<rootDir>/../$1/src"
    }
};
