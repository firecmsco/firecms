import { describe, expect, it } from "@jest/globals";
import { buildCollection } from "../src";
import {
    getNavigationEntriesFromPath,
    NavigationViewEntityInternal
} from "../src/util/navigation_from_path";
import { getParentReferencesFromPath } from "../src/util/parent_references_from_path";
import {
    encodeEntityId,
    getCollectionByPathOrId,
    getCollectionPathsCombinations,
    resolveCollectionPathIds
} from "../src/util/navigation_utils";
import { buildSidePanelsFromUrl } from "../src/internal/useBuildSideEntityController";

/**
 * Characterization tests for how an entity id survives the trip through path building
 * and path parsing.
 *
 * FireCMS encodes an entity location as a single flat string with the invariant
 * "odd segments are collections, even segments are entity ids". Every parser below
 * re-derives the entity id by splitting that string on "/".
 *
 * Entity ids are escaped with `encodeEntityId` before being joined into a path, so an id
 * is always exactly one segment. A RAW "/" in a path is therefore still a collection
 * separator — the tests below pin that distinction, which is what makes slash ids
 * unambiguous.
 *
 * The desired-behaviour spec lives in `entity_id_slashes.test.tsx`.
 */

const locales = buildCollection({
    id: "locales",
    path: "locales",
    name: "Locales",
    properties: {}
});

const products = buildCollection({
    id: "products",
    path: "products",
    name: "Products",
    properties: {},
    entityViews: [{ key: "custom_view", name: "Custom view" }],
    subcollections: [locales]
});

// A collection whose id differs from its (multi-segment) path, like the real fixtures use.
const experiences = buildCollection({
    id: "experiences",
    path: "users/uid123/experiences",
    name: "Experiences",
    properties: {},
    subcollections: [locales]
});

const collections = [products, experiences];

/**
 * Entity ids that contain no "/" and therefore MUST keep working exactly as they do
 * today. This is the true regression net: every one of these is a legal Firestore
 * document id.
 *
 * Paths are built with `encodeEntityId`, which is the contract the parsers now expect.
 * For all but "50%" that escaping is the identity function — see the test below — so
 * these cases exercise byte-identical input to what FireCMS produced before.
 */
const SLASH_FREE_IDS = [
    "plain",
    "B000P0MDMS",
    "12345",
    "with space",
    "ünïcode",
    "a.b",
    "a-b",
    "a_b",
    "50%",
    "a+b",
    "a&b",
    "products" // id that collides with the parent collection path
];

/** Path form of an id, as it travels inside a URL-derived path string. */
const wire = (id: string) => encodeEntityId(id);

describe("entity ids without slashes (regression net — must not change)", () => {

    it.each(SLASH_FREE_IDS)("getNavigationEntriesFromPath keeps %p intact", (id) => {
        const entries = getNavigationEntriesFromPath({
            path: `products/${wire(id)}`,
            collections
        });

        expect(entries.map(e => e.type)).toEqual(["collection", "entity"]);
        expect((entries[1] as NavigationViewEntityInternal<any>).entityId).toEqual(id);
        expect(entries[1].fullPath).toEqual(`products/${wire(id)}`);
    });

    it.each(SLASH_FREE_IDS)("getParentReferencesFromPath keeps %p intact", (id) => {
        const refs = getParentReferencesFromPath({
            path: `products/${wire(id)}/locales/inner`,
            collections
        });

        expect(refs.map(r => r.id)).toEqual([id, "inner"]);
        expect(refs.map(r => r.path)).toEqual(["products", `products/${id}/locales`]);
    });

    it.each(SLASH_FREE_IDS)("buildSidePanelsFromUrl keeps %p intact", (id) => {
        const panels = buildSidePanelsFromUrl(`products/${wire(id)}`, collections, false);

        expect(panels).toEqual([{
            path: "products",
            pathSegments: ["products"],
            fullIdPath: "products",
            entityId: id,
            copy: false,
            width: undefined
        }]);
    });

    it.each(SLASH_FREE_IDS)("resolveCollectionPathIds keeps %p intact in a subcollection path", (id) => {
        expect(resolveCollectionPathIds(`products/${wire(id)}/locales`, collections))
            .toEqual(`products/${wire(id)}/locales`);
    });

    it.each(SLASH_FREE_IDS)("nesting under a multi-segment collection path keeps %p intact", (id) => {
        const entries = getNavigationEntriesFromPath({
            path: `users/uid123/experiences/${wire(id)}`,
            collections
        });

        expect(entries.map(e => e.type)).toEqual(["collection", "entity"]);
        expect((entries[1] as NavigationViewEntityInternal<any>).entityId).toEqual(id);
    });

    it("resolves an entity, its custom view and its subcollection", () => {
        expect(getNavigationEntriesFromPath({
            path: "products/pid/custom_view",
            collections
        }).map(e => e.type)).toEqual(["collection", "entity", "custom_view"]);

        expect(getNavigationEntriesFromPath({
            path: "products/pid/locales/lid",
            collections
        }).map(e => e.type)).toEqual(["collection", "entity", "collection", "entity"]);
    });

});

