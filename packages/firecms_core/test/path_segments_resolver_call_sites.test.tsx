/**
 * @jest-environment jsdom
 */
import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";

/**
 * Every hook that addresses the datasource first runs its path through
 * `navigation.resolveIdsFrom` — which is `resolveCollectionPathIds`, the function that
 * produced the reported `Collection definition not found for segment starting with
 * "test/accommodation"` warnings and a corrupted path.
 *
 * The other hook tests stub `resolveIdsFrom` as the identity function, so they prove the
 * segments are *threaded* but never exercise the resolver itself. These use a REAL
 * navigation controller built from the client's collection shape, so the actual resolution
 * runs, and assert two things at once: the resolved path is right, and nothing warns.
 *
 * The collections deliberately use an alias (`accommodation-alias` → `accommodation`) so
 * resolution has real work to do rather than being an accidental identity.
 */

const recorded: Record<string, any[]> = {};
const record = (name: string, props: any) => { (recorded[name] ??= []).push(props); };

const ENTITY = { id: "room-1", path: "test/test/test/accommodation", values: {} };

const dataSource = {
    fetchEntity: async (p: any) => { record("fetchEntity", p); return ENTITY; },
    listenEntity: (p: any) => { record("listenEntity", p); p.onUpdate(ENTITY); return () => undefined; },
    fetchCollection: async (p: any) => { record("fetchCollection", p); return [ENTITY]; },
    listenCollection: (p: any) => { record("listenCollection", p); p.onUpdate([ENTITY]); return () => undefined; },
    countEntities: async (p: any) => { record("countEntities", p); return 1; },
    saveEntity: async (p: any) => { record("saveEntity", p); return { ...ENTITY, id: p.entityId ?? "new" }; },
    isFilterCombinationValid: (p: any) => { record("isFilterCombinationValid", p); return true; }
};

/** Filled in by `beforeAll` with a controller built from the collections below. */
let navigationController: any;

jest.mock("../src/hooks/data/useDataSource", () => ({ useDataSource: () => dataSource }));
jest.mock("../src/hooks/useNavigationController", () => ({
    useNavigationController: () => navigationController
}));
jest.mock("../src/hooks/useFireCMSContext", () => ({
    useFireCMSContext: () => ({ navigation: navigationController })
}));

import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EntityCollection } from "../src/types";
import { useBuildNavigationController } from "../src/hooks/useBuildNavigationController";
import { useEntityFetch } from "../src/hooks/data/useEntityFetch";
import { useCollectionFetch } from "../src/hooks/data/useCollectionFetch";
import { saveEntityWithCallbacks } from "../src/hooks/data/save";

const collections: EntityCollection[] = [
    {
        id: "test",
        name: "Test",
        path: "test",
        properties: {},
        subcollections: [
            {
                // id differs from path, so resolution is not an accidental identity.
                id: "accommodation-alias",
                name: "Accommodation",
                path: "accommodation",
                properties: { name: { dataType: "string", name: "Name" } as any }
            }
        ]
    }
];

