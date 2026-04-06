import {
    removeInitialAndTrailingSlashes,
    removeInitialSlash,
    removeTrailingSlash,
    addInitialSlash,
    getLastSegment,
    getCollectionPathsCombinations,
} from "../src/util/navigation_utils";

// ─────────────────────────────────────────────────────────────
// removeInitialSlash / removeTrailingSlash / removeInitialAndTrailingSlashes
// ─────────────────────────────────────────────────────────────
describe("slash utilities", () => {
    describe("removeInitialSlash", () => {
        it("removes leading slash", () => {
            expect(removeInitialSlash("/products")).toBe("products");
        });

        it("returns string without leading slash as-is", () => {
            expect(removeInitialSlash("products")).toBe("products");
        });

        it("handles empty string", () => {
            expect(removeInitialSlash("")).toBe("");
        });

        it("removes only the first slash", () => {
            expect(removeInitialSlash("/a/b")).toBe("a/b");
        });
    });

    describe("removeTrailingSlash", () => {
        it("removes trailing slash", () => {
            expect(removeTrailingSlash("products/")).toBe("products");
        });

        it("returns string without trailing slash as-is", () => {
            expect(removeTrailingSlash("products")).toBe("products");
        });

        it("handles empty string", () => {
            expect(removeTrailingSlash("")).toBe("");
        });
    });

    describe("removeInitialAndTrailingSlashes", () => {
        it("removes both slashes", () => {
            expect(removeInitialAndTrailingSlashes("/products/")).toBe("products");
        });

        it("handles no slashes", () => {
            expect(removeInitialAndTrailingSlashes("products")).toBe("products");
        });

        it("handles only leading slash", () => {
            expect(removeInitialAndTrailingSlashes("/products")).toBe("products");
        });

        it("handles only trailing slash", () => {
            expect(removeInitialAndTrailingSlashes("products/")).toBe("products");
        });

        it("handles nested paths", () => {
            expect(removeInitialAndTrailingSlashes("/a/b/c/")).toBe("a/b/c");
        });
    });

    describe("addInitialSlash", () => {
        it("adds slash when missing", () => {
            expect(addInitialSlash("products")).toBe("/products");
        });

        it("does not double slash", () => {
            expect(addInitialSlash("/products")).toBe("/products");
        });

        it("handles empty string", () => {
            expect(addInitialSlash("")).toBe("/");
        });
    });
});

// ─────────────────────────────────────────────────────────────
// getLastSegment
// ─────────────────────────────────────────────────────────────
describe("getLastSegment", () => {
    it("returns last segment of a path", () => {
        expect(getLastSegment("users/123/posts")).toBe("posts");
    });

    it("returns single segment as-is", () => {
        expect(getLastSegment("products")).toBe("products");
    });

    it("handles leading/trailing slashes", () => {
        expect(getLastSegment("/users/123/")).toBe("123");
    });

    it("handles deeply nested paths", () => {
        expect(getLastSegment("a/b/c/d/e")).toBe("e");
    });
});

// ─────────────────────────────────────────────────────────────
// getCollectionPathsCombinations
// ─────────────────────────────────────────────────────────────
describe("getCollectionPathsCombinations", () => {
    it("generates combinations from a simple path", () => {
        const result = getCollectionPathsCombinations(["products"]);
        expect(result).toEqual(["products"]);
    });

    it("generates combinations from a path with subcollections", () => {
        const result = getCollectionPathsCombinations(["sites", "es", "locales"]);
        expect(result).toEqual(["sites/es/locales", "sites"]);
    });

    it("generates combinations from a deep path", () => {
        const result = getCollectionPathsCombinations(["a", "1", "b", "2", "c"]);
        expect(result).toEqual(["a/1/b/2/c", "a/1/b", "a"]);
    });

    it("handles empty array", () => {
        const result = getCollectionPathsCombinations([]);
        expect(result).toEqual([]);
    });
});
