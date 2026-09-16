import { describe, expect, it } from "@jest/globals";
import { EntityCollection } from "../src/types";
import { resolveCollectionPathIds } from "../src/util/navigation_utils";

/**
 * A collection only matches a path when the match ends where a segment ends.
 *
 * Matching any prefix meant a path that merely starts with a collection's path resolved to
 * that collection: the PRO template's own "open a custom entity" example
 * (`sideEntityController.open({ path: "/products-test" })`) became `products` with an entity
 * called `-test`, and the browser showed
 * `FirebaseError: Invalid document reference … products/-test/B003WT1622 has 3` segments.
 * A user collection called `products_archive` — what the collection editor generates from
 * "Products archive" — was resolved as `products` the same way.
 */
const collections: EntityCollection[] = [
    { id: "products", name: "Products", path: "products", properties: {} },
    { id: "products_archive", name: "Products archive", path: "products_archive", properties: {} },
    {
        id: "blog",
        name: "Blog",
        path: "blog",
        properties: {},
        subcollections: [
            { id: "comments", name: "Comments", path: "comments", properties: {} },
            { id: "comments_flagged", name: "Flagged comments", path: "comments_flagged", properties: {} }
        ]
    }
];

describe("resolveCollectionPathIds only matches whole segments", () => {

    it.each([
        ["products", "products"],
        ["products/B003WT1622", "products/B003WT1622"],
        ["products_archive", "products_archive"],
        ["products_archive/B003WT1622", "products_archive/B003WT1622"],
        ["blog/post-1/comments_flagged", "blog/post-1/comments_flagged"],
        ["blog/post-1/comments", "blog/post-1/comments"]
    ])("resolves %j to %j", (path, expected) => {
        expect(resolveCollectionPathIds(path, collections)).toEqual(expected);
    });

    it("leaves a path that only starts like a collection's path alone", () => {
        // No collection is called "products-test", so there is nothing to alias: the path
        // has to come back as it went in, for the caller's own collection to be used.
        expect(resolveCollectionPathIds("products-test", collections)).toEqual("products-test");
    });

});