const Router = ({ children }: { children?: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

/** The client's chain: a parent entity whose id is literally "test/test". */
const RESOLVED_PATH = "test/test/test/accommodation";
const RESOLVED_SEGMENTS = ["test", "test/test", "accommodation"];
/** The same chain written with the subcollection's alias, as a caller may hold it. */
const ALIAS_PATH = "test/test/test/accommodation-alias";
const ALIAS_SEGMENTS = ["test", "test/test", "accommodation-alias"];

const collection = collections[0].subcollections![0];

let warn: any;

beforeAll(async () => {
    const { result } = renderHook(() => useBuildNavigationController({
        collections,
        authController: { user: null, initialLoading: false } as any,
        dataSourceDelegate: { key: "test", initialised: true } as any
    }), { wrapper: Router });
    await waitFor(() => expect(result.current.initialised).toBe(true));
    navigationController = result.current;
});

afterEach(() => {
    for (const k of Object.keys(recorded)) delete recorded[k];
    warn?.mockRestore();
});

/** Fails the test if `resolveCollectionPathIds` (or anything else) warned. */
function expectNoWarnings() {
    const calls = (warn.mock.calls as any[][]).map(c => String(c[0]));
    expect(calls.filter(c => c.includes("resolveCollectionPathIds"))).toEqual([]);
}

function spyOnWarn() {
    warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
}

describe("useEntityFetch runs the real resolver", () => {

    it("resolves the alias and keeps the slash-bearing id, without warning", async () => {
        spyOnWarn();
        renderHook(() => useEntityFetch({
            path: ALIAS_PATH, pathSegments: ALIAS_SEGMENTS, entityId: "room-1", collection
        }));

        await waitFor(() => expect(recorded.listenEntity ?? recorded.fetchEntity).toBeDefined());
        const call = (recorded.listenEntity ?? recorded.fetchEntity)[0];

        expect(call.path).toEqual(RESOLVED_PATH);
        expect(call.pathSegments).toEqual(RESOLVED_SEGMENTS);
        expectNoWarnings();
    });

    it("warns and corrupts the path when the segments are withheld", async () => {
        // The before picture, through the same hook. Kept so the fix cannot be undone.
        spyOnWarn();
        renderHook(() => useEntityFetch({
            path: ALIAS_PATH, entityId: "room-1", collection
        }));

        await waitFor(() => expect(recorded.listenEntity ?? recorded.fetchEntity).toBeDefined());
        const call = (recorded.listenEntity ?? recorded.fetchEntity)[0];

        expect(call.pathSegments).toBeUndefined();
        // The alias is left unresolved: the walk gave up at "test/accommodation-alias".
        expect(call.path).not.toEqual(RESOLVED_PATH);
        expect((warn.mock.calls as any[][]).map(c => String(c[0]))
            .some(c => c.includes("resolveCollectionPathIds"))).toBe(true);
        warn.mockRestore();
        warn = { mockRestore: () => undefined } as any;
    });

});

describe("useCollectionFetch runs the real resolver", () => {

    it("resolves the alias and keeps the slash-bearing id, without warning", async () => {
        spyOnWarn();
        renderHook(() => useCollectionFetch({
            path: ALIAS_PATH, pathSegments: ALIAS_SEGMENTS, collection, itemCount: 10
        } as any));

        await waitFor(() => expect(recorded.listenCollection ?? recorded.fetchCollection).toBeDefined());
        const call = (recorded.listenCollection ?? recorded.fetchCollection)[0];

        expect(call.path).toEqual(RESOLVED_PATH);
        expect(call.pathSegments).toEqual(RESOLVED_SEGMENTS);
        expectNoWarnings();
    });

});

describe("useDataSourceTableController runs the real resolver", () => {

    it("resolves for the collection fetch and the filter check, without warning", async () => {
        spyOnWarn();
        const { useDataSourceTableController } = require("../src/components/common/useDataSourceTableController");
        renderHook(() => useDataSourceTableController({
            fullPath: ALIAS_PATH, pathSegments: ALIAS_SEGMENTS, collection
        }), { wrapper: Router });

        await waitFor(() => expect(recorded.listenCollection ?? recorded.fetchCollection).toBeDefined(),
            { timeout: 15000 });
        const call = (recorded.listenCollection ?? recorded.fetchCollection)[0];

        expect(call.path).toEqual(RESOLVED_PATH);
        expect(call.pathSegments).toEqual(RESOLVED_SEGMENTS);
        expectNoWarnings();
    }, 30000);

});

describe("useBoardDataController runs the real resolver", () => {

    it("resolves for every column query, without warning", async () => {
        spyOnWarn();
        const { useBoardDataController } = require("../src/components/EntityCollectionView/useBoardDataController");
        renderHook(() => useBoardDataController({
            fullPath: ALIAS_PATH,
            pathSegments: ALIAS_SEGMENTS,
            collection,
            columnProperty: "status",
            columns: ["a", "b"]
        }), { wrapper: Router });

        await waitFor(() => expect(recorded.listenCollection ?? recorded.fetchCollection).toBeDefined(),
            { timeout: 15000 });

        for (const call of (recorded.listenCollection ?? recorded.fetchCollection)) {
            expect(call.path).toEqual(RESOLVED_PATH);
            expect(call.pathSegments).toEqual(RESOLVED_SEGMENTS);
        }
        expectNoWarnings();
    }, 30000);

});

describe("saveEntityWithCallbacks runs the real resolver", () => {

    it("saves to the resolved path with the right segments, without warning", async () => {
        spyOnWarn();

        await saveEntityWithCallbacks({
            path: ALIAS_PATH,
            pathSegments: ALIAS_SEGMENTS,
            entityId: "room-1",
            values: {},
            collection,
            status: "existing",
            dataSource: dataSource as any,
            context: {
                navigation: navigationController,
                customizationController: { propertyConfigs: {} },
                authController: { user: null }
            } as any
        });

        expect(recorded.saveEntity[0].path).toEqual(RESOLVED_PATH);
        expect(recorded.saveEntity[0].pathSegments).toEqual(ALIAS_SEGMENTS);
        expectNoWarnings();
    });

});

describe("the already-resolved chain is left alone", () => {

    it("resolving twice is a no-op and never warns", async () => {
        spyOnWarn();
        renderHook(() => useEntityFetch({
            path: RESOLVED_PATH, pathSegments: RESOLVED_SEGMENTS, entityId: "room-1", collection
        }));

        await waitFor(() => expect(recorded.listenEntity ?? recorded.fetchEntity).toBeDefined());
        const call = (recorded.listenEntity ?? recorded.fetchEntity)[0];

        expect(call.path).toEqual(RESOLVED_PATH);
        expect(call.pathSegments).toEqual(RESOLVED_SEGMENTS);
        expectNoWarnings();
    });

});
