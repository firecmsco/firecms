import { describe, expect, it } from "@jest/globals";
import { entityCacheKey } from "../src/util/entity_cache";

/**
 * Caches key entities by path and id. Built by plain concatenation, `("a", "b/c")` and
 * `("a/b", "c")` both flatten to `"a/b/c"` — two different entities sharing one cache
 * entry, so one is served the other's values: a draft restored into the wrong form, a
 * reference preview showing the wrong record.
 *
 * These are in-memory and localStorage caches, so a collision is a wrong render rather than
 * wrong data at rest — but it is wrong on screen, which is what the user sees.
 */
describe("entityCacheKey", () => {

    it("does not collide when the slash falls in a different place", () => {
        expect(entityCacheKey("a", "b/c")).not.toEqual(entityCacheKey("a/b", "c"));
    });

    it("separates a slash-bearing id from a deeper collection path", () => {
        // The client's shape: `test` / id `test/test` versus `test/test/test` / id `x`.
        expect(entityCacheKey("test", "test/test"))
            .not.toEqual(entityCacheKey("test/test", "test"));
    });

    it("is stable for the same pair", () => {
        expect(entityCacheKey("test", "test/test")).toEqual(entityCacheKey("test", "test/test"));
    });

    it("is unchanged for ids that cannot contain a slash", () => {
        // The compatibility guarantee: every existing app keys exactly as before, so no
        // cached draft is orphaned by upgrading.
        for (const [path, id] of [["products", "pid"], ["products/pid/locales", "es"], ["a", "b"]]) {
            expect(entityCacheKey(path, id)).toEqual(`${path}/${id}`);
        }
    });

    it("keeps the old key when a part is missing", () => {
        expect(entityCacheKey("products", undefined)).toEqual("products/undefined");
        expect(entityCacheKey(undefined, "pid")).toEqual("undefined/pid");
    });

    it("round-trips: the id is recoverable from the key", () => {
        // What injectivity buys: the last "/" always separates path from id, because the id
        // can no longer contain one.
        const key = entityCacheKey("test", "test/test");
        const idx = key.lastIndexOf("/");
        expect(key.slice(0, idx)).toEqual("test");
        expect(decodeURIComponent(key.slice(idx + 1))).toEqual("test/test");
    });

});
