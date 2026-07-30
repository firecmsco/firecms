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

/**
 * Characterization tests for the URL layer: `buildUrlCollectionPath` (which runs the
 * private `encodePath`) and `urlPathToDataPath` (which runs `decodeURIComponent`).
 *
 * Together these are the encode/decode pair that any "slashes in entity ids" support has
 * to travel through, so they need pinning before the parsers are touched.
 *
 * This layer is deliberately id-agnostic: it treats "/", "?" and "#" as structure, and
 * entity ids are escaped by the caller before reaching it. The end-to-end behaviour lives
 * in `entity_id_slashes.test.tsx`.
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

async function buildNavigation(): Promise<NavigationController> {
    const wrapper = ({ children }: { children?: React.ReactNode }) =>
        <MemoryRouter>{children}</MemoryRouter>;

    const { result } = renderHook(() => useBuildNavigationController({
        collections: [products],
        authController: {
            user: null,
            initialLoading: false
        } as any,
        dataSourceDelegate: {} as any
    }), { wrapper });

    // `refreshNavigation` resolves asynchronously and sets state; flush it so the
    // controller is initialised and React does not warn about un-acted updates.
    await act(async () => undefined);

    return result.current;
}

/**
 * Entity ids that must survive a full URL round-trip unchanged. Every one of these is a
 * legal Firestore document id, so this is the "do not break Firestore" guarantee.
 */
const ROUND_TRIPPING_IDS = [
    "plain",
    "B000P0MDMS",
    "12345",
    "with space",
    "ünïcode",
    "a.b",
    "a-b",
    "a_b",
    "50%",
    "a%2Fb",
    "a+b",
    "a&b",
    "products"
];

describe("entity id URL round-trip", () => {

    it.each(ROUND_TRIPPING_IDS)("round-trips %p unchanged", async (id) => {
        const navigation = await buildNavigation();

        const url = navigation.buildUrlCollectionPath(`products/${id}`);
        expect(navigation.urlPathToDataPath("/" + url)).toEqual(`/products/${id}`);
    });

    it("percent-encodes reserved characters in the URL but keeps collection separators literal", async () => {
        const navigation = await buildNavigation();

        expect(navigation.buildUrlCollectionPath("products/with space"))
            .toEqual("c/products/with%20space");
        expect(navigation.buildUrlCollectionPath("products/ünïcode"))
            .toEqual("c/products/%C3%BCn%C3%AFcode");
        expect(navigation.buildUrlCollectionPath("products/50%"))
            .toEqual("c/products/50%25");

        // Collection separators must stay literal "/" — this is why encodePath
        // deliberately un-escapes %2F, and why slash ids cannot work today.
        expect(navigation.buildUrlCollectionPath("products/pid/locales/lid"))
            .toEqual("c/products/pid/locales/lid");
    });

    it("an id escaped as %2F survives encodePath as %252F", async () => {
        const navigation = await buildNavigation();

        // The mechanism the planned fix depends on: encodeURIComponent turns "%2F" into
        // "%252F", which the `.replaceAll("%2F", "/")` in encodePath does NOT match, so
        // the escape survives into the URL and decodes back to "%2F".
        const url = navigation.buildUrlCollectionPath("products/a%2Fb");
        expect(url).toEqual("c/products/a%252Fb");
        expect(navigation.urlPathToDataPath("/" + url)).toEqual("/products/a%2Fb");
    });

    /**
     * The three tests below pin `buildUrlCollectionPath`'s treatment of "/", "?" and "#"
     * as STRUCTURE. It receives an already-joined path and cannot tell an id from a
     * collection segment, which is precisely why escaping happens at the call sites
     * (`encodeEntityId`) rather than here. See `entity_id_slashes.test.tsx` for the
     * end-to-end round-trip that relies on this.
     */
    it("treats a raw slash as a collection separator", async () => {
        const navigation = await buildNavigation();

        expect(navigation.buildUrlCollectionPath("products/a/b")).toEqual("c/products/a/b");
    });

    it("treats a raw # or ? as the start of the hash or query", async () => {
        const navigation = await buildNavigation();

        const hashUrl = navigation.buildUrlCollectionPath("products/a#b");
        expect(hashUrl).toEqual("c/products/a#b");
        expect(navigation.urlPathToDataPath("/" + hashUrl)).toEqual("/products/a");

        const queryUrl = navigation.buildUrlCollectionPath("products/a?b");
        expect(queryUrl).toEqual("c/products/a?b");
        expect(navigation.urlPathToDataPath("/" + queryUrl)).toEqual("/products/a");
    });

    it("preserves a genuine query string and hash", async () => {
        const navigation = await buildNavigation();

        expect(navigation.buildUrlCollectionPath("products/pid#side"))
            .toEqual("c/products/pid#side");
        expect(navigation.buildUrlCollectionPath("products?filter=1"))
            .toEqual("c/products?filter=1");
        expect(navigation.buildUrlCollectionPath("products/pid?filter=1#side"))
            .toEqual("c/products/pid?filter=1#side");
    });

    it("urlPathToDataPath strips the collection prefix and rejects foreign paths", async () => {
        const navigation = await buildNavigation();

        expect(navigation.urlPathToDataPath("/c/products/pid")).toEqual("/products/pid");
        expect(navigation.urlPathToDataPath("/c/products/pid#side")).toEqual("/products/pid");
        expect(navigation.urlPathToDataPath("/c/products/pid?filter=1")).toEqual("/products/pid");
        expect(() => navigation.urlPathToDataPath("/somewhere/else"))
            .toThrow("Expected path starting with /c");
    });

    it("isUrlCollectionPath recognises collection URLs", async () => {
        const navigation = await buildNavigation();

        expect(navigation.isUrlCollectionPath("/c/products")).toEqual(true);
        expect(navigation.isUrlCollectionPath("/c/products/pid")).toEqual(true);
        expect(navigation.isUrlCollectionPath("/other")).toEqual(false);
    });

});
