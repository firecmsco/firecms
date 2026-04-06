import { toArray } from "../src/util/arrays";

describe("arrays utils", () => {
    describe("toArray", () => {
        it("should return the same array if input is already an array", () => {
            const arr = [1, 2, 3];
            expect(toArray(arr)).toBe(arr); // reference equality
        });

        it("should wrap single element in an array", () => {
            expect(toArray("hello")).toEqual(["hello"]);
            expect(toArray(42)).toEqual([42]);
            expect(toArray({ a: 1 })).toEqual([{ a: 1 }]);
        });

        it("should return an empty array if input is falsy", () => {
            expect(toArray(undefined)).toEqual([]);
            expect(toArray(null as any)).toEqual([]);
            expect(toArray("")).toEqual([]); // "" is falsy, empty array is returned. Let's see... wait "" is falsy!
            // Wait: `input ? [input] : []` => if input is "", it returns []
            // Actually, `0` also becomes []
        });

        it("should treat boolean false and 0 as empty arrays because of falsy check", () => {
            expect(toArray(false)).toEqual([]);
            expect(toArray(0)).toEqual([]);
        });
    });
});
