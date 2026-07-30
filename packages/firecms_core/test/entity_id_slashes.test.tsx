/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { buildCollection } from "../src";
import { useBuildNavigationController } from "../src/hooks/useBuildNavigationController";
import { NavigationController } from "../src/types";
import {
    getNavigationEntriesFromPath,
    NavigationViewEntityInternal
} from "../src/util/navigation_from_path";
import { getParentReferencesFromPath } from "../src/util/parent_references_from_path";
import { encodeEntityId, getCollectionPathsCombinations } from "../src/util/navigation_utils";
import { buildSidePanelsFromUrl } from "../src/internal/useBuildSideEntityController";

/**
 * ============================================================================
 * SPEC — DESIRED BEHAVIOUR. THESE TESTS FAIL ON PURPOSE.
 * ============================================================================
 *
 * Every test in this file describes behaviour FireCMS does not have yet. They are
 * red today and are expected to go green as the "slashes in entity ids" work lands.
 * Nothing here asserts current behaviour — that is what `entity_id_paths.test.ts`
 * and `navigation_url_encoding.test.tsx` are for.
 *
 * Wire format assumed by the parser specs: an entity id is percent-escaped before it is
 * joined into a path, so `/` travels as `%2F` and a literal `%` travels as `%25`. The
 * parsers are responsible for decoding the id segment back.
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
    subcollections: [locales]
});

const collections = [products];

async function buildNavigation(): Promise<NavigationController> {
    const wrapper = ({ children }: { children?: React.ReactNode }) =>
        <MemoryRouter>{children}</MemoryRouter>;

    const { result } = renderHook(() => useBuildNavigationController({
        collections,
        authController: {
            user: null,
            initialLoading: false
        } as any,
        dataSourceDelegate: {} as any
    }), { wrapper });

    await act(async () => undefined);

    return result.current;
}

describe("SPEC: entity ids containing slashes", () => {

    it("getNavigationEntriesFromPath decodes an escaped slash id back to one entity", () => {
        const entries = getNavigationEntriesFromPath({
            path: "products/a%2Fb",
            collections
        });

        expect(entries.map(e => e.type)).toEqual(["collection", "entity"]);
        expect((entries[1] as NavigationViewEntityInternal<any>).entityId).toEqual("a/b");
    });

    it("getNavigationEntriesFromPath decodes a literal percent in an id", () => {
        const entries = getNavigationEntriesFromPath({
            path: "products/50%25",
            collections
        });

        expect((entries[1] as NavigationViewEntityInternal<any>).entityId).toEqual("50%");
    });

    it("an escaped slash id does not shift the following subcollection segments", () => {
        const entries = getNavigationEntriesFromPath({
            path: "products/a%2Fb/locales/c%2Fd",
            collections
        });

        expect(entries.map(e => e.type)).toEqual(["collection", "entity", "collection", "entity"]);
        expect(entries
            .filter(e => e.type === "entity")
            .map(e => (e as NavigationViewEntityInternal<any>).entityId)).toEqual(["a/b", "c/d"]);
    });

    it("getParentReferencesFromPath decodes escaped slash ids", () => {
        const refs = getParentReferencesFromPath({
            path: "products/a%2Fb/locales/c%2Fd",
            collections
        });

        expect(refs.map(r => r.id)).toEqual(["a/b", "c/d"]);
    });

    it("buildSidePanelsFromUrl decodes an escaped slash id", () => {
        const panels = buildSidePanelsFromUrl("products/a%2Fb", collections, false);

        expect(panels).toEqual([{
            path: "products",
            fullIdPath: "products",
            entityId: "a/b",
            copy: false,
            width: undefined
        }]);
    });

    it("a slash id is distinguishable from a subcollection segment", () => {
        // "products/a%2Fb" is ONE entity with a slash in its id.
        // "products/a/b"   is the entity "a" followed by a (non-existent) segment "b".
        // The two must not parse to the same thing.
        const escaped = getNavigationEntriesFromPath({ path: "products/a%2Fb", collections });
        const raw = getNavigationEntriesFromPath({ path: "products/a/b", collections });

        expect((escaped[1] as NavigationViewEntityInternal<any>).entityId).toEqual("a/b");
        expect((raw[1] as NavigationViewEntityInternal<any>).entityId).toEqual("a");
    });

});

describe("SPEC: pre-existing path bugs", () => {

    it("getCollectionPathsCombinations does not mutate its input", () => {
        // navigation_utils.ts uses `splice` to drop the trailing segment on even-length
        // input, which drains the caller's array. It should build combinations without
        // touching the argument.
        const input = ["a", "b", "c", "d"];
        const result = getCollectionPathsCombinations(input);

        expect(result).toEqual(["a/b/c", "a"]);
        expect(input).toEqual(["a", "b", "c", "d"]);
    });

    /**
     * End-to-end: escape a raw id, build the URL, then parse it all the way back to a
     * navigation entry. `buildUrlCollectionPath` takes an already-joined path and cannot
     * tell an id from a collection segment, so the escaping has to happen at the call
     * site — which is what this exercises.
     */
    async function urlRoundTrip(rawId: string): Promise<string | undefined> {
        const navigation = await buildNavigation();
        const url = navigation.buildUrlCollectionPath(`products/${encodeEntityId(rawId)}`);
        const dataPath = navigation.urlPathToDataPath("/" + url);
        const entries = getNavigationEntriesFromPath({ path: dataPath, collections });
        return (entries[1] as NavigationViewEntityInternal<any>)?.entityId;
    }

    it.each([
        "a/b",
        "a#b",
        "a?b",
        "50%",
        "a%2Fb",
        "with space",
        "ünïcode",
        "plain"
    ])("an entity id %p survives a full URL round-trip", async (rawId) => {
        expect(await urlRoundTrip(rawId)).toEqual(rawId);
    });

});
