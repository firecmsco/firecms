import { describe, expect, it } from "@jest/globals";
import { buildCollection } from "../src";
import {
    getNavigationEntriesFromPath,
    NavigationViewEntityInternal
} from "../src/util/navigation_from_path";
import { buildSidePanelsFromUrl } from "../src/internal/useBuildSideEntityController";

/**
 * `pathSegments` is the unambiguous form of `path`.
 *
 * `path` is a single flattened string, so a parent entity id containing "/" cannot be
 * recovered from it: "products/a/b/locales" could be a two-level nesting under the id
 * "a/b", or a three-level nesting. `pathSegments` keeps each entity id whole, however many
 * slashes it contains, so a custom datasource can address the right place.
 *
 * The compatibility contract: for any backend whose ids cannot contain "/", pathSegments
 * is exactly `path.split("/")` — so nothing changes for Firestore.
 */

const locales = buildCollection({ id: "locales", path: "locales", name: "Locales", properties: {} });

const products = buildCollection({
    id: "products",
    path: "products",
    name: "Products",
    properties: {},
    subcollections: [locales]
});

// A collection whose own path spans several segments — those are unambiguous and must be
// spread, not kept whole.
const experiences = buildCollection({
    id: "experiences",
    path: "users/uid123/experiences",
    name: "Experiences",
    properties: {},
    subcollections: [locales]
});

const collections = [products, experiences];

const entriesFor = (path: string) => getNavigationEntriesFromPath({ path, collections });

describe("pathSegments — compatibility with slash-free ids", () => {

    it.each([
        "products/pid",
        "products/pid/locales/lid",
        "users/uid123/experiences/x",
        "users/uid123/experiences/x/locales/y"
    ])("%s: pathSegments equals path.split for every entry", (path) => {
        const entries = entriesFor(path);
        expect(entries.length).toBeGreaterThan(0);

        for (const e of entries) {
            expect({ path: e.path, segments: e.pathSegments })
                .toEqual({ path: e.path, segments: e.path.split("/") });
        }
    });

    it("a multi-segment collection path is spread, not kept whole", () => {
        const entries = entriesFor("users/uid123/experiences/x");

        // "users/uid123/experiences" is collection/document/collection — unambiguous.
        expect(entries[0].pathSegments).toEqual(["users", "uid123", "experiences"]);
    });

});

describe("pathSegments — slash-bearing ids", () => {

    it("keeps a parent entity id whole where path cannot", () => {
        const entries = entriesFor("products/a%2Fb/locales/c%2Fd");
        const inner = entries[3] as NavigationViewEntityInternal<any>;

        // The flattened form is ambiguous...
        expect(inner.path).toEqual("products/a/b/locales");
        // ...the segmented form is not.
        expect(inner.pathSegments).toEqual(["products", "a/b", "locales"]);
        expect(inner.entityId).toEqual("c/d");
    });

    it("distinguishes a slash id from an extra nesting level", () => {
        // Same flattened path, different structure. `path` cannot tell these apart;
        // `pathSegments` must.
        const slashId = entriesFor("products/a%2Fb/locales/x").at(-1)!;

        expect(slashId.pathSegments).toEqual(["products", "a/b", "locales"]);
        expect(slashId.pathSegments.length).toEqual(3);
        // A genuine three-collection nesting would have produced 5 segments, so the length
        // alone separates the two readings.
    });

    it("accumulates through several levels", () => {
        const entries = entriesFor("users/uid123/experiences/x%2Fy/locales/z");

        expect(entries.at(-1)!.pathSegments)
            .toEqual(["users", "uid123", "experiences", "x/y", "locales"]);
    });

    it("segments rejoin to the flattened path when no id contains a slash", () => {
        for (const path of ["products/pid/locales/lid", "users/uid123/experiences/x"]) {
            for (const e of entriesFor(path)) {
                expect(e.pathSegments.join("/")).toEqual(e.path);
            }
        }
    });

    it("segments do NOT rejoin when an id contains a slash — that is the point", () => {
        const inner = entriesFor("products/a%2Fb/locales/c%2Fd").at(-1)!;

        // Rejoining loses the boundary, which is exactly why `path` is not enough.
        expect(inner.pathSegments.join("/")).toEqual(inner.path);
        expect(inner.pathSegments).not.toEqual(inner.path.split("/"));
        expect(inner.path.split("/")).toEqual(["products", "a", "b", "locales"]);
    });

});

describe("pathSegments — side panels", () => {

    it("carries segments so a side panel addresses the right place", () => {
        const panels = buildSidePanelsFromUrl("products/a%2Fb", collections, false);

        expect(panels).toHaveLength(1);
        expect(panels[0].entityId).toEqual("a/b");
        expect(panels[0].pathSegments).toEqual(["products"]);
    });

    it("carries segments for an entity inside a subcollection", () => {
        const panels = buildSidePanelsFromUrl("products/a%2Fb/locales/c%2Fd", collections, false);

        const last = panels.at(-1)!;
        expect(last.entityId).toEqual("c/d");
        expect(last.pathSegments).toEqual(["products", "a/b", "locales"]);
    });

});
