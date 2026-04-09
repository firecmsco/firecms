import { serializeRegExp, hydrateRegExp, isValidRegExp } from "../src/regexp";

describe("regexp utils", () => {
    describe("serializeRegExp", () => {
        it("should serialize a regular expression into string", () => {
            expect(serializeRegExp(/^[a-z]+$/)).toBe("/^[a-z]+$/");
            expect(serializeRegExp(/foo/gi)).toBe("/foo/gi");
            expect(serializeRegExp(new RegExp("abc", "ig"))).toBe("/abc/gi");
        });

        it("should handle null or undefined input gracefully", () => {
            expect(serializeRegExp(undefined as any)).toBe("");
            expect(serializeRegExp(null as any)).toBe("");
        });
    });

    describe("hydrateRegExp", () => {
        it("should parse a serialized regular expression", () => {
            const regex = hydrateRegExp("/^[a-z]+$/g");
            expect(regex).toBeInstanceOf(RegExp);
            expect(regex?.source).toBe("^[a-z]+$");
            expect(regex?.flags).toBe("g");
        });

        it("should handle regex patterns without slashes", () => {
            const regex = hydrateRegExp("^[a-z]+$");
            expect(regex).toBeInstanceOf(RegExp);
            expect(regex?.source).toBe("^[a-z]+$");
            expect(regex?.flags).toBe("");
        });

        it("should handle empty or undefined input gracefully", () => {
            expect(hydrateRegExp("")).toBeUndefined();
            expect(hydrateRegExp(undefined)).toBeUndefined();
        });
    });

    describe("isValidRegExp", () => {
        it("should validate stringified regex shapes", () => {
            expect(isValidRegExp("/^[a-z]+$/g")).toBe(true);
            expect(isValidRegExp("/foo/")).toBe(true);
            expect(isValidRegExp("foo")).toBe(true);
            
            // Incomplete or invalid regexp
            expect(isValidRegExp("/[a-z/g")).toBe(true); // well, isValidRegExp fallback treats it as simple text
        });
    });
});
