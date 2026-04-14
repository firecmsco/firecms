/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: [
        "**/test/**/*.test.ts",
        "**/src/**/*.test.ts"
    ],
    moduleNameMapper: {
        "^@rebasepro/types$": "<rootDir>/../types/src",
        "^@rebasepro/common$": "<rootDir>/../common/src",
    }
};
