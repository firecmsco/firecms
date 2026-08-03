/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useBuildDataSource } from "../src/internal/useBuildDataSource";
import { saveEntityWithCallbacks } from "../src/hooks/data/save";
import { buildSubcollectionPathSegments } from "../src/util/navigation_utils";

/**
 * Reads were fixed first; writes were missed. `EntityForm` had `pathSegments` in scope and
 * used it for `generateEntityId` and `checkUniqueField`, but not for the save itself — so
 * every write to a collection under a slash-bearing parent id reached the delegate with
 * `pathSegments: undefined`.
 *
 * The return trip was broken too: `useBuildDataSource.saveEntity` re-projected the
 * delegate's result as `{ id, path, values }`, discarding `pathSegments` and `databaseId`,
 * so a just-saved entity could not be deleted or referenced unambiguously.
 */

const collection = { id: "accommodation", path: "accommodation", name: "Accommodation", properties: {} } as any;

// The reported case: a parent entity whose id is "test/test".
const PATH = "test/test/test/accommodation";
const SEGMENTS = ["test", "test/test", "accommodation"];

function build(saveResult?: Record<string, any>) {
    const calls: Record<string, any[]> = {};
    const delegate = {
        key: "recording",
        initialised: true,
        saveEntity: async (p: any) => {
            (calls.saveEntity ??= []).push(p);
            return {
                id: "created",
                path: p.path,
                values: {},
                ...saveResult
            };
        },
        fetchCollection: async () => [],
        delegateToCMSModel: (d: any) => d,
        cmsToDelegateModel: (d: any) => d,
        currentTime: () => new Date()
    } as any;

    const { result } = renderHook(() => useBuildDataSource({
        delegate,
        navigationController: { resolveIdsFrom: (p: string) => p, getCollection: () => collection } as any,
        authController: { user: null } as any
    }));
    return { calls, dataSource: result.current };
}

describe("writes carry pathSegments to the delegate", () => {

    it("saveEntityWithCallbacks forwards the segments it was given", async () => {
        const { calls, dataSource } = build();

        await saveEntityWithCallbacks({
            path: PATH,
            pathSegments: SEGMENTS,
            entityId: "room-1",
            values: {},
            collection,
            status: "existing",
            dataSource,
            context: { navigation: { resolveIdsFrom: (p: string) => p } } as any
        });

        expect(calls.saveEntity[0].pathSegments).toEqual(SEGMENTS);
        // Three segments, not the four that splitting the flattened path would produce.
        expect(calls.saveEntity[0].pathSegments).toHaveLength(3);
    });

    it("does not invent segments when the caller has none", async () => {
        const { calls, dataSource } = build();

        await saveEntityWithCallbacks({
            path: PATH,
            entityId: "room-1",
            values: {},
            collection,
            status: "existing",
            dataSource,
            context: { navigation: { resolveIdsFrom: (p: string) => p } } as any
        });

        expect(calls.saveEntity[0].pathSegments).toBeUndefined();
    });

});

describe("the saved entity comes back resolvable", () => {

    it("preserves the pathSegments and databaseId the delegate resolved", async () => {
        const { dataSource } = build({ pathSegments: SEGMENTS, databaseId: "secondary" });

        const saved = await dataSource.saveEntity({
            path: PATH,
            pathSegments: SEGMENTS,
            entityId: "room-1",
            values: {},
            collection,
            status: "existing"
        });

        expect(saved.pathSegments).toEqual(SEGMENTS);
        expect(saved.databaseId).toEqual("secondary");
    });

    it("carries the segments it saved with when the delegate predates the field", async () => {
        // A delegate written before `pathSegments` existed returns none. The segments the
        // save was issued with describe exactly this entity's collection, so they are the
        // authoritative answer rather than a guess.
        const { dataSource } = build();

        const saved = await dataSource.saveEntity({
            path: PATH,
            pathSegments: SEGMENTS,
            entityId: "room-1",
            values: {},
            collection,
            status: "existing"
        });

        expect(saved.pathSegments).toEqual(SEGMENTS);
    });

    it("leaves them undefined when nobody knows them", async () => {
        const { dataSource } = build();

        const saved = await dataSource.saveEntity({
            path: PATH,
            entityId: "room-1",
            values: {},
            collection,
            status: "existing"
        });

        expect(saved.pathSegments).toBeUndefined();
    });

});

/**
 * The subcollection arithmetic that produced the reported
 * `countEntitiesImpl {path: 'test/test/test/accommodation', pathSegments: undefined}`.
 * It was always correct; what was missing was the parent segments reaching it, because
 * `EntitySidePanel`'s `replace` dropped them when the subcollection tab was clicked.
 */
describe("buildSubcollectionPathSegments", () => {

    it("keeps a slash-bearing parent id whole", () => {
        expect(buildSubcollectionPathSegments(["test"], "test/test", "accommodation"))
            .toEqual(["test", "test/test", "accommodation"]);
    });

    it("produces three segments where splitting the flattened path gives four", () => {
        const segments = buildSubcollectionPathSegments(["test"], "test/test", "accommodation")!;
        expect(segments).toHaveLength(3);
        expect(segments.join("/")).toEqual(PATH);
        expect(PATH.split("/")).toHaveLength(4);
    });

    it("spreads the subcollection's own multi-segment path", () => {
        // A collection's configured path never contains an entity id, so splitting it is
        // unambiguous — unlike splitting the flattened chain.
        expect(buildSubcollectionPathSegments(["sites"], "es", "locales/translations"))
            .toEqual(["sites", "es", "locales", "translations"]);
    });

    it("tolerates surrounding slashes on the subcollection path", () => {
        expect(buildSubcollectionPathSegments(["test"], "test/test", "/accommodation/"))
            .toEqual(["test", "test/test", "accommodation"]);
    });

    it("nests to a second level", () => {
        const first = buildSubcollectionPathSegments(["test"], "test/test", "accommodation")!;
        expect(buildSubcollectionPathSegments(first, "room/7", "reviews"))
            .toEqual(["test", "test/test", "accommodation", "room/7", "reviews"]);
    });

    it("returns undefined rather than guessing when the parent chain is unknown", () => {
        expect(buildSubcollectionPathSegments(undefined, "test/test", "accommodation")).toBeUndefined();
    });

    it("returns undefined before the parent entity is loaded", () => {
        expect(buildSubcollectionPathSegments(["test"], undefined, "accommodation")).toBeUndefined();
    });

});
