import { describe, expect, it, jest } from "@jest/globals";
import { EntityCollection } from "../src/types";
import { resolveCollectionPathIds, resolveCollectionPathSegments } from "../src/util/navigation_utils";
import { siteConfig } from "./test_site_config";

/**
 * `resolveCollectionPathIds` turns a path written with collection *ids* into one written
 * with their real *paths*. It works on the flattened string, so it has to find the entity
 * ids inside it — and it does that by reading up to the next "/".
 *
 * For an id containing "/" that is wrong: the id is truncated, every following segment
 * shifts by one, and resolution falls off the end with
 * `Collection definition not found for segment starting with "test/accommodation"` — the
 * warning users were seeing, alongside a silently corrupted `path` at the delegate.
 *
 * `resolveCollectionPathSegments` is told the boundaries instead of guessing them.
 */

/** A collection whose id differs from its path, so aliasing is actually exercised. */
const collections: EntityCollection[] = [
    {
        id: "test",
        name: "Test",
        path: "test",
        properties: {},
        subcollections: [
            {
                id: "accommodation-alias",
                name: "Accommodation",
                path: "accommodation",
                properties: {},
                subcollections: [
                    { id: "reviews", name: "Reviews", path: "reviews", properties: {} }
                ]
            }
        ]
    },
    {
        // A collection whose own path spans several segments.
        id: "experiences",
        name: "Experiences",
        path: "users/uid123/experiences",
        properties: {}
    }
];

describe("resolveCollectionPathSegments", () => {

    it("keeps a slash-bearing parent id whole", () => {
        expect(resolveCollectionPathSegments(["test", "test/test", "accommodation"], collections))
            .toEqual(["test", "test/test", "accommodation"]);
    });

    it("resolves a collection alias while keeping the slash-bearing id", () => {
        expect(resolveCollectionPathSegments(["test", "test/test", "accommodation-alias"], collections))
            .toEqual(["test", "test/test", "accommodation"]);
    });

    it("is idempotent — already-resolved segments pass through unchanged", () => {
        const once = resolveCollectionPathSegments(["test", "test/test", "accommodation-alias"], collections);
        expect(resolveCollectionPathSegments(once, collections)).toEqual(once);
    });

    it("resolves a nested chain of slash-bearing ids", () => {
        expect(resolveCollectionPathSegments(
            ["test", "test/test", "accommodation-alias", "room/7", "reviews"], collections))
            .toEqual(["test", "test/test", "accommodation", "room/7", "reviews"]);
    });

    it("spreads a collection whose own path spans several segments", () => {
        expect(resolveCollectionPathSegments(["experiences"], collections))
            .toEqual(["users", "uid123", "experiences"]);
        // …and matches it in its already-expanded form too.
        expect(resolveCollectionPathSegments(["users", "uid123", "experiences"], collections))
            .toEqual(["users", "uid123", "experiences"]);
    });

    it("stops at a collection alone, without demanding a trailing entity id", () => {
        expect(resolveCollectionPathSegments(["test"], collections)).toEqual(["test"]);
    });

    it("carries an unmatched chain through unresolved instead of dropping it", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
        expect(resolveCollectionPathSegments(["nope", "abc"], collections)).toEqual(["nope", "abc"]);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it("carries the remainder through when the chain runs past the defined subcollections", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
        // `experiences` has no subcollections, so "extra" cannot be resolved.
        expect(resolveCollectionPathSegments(["experiences", "e1", "extra"], collections))
            .toEqual(["users", "uid123", "experiences", "e1", "extra"]);
        warn.mockRestore();
    });

    it("handles an empty chain", () => {
        expect(resolveCollectionPathSegments([], collections)).toEqual([]);
    });

});

describe("resolveCollectionPathIds with segments", () => {

    it("no longer gives up on the reported path", () => {
        // Without segments the string walk truncates the id at the first slash: it consumes
        // "test" as the collection, "test" as the entity id, and is then left facing
        // "test/accommodation" with no collection that matches it.
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
        resolveCollectionPathIds("test/test/test/accommodation", collections);
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('Collection definition not found for segment starting with "test/accommodation"'));
        warn.mockRestore();

        // With them it resolves cleanly, and the id keeps its slash.
        expect(resolveCollectionPathIds("test/test/test/accommodation", collections,
            ["test", "test/test", "accommodation"]))
            .toEqual("test/test/test/accommodation");
    });

    it("resolves an alias the string walk silently leaves unresolved", () => {
        // Having given up, the string walk appends the rest of the path verbatim — so the
        // alias survives into the path handed to the delegate, pointing at nothing.
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
        expect(resolveCollectionPathIds("test/test/test/accommodation-alias", collections))
            .toEqual("test/test/test/accommodation-alias");
        warn.mockRestore();

        expect(resolveCollectionPathIds("test/test/test/accommodation-alias", collections,
            ["test", "test/test", "accommodation-alias"]))
            .toEqual("test/test/test/accommodation");
    });

    it("does not warn when segments are supplied", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
        resolveCollectionPathIds("test/test/test/accommodation", collections,
            ["test", "test/test", "accommodation"]);
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it("resolves aliases through the segments", () => {
        expect(resolveCollectionPathIds("test/test%2Ftest/accommodation-alias", collections,
            ["test", "test/test", "accommodation-alias"]))
            .toEqual("test/test/test/accommodation");
    });

    it("agrees with the string walk for any path without a slash-bearing id", () => {
        // The compatibility guarantee: supplying segments must not change existing results.
        for (const path of [
            "test",
            "test/abc",
            "test/abc/accommodation",
            "test/abc/accommodation-alias",
            "test/abc/accommodation/r1/reviews",
            "experiences",
            "users/uid123/experiences"
        ]) {
            const segments = path.split("/");
            expect(resolveCollectionPathIds(path, collections, segments))
                .toEqual(resolveCollectionPathIds(path, collections));
        }
    });

    it("is unchanged when no segments are passed", () => {
        expect(resolveCollectionPathIds("test/abc/accommodation-alias", collections))
            .toEqual("test/abc/accommodation");
    });

});

/**
 * The same compatibility guarantee against the real test site config, which has genuine
 * aliases (`product_price` → `prices`, `u` → `users`, `p` → `products`) and multi-segment
 * collection paths. Firestore ids cannot contain "/", so for every such app supplying
 * segments must be a no-op — that is the whole upgrade promise.
 */
describe("resolveCollectionPathIds against the real site config", () => {

    const siteCollections = siteConfig.collections as EntityCollection[];

    const paths = [
        "products",
        "products/pid",
        "products/pid/locales",
        "product_price",
        "product_price/pid/locales",
        "sites/es/products",
        "sites/es/products/pid/locales",
        "u",
        "u/uid/p",
        "users/uid/products"
    ];

    it.each(paths)("supplying segments does not change the result for %s", (path) => {
        expect(resolveCollectionPathIds(path, siteCollections, path.split("/")))
            .toEqual(resolveCollectionPathIds(path, siteCollections));
    });

    it.each(paths)("resolving the segments of %s round-trips to the same path", (path) => {
        expect(resolveCollectionPathSegments(path.split("/"), siteCollections).join("/"))
            .toEqual(resolveCollectionPathIds(path, siteCollections));
    });

});
