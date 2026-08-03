/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { EntityCollection } from "../src/types";
import { useBuildNavigationController } from "../src/hooks/useBuildNavigationController";
import { getParentReferencesFromPathSegments } from "../src/util/parent_references_from_path";

/**
 * The unit tests cover the resolution helpers; this covers the wiring. `NavigationController`
 * is what every component actually calls, and a helper that is correct but not reached from
 * the controller fixes nothing.
 *
 * The collections below use a slash-bearing parent id (`test/test`) and an alias whose `id`
 * differs from its `path`, so both failure modes are exercised at once.
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
                properties: {},
                subcollections: [
                    { id: "reviews", name: "Reviews", path: "reviews", properties: {} }
                ]
            }
        ]
    }
];

const SEGMENTS = ["test", "test/test", "accommodation"];
const PATH = "test/test/test/accommodation";

const wrapper = ({ children }: { children?: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

function build() {
    const { result } = renderHook(() => useBuildNavigationController({
        collections,
        authController: { user: null, initialLoading: false } as any,
        dataSourceDelegate: { key: "test", initialised: true } as any
    }), { wrapper });
    return result;
}

describe("NavigationController exposes the segment-aware resolution", () => {

    it("resolveSegmentsFrom is provided and resolves aliases", async () => {
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));

        expect(typeof result.current.resolveSegmentsFrom).toBe("function");
        expect(result.current.resolveSegmentsFrom!(["test", "test/test", "accommodation-alias"]))
            .toEqual(SEGMENTS);
    });

    it("resolveIdsFrom uses the segments instead of splitting the path", async () => {
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));

        expect(result.current.resolveIdsFrom("test/test/test/accommodation-alias",
            ["test", "test/test", "accommodation-alias"]))
            .toEqual(PATH);
    });

    it("getCollection resolves a chain the string form rejects", async () => {
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));

        // Four "/"-separated parts, so the parity assertion throws without segments.
        expect(() => result.current.getCollection(PATH)).toThrow();
        expect(result.current.getCollection(PATH, false, SEGMENTS)?.path).toEqual("accommodation");
    });

    it("getCollection is unchanged for an ordinary path", async () => {
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));

        expect(result.current.getCollection("test")?.path).toEqual("test");
        expect(result.current.getCollection("test", false, ["test"])?.path).toEqual("test");
    });

    it("getParentCollectionIds keeps the right chain", async () => {
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));

        // Positionally splitting `PATH` keeps ["test"] then pops it, losing the parent.
        expect(result.current.getParentCollectionIds(PATH, SEGMENTS)).toEqual(["test"]);

        const deeper = [...SEGMENTS, "room/7", "reviews"];
        expect(result.current.getParentCollectionIds(deeper.join("/"), deeper))
            .toEqual(["test", "accommodation-alias"]);
    });

    it("getParentReferencesFromPath keeps a slash-bearing parent id whole", async () => {
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));

        const refs = result.current.getParentReferencesFromPath(PATH, SEGMENTS);
        expect(refs).toHaveLength(1);
        expect(refs[0].id).toEqual("test/test");
        expect(refs[0].path).toEqual("test");
        expect(refs[0].pathSegments).toEqual(["test"]);
    });

});

/**
 * `getParentReferencesFromPath` expects an ESCAPED path, because it comes from the URL and
 * decodes the ids on the way out. `EntityCollectionView` was handing it a raw `entity.path`
 * for the collection-group "Parent entities" column, so a raw id containing "/" was both
 * mis-split and mis-decoded. The segment form has neither problem.
 */
describe("getParentReferencesFromPathSegments", () => {

    it("returns one reference per parent entity, ids kept whole", () => {
        const refs = getParentReferencesFromPathSegments(
            ["test", "test/test", "accommodation", "room/7", "reviews"], collections);

        expect(refs.map(r => r.id)).toEqual(["test/test", "room/7"]);
        expect(refs.map(r => r.path)).toEqual(["test", "test/test/test/accommodation"]);
        expect(refs[1].pathSegments).toEqual(["test", "test/test", "accommodation"]);
    });

    it("does not decode: a raw id containing %2F stays literal", () => {
        // The string form would turn "a%2Fb" into "a/b". These are different entities.
        const refs = getParentReferencesFromPathSegments(["test", "a%2Fb", "accommodation"], collections);
        expect(refs[0].id).toEqual("a%2Fb");
    });

    it("resolves aliases in the collection path", () => {
        const refs = getParentReferencesFromPathSegments(
            ["test", "test/test", "accommodation-alias", "r1", "reviews"], collections);
        expect(refs[1].path).toEqual("test/test/test/accommodation");
    });

    it("returns nothing for a chain with no parent entity", () => {
        expect(getParentReferencesFromPathSegments(["test"], collections)).toEqual([]);
    });

    it("stops cleanly at an unmatched segment", () => {
        expect(getParentReferencesFromPathSegments(["nope", "x"], collections)).toEqual([]);
    });

});
