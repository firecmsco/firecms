import { describe, expect, it } from "@jest/globals";
import { getArrayValuesCount } from "../src";

describe("getArrayValuesCount", () => {
    it("should correctly calculate array values count for flat objects", () => {
        const array = [
            { a: [1, 2, 3], b: [1, 2], c: [1] },
            { a: [1, 2], b: [1, 2, 3, 4], c: [] },
            { a: [1], b: [], c: [1, 2, 3, 4, 5] }
        ];
        const result = getArrayValuesCount(array);
        expect(result).toEqual({ a: 3, b: 4, c: 5 });
    });

    it("should correctly calculate array values count for nested objects", () => {
        const array = [
            { a: { b: [1, 2, 3], c: { d: [1, 2], e: [1] } } },
            { a: { b: [1, 2], c: { d: [1, 2, 3, 4], e: [] } } },
            { a: { b: [1], c: { d: [], e: [1, 2, 3, 4, 5] } } }
        ];
        const result = getArrayValuesCount(array);
        expect(result).toEqual({ "a.b": 3, "a.c.d": 4, "a.c.e": 5 });
    });

    it("should handle empty input", () => {
        const array: any[] = [];
        const result = getArrayValuesCount(array);
        expect(result).toEqual({});
    });

    it("should handle non-array properties", () => {
        const array = [
            { a: "string", b: 123, c: false },
            { a: [1, 2], b: [1, 2, 3, 4], c: [] },
        ];
        const result = getArrayValuesCount(array);
        expect(result).toEqual({ a: 2, b: 4, c: 0 });
    });

    it("should ignore non-array properties", () => {
        const array = [
            { a: "string", b: 123, c: false },
            { a: [1, 2], b: [1, 2, 3, 4], c: null },
        ];
        const result = getArrayValuesCount(array);
        expect(result).toEqual({ a: 2, b: 4 });
    });
});