describe("escaping is what separates an id from a path segment", () => {

    it("escaping is the identity for ids with no reserved character", () => {
        // The reason this change is invisible to virtually every existing Firestore id.
        for (const id of SLASH_FREE_IDS.filter(i => i !== "50%")) {
            expect(encodeEntityId(id)).toEqual(id);
        }
        expect(encodeEntityId("50%")).toEqual("50%25");
    });

    it("a RAW slash is still a collection separator, not part of an id", () => {
        const entries = getNavigationEntriesFromPath({
            path: "products/a/b",
            collections
        });

        // Unescaped input is unchanged from before: "a" is the entity, "b" is read as a
        // following segment. This is what makes the escaped form unambiguous.
        expect((entries[1] as NavigationViewEntityInternal<any>).entityId).toEqual("a");
        expect(entries[1].fullPath).toEqual("products/a");
    });

    it("an escaped slash is part of the id", () => {
        const entries = getNavigationEntriesFromPath({
            path: "products/a%2Fb",
            collections
        });

        expect((entries[1] as NavigationViewEntityInternal<any>).entityId).toEqual("a/b");
        expect(entries.length).toEqual(2);
    });

    it("the entity entry exposes a raw path for the datasource and an escaped fullPath for URLs", () => {
        const entries = getNavigationEntriesFromPath({
            path: "products/a%2Fb/locales/c%2Fd",
            collections
        });

        const inner = entries[3] as NavigationViewEntityInternal<any>;
        expect(inner.entityId).toEqual("c/d");
        // `path` addresses the datasource, so parent ids are raw...
        expect(inner.path).toEqual("products/a/b/locales");
        // ...while `fullPath` is fed back to buildUrlCollectionPath, so they stay escaped.
        expect(inner.fullPath).toEqual("products/a%2Fb/locales/c%2Fd");
    });

    it("exposes unambiguous pathSegments for the datasource", () => {
        const entries = getNavigationEntriesFromPath({
            path: "products/a%2Fb/locales/c%2Fd",
            collections
        });

        // `path` on the inner entries is the flattened "products/a/b/locales", which cannot
        // be re-split correctly. `pathSegments` keeps the parent id whole.
        expect((entries[3] as NavigationViewEntityInternal<any>).path).toEqual("products/a/b/locales");
        expect((entries[3] as NavigationViewEntityInternal<any>).pathSegments)
            .toEqual(["products", "a/b", "locales"]);
        expect((entries[3] as NavigationViewEntityInternal<any>).entityId).toEqual("c/d");
    });

    it("pathSegments equals path.split for ids without slashes", () => {
        // The compatibility guarantee: for any backend whose ids cannot contain "/",
        // pathSegments carries no new information.
        for (const p of ["products/pid", "products/pid/locales/lid", "users/uid123/experiences/x"]) {
            const entries = getNavigationEntriesFromPath({ path: p, collections });
            for (const e of entries) {
                expect({ path: e.path, segments: e.pathSegments })
                    .toEqual({ path: e.path, segments: e.path.split("/") });
            }
        }
    });

    it("an escaped id keeps segment parity, so the odd-segment guard is not tripped", () => {
        expect(getCollectionByPathOrId("products/a%2Fb/locales", collections)?.path)
            .toEqual("locales");

        // A raw slash still flips parity and is rejected.
        expect(() => getCollectionByPathOrId("products/a/b/locales", collections))
            .toThrow("Collection paths must have an odd number of segments: products/a/b/locales");
    });

});

describe("path segment helpers", () => {

    it("getCollectionPathsCombinations builds longest-first combinations", () => {
        expect(getCollectionPathsCombinations(["a", "b", "c"])).toEqual(["a/b/c", "a"]);
        expect(getCollectionPathsCombinations(["a"])).toEqual(["a"]);
        expect(getCollectionPathsCombinations([])).toEqual([]);
    });

    it("getCollectionPathsCombinations does not mutate its input on even lengths", () => {
        const input = ["a", "b", "c", "d"];
        const result = getCollectionPathsCombinations(input);

        expect(result).toEqual(["a/b/c", "a"]);
        expect(input).toEqual(["a", "b", "c", "d"]);
    });

    it("getCollectionByPathOrId resolves by id and by path", () => {
        expect(getCollectionByPathOrId("products", collections)?.path).toEqual("products");
        expect(getCollectionByPathOrId("users/uid123/experiences", collections)?.id).toEqual("experiences");
        expect(getCollectionByPathOrId("products/pid/locales", collections)?.path).toEqual("locales");
        expect(getCollectionByPathOrId("nope", collections)).toEqual(undefined);
    });

    it("getCollectionByPathOrId rejects even segment counts", () => {
        expect(() => getCollectionByPathOrId("products/pid", collections))
            .toThrow("Collection paths must have an odd number of segments: products/pid");
    });

});
