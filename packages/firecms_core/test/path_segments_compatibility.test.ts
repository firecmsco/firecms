import { describe, expect, it, jest } from "@jest/globals";
import { AuthController, EntityCollection, PermissionsBuilderProps } from "../src/types";
import {
    getCollectionByPathOrId,
    getCollectionByPathSegments,
    walkPathSegments
} from "../src/util/navigation_utils";
import {
    collectionSegmentsFrom,
    fullPathToCollectionSegments,
    positionalCollectionSegments,
    stripCollectionPath
} from "../src/util/paths";
import { canCreateEntity, canDeleteEntity, canEditEntity, resolvePermissions } from "../src/util/permissions";
import { siteConfig } from "./test_site_config";

/**
 * Every `pathSegments` parameter added across the path-resolution helpers is optional and
 * additive. This suite is the upgrade contract: for a codebase that never passes them —
 * which is every existing app — each function must behave exactly as it did before.
 *
 * The second half covers what the segments actually buy: a chain whose parent entity id
 * contains "/", which the flattened-string versions cannot represent and, in the case of
 * `getCollectionByPathOrId`, reject outright by throwing.
 */

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
                properties: {}
            }
        ]
    }
];

const siteCollections = siteConfig.collections as EntityCollection[];

const authController = { user: null } as unknown as AuthController;

describe("omitting pathSegments preserves the previous behaviour", () => {

    const paths = [
        "products",
        "products/pid",
        "products/pid/locales",
        "product_price",
        "sites/es/products",
        "sites/es/products/pid/locales",
        "u",
        "u/uid/p"
    ];

    it.each(paths)("fullPathToCollectionSegments(%s)", (path) => {
        expect(fullPathToCollectionSegments(path)).toEqual(positionalCollectionSegments(path));
        // Feeding the positional split into the segment form is a no-op, so an app that
        // starts threading segments on a backend without slash-bearing ids sees no change.
        expect(collectionSegmentsFrom(path.split("/")))
            .toEqual(fullPathToCollectionSegments(path));
    });

    /**
     * These helpers take exactly one argument, and both are small enough to be passed
     * point-free. `paths.map(fn)` hands in `(value, index, array)`, so giving either of them
     * a second parameter would silently receive the array index — which is why the segment
     * forms are separate functions rather than extra parameters. `@firecms/firebase` does
     * exactly this, and caught it.
     */
    it("stays safe to pass point-free to map", () => {
        expect(paths.map(stripCollectionPath)).toEqual(paths.map(p => stripCollectionPath(p)));
        expect(paths.map(fullPathToCollectionSegments)).toEqual(paths.map(p => fullPathToCollectionSegments(p)));
        expect(stripCollectionPath.length).toEqual(1);
        expect(fullPathToCollectionSegments.length).toEqual(1);
    });

    it.each(["products", "products/pid/locales", "sites/es/products", "u", "u/uid/p"])(
        "getCollectionByPathOrId(%s)", (path) => {
            expect(getCollectionByPathOrId(path, siteCollections, path.split("/"))?.path)
                .toEqual(getCollectionByPathOrId(path, siteCollections)?.path);
        });

    it("still throws on an even-segment path when no segments are given", () => {
        // The pre-existing contract, unchanged: without segments the parity assertion is
        // the only signal that a path is malformed.
        expect(() => getCollectionByPathOrId("products/pid", siteCollections))
            .toThrow("Collection paths must have an odd number of segments: products/pid");
    });

    it("permission builders receive the same props as before", () => {
        const seen: PermissionsBuilderProps[] = [];
        const collection = {
            id: "locales",
            name: "Locales",
            path: "locales",
            properties: {},
            permissions: (props: PermissionsBuilderProps) => {
                seen.push(props);
                return { read: true, edit: true, create: true, delete: true };
            }
        } as unknown as EntityCollection;

        resolvePermissions(collection, authController, "products/pid/locales", null);
        resolvePermissions(collection, authController, "products/pid/locales", null, ["products", "pid", "locales"]);

        // `PermissionsBuilderProps.pathSegments` is the *collection* chain, a different
        // thing from the datasource segments — and its meaning has not changed.
        expect(seen[0].pathSegments).toEqual(["products", "locales"]);
        expect(seen[1].pathSegments).toEqual(seen[0].pathSegments);
        expect(seen[1].path).toEqual(seen[0].path);
    });

    it.each([canEditEntity, canCreateEntity, canDeleteEntity])("%p keeps its result", (fn) => {
        const collection = { id: "products", name: "Products", path: "products", properties: {} } as EntityCollection;
        expect(fn(collection, authController, "products", null, ["products"]))
            .toEqual(fn(collection, authController, "products", null));
    });

});

describe("what the segments make possible", () => {

    it("resolves a chain whose parent id contains a slash", () => {
        expect(getCollectionByPathSegments(["test", "test/test", "accommodation"], collections)?.path)
            .toEqual("accommodation");
    });

    it("resolves that same chain through getCollectionByPathOrId without throwing", () => {
        const segments = ["test", "test/test", "accommodation"];
        // Four "/"-separated parts: an even count, which the parity assertion rejects.
        expect(segments.join("/").split("/")).toHaveLength(4);
        expect(() => getCollectionByPathOrId(segments.join("/"), collections)).toThrow();
        expect(getCollectionByPathOrId(segments.join("/"), collections, segments)?.path)
            .toEqual("accommodation");
    });

    it("finds the collection when the chain ends on an entity", () => {
        expect(getCollectionByPathSegments(["test", "test/test"], collections)?.path).toEqual("test");
    });

    it("resolves an aliased subcollection under a slash-bearing id", () => {
        expect(getCollectionByPathSegments(["test", "test/test", "accommodation-alias"], collections)?.path)
            .toEqual("accommodation");
    });

    it("keeps the right collection chain for permissions", () => {
        // Positionally splitting "test/test/test/accommodation" keeps ["test", "test"];
        // the real segments keep ["test", "accommodation"].
        expect(positionalCollectionSegments("test/test/test/accommodation")).toEqual(["test", "test"]);
        expect(collectionSegmentsFrom(["test", "test/test", "accommodation"]))
            .toEqual(["test", "accommodation"]);
    });

    it("reports an unmatched segment rather than throwing", () => {
        const walk = walkPathSegments(["test", "test/test", "nope"], collections);
        expect(walk.collection).toBeUndefined();
        expect(walk.unmatched).toEqual("nope");
        // The remainder is still carried through, so nothing is silently dropped.
        expect(walk.resolved).toEqual(["test", "test/test", "nope"]);
    });

    it("returns undefined for a collection it cannot find, without warning", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
        expect(getCollectionByPathSegments(["nope"], collections)).toBeUndefined();
        // Lookup failure is a normal outcome; only alias *resolution* warns.
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

});
