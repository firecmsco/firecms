/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    // tsconfig.json targets nodenext (ESM); Jest runs CommonJS
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "commonjs", moduleResolution: "node" } }],
    },
    moduleNameMapper: {
        // sources import "./x.js" (ESM); resolve it to the .ts/.tsx file
        "^(\\.{1,2}/.*)\\.js$": "$1",
        // "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
        //     "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|less)$": "<rootDir>/test/__mocks__/styleMock.js",
    }
};
