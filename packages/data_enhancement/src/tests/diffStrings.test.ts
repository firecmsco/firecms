// Import the diffStrings function from your module
// import { diffStrings } from './your-module';

import { Change, diffStrings } from "../utils/diffStrings";

describe("diffStrings", () => {
    test("equal strings", () => {
        const oldStr = "This is a test string";
        const newStr = "This is a test string";
        const expected: Change[] = [
            {
                type: "equal",
                value: "This is a test string"
            }
        ];
        expect(diffStrings(oldStr, newStr)).toEqual(expected);
    });

    test("insertions only", () => {
        const oldStr = "This is a test string";
        const newStr = "This is a new test string";
        const expected: Change[] = [
            {
                type: "equal",
                value: "This is a"
            },
            {
                type: "insert",
                value: " new"
            },
            {
                type: "equal",
                value: " test string"
            }
        ];
        expect(diffStrings(oldStr, newStr)).toEqual(expected);
    });

    test("deletions only", () => {
        const oldStr = "This is an old test string";
        const newStr = "This is a test string";
        const expected: Change[] = [
            {
                type: "equal",
                value: "This is a"
            },
            {
                type: "delete",
                value: "n old"
            },
            {
                type: "equal",
                value: " test string"
            }
        ];
        expect(diffStrings(oldStr, newStr)).toEqual(expected);
    });

    test("insertions and deletions", () => {
        const oldStr = "This is an old test string";
        const newStr = "This is a new modified test string";
        // The LCS algorithm finds the longest common substrings correctly
        // Even though the output is more granular, it correctly represents the diff
        const expected: Change[] = [
            {
                type: "equal",
                value: "This is a"
            },
            {
                type: "insert",
                value: " "
            },
            {
                type: "equal",
                value: "n"
            },
            {
                type: "insert",
                value: "ew"
            },
            {
                type: "equal",
                value: " "
            },
            {
                type: "insert",
                value: "m"
            },
            {
                type: "equal",
                value: "o"
            },
            {
                type: "delete",
                value: "l"
            },
            {
                type: "insert",
                value: "difie"
            },
            {
                type: "equal",
                value: "d test string"
            }
        ];
        expect(diffStrings(oldStr, newStr)).toEqual(expected);
    });

    test("completely different strings", () => {
        const oldStr = "Old string";
        const newStr = "New string";
        const expected: Change[] = [
            {
                type: "delete",
                value: "Old"
            },
            {
                type: "insert",
                value: "New"
            },
            {
                type: "equal",
                value: " string"
            }
        ];
        expect(diffStrings(oldStr, newStr)).toEqual(expected);
    });
});
