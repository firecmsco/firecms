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
                type: "insert",
                value: " new modified"
            },
            {
                type: "equal",
                value: " test string"
            }
        ];
        console.log(diffStrings(oldStr, newStr));
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
