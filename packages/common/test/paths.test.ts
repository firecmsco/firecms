import { stripCollectionPath, segmentsToStrippedPath, fullPathToCollectionSegments, COLLECTION_PATH_SEPARATOR } from "../src/util/paths";

describe("paths utils", () => {
    describe("fullPathToCollectionSegments", () => {
        it("should extract collection path routes by taking every even index segment", () => {
            expect(fullPathToCollectionSegments("products")).toEqual(["products"]);
            expect(fullPathToCollectionSegments("products/123/locales")).toEqual(["products", "locales"]);
            expect(fullPathToCollectionSegments("users/abc/posts/xyz/comments")).toEqual(["users", "posts", "comments"]);
            expect(fullPathToCollectionSegments("users/abc/posts/xyz")).toEqual(["users", "posts"]); // Note: it resolves even length arrays based on splitting
        });
    });

    describe("segmentsToStrippedPath", () => {
        it("should join path segments with the constant separator", () => {
            expect(segmentsToStrippedPath(["products"])).toBe("products");
            expect(segmentsToStrippedPath(["products", "locales"])).toBe(`products${COLLECTION_PATH_SEPARATOR}locales`);
            expect(segmentsToStrippedPath(["users", "posts", "comments"])).toBe(`users${COLLECTION_PATH_SEPARATOR}posts${COLLECTION_PATH_SEPARATOR}comments`);
        });
    });

    describe("stripCollectionPath", () => {
        it("should remove document ids and join collections with separator", () => {
            expect(stripCollectionPath("products")).toBe("products");
            expect(stripCollectionPath("products/123/locales")).toBe(`products${COLLECTION_PATH_SEPARATOR}locales`);
            expect(stripCollectionPath("users/abc/posts/xyz/comments")).toBe(`users${COLLECTION_PATH_SEPARATOR}posts${COLLECTION_PATH_SEPARATOR}comments`);
        });
    });
});
