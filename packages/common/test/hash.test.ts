import { hashString } from "../src/util/hash";

describe("hash utils", () => {
    describe("hashString", () => {
        it("should return 0 for empty string", () => {
            expect(hashString("")).toBe(0);
        });

        it("should hash a string consistently", () => {
            const str = "hello world";
            const hash1 = hashString(str);
            const hash2 = hashString(str);
            expect(hash1).toBe(hash2);
            expect(typeof hash1).toBe("number");
        });

        it("should generate different hashes for different strings", () => {
            expect(hashString("apple")).not.toBe(hashString("apples"));
        });

        it("should return a positive integer (Math.abs logic)", () => {
            const hash = hashString("some long string that might cause negative bitwise overflow");
            expect(hash).toBeGreaterThanOrEqual(0);
        });
    });
});
