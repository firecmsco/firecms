/**
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";

/**
 * The hooks that call the datasource are the layer where both reported bugs lived:
 * `countEntities` never received segments, and a hook that did not thread them produced
 * a wrong array by splitting the flattened path.
 *
 * Unit tests over the pure helpers and the datasource wrapper both passed while this layer
 * was broken, because neither exercises it. These tests drive the hooks themselves against
 * a recording datasource.
 */

const recorded: Record<string, any[]> = {};
const record = (name: string, props: any) => { (recorded[name] ??= []).push(props); };

const FETCHED_ENTITY = { id: "edge/99", path: "nodes/node/42/edges", values: { label: "x" } };

const dataSource = {
    fetchEntity: async (p: any) => { record("fetchEntity", p); return FETCHED_ENTITY; },
    listenEntity: (p: any) => { record("listenEntity", p); p.onUpdate(FETCHED_ENTITY); return () => undefined; },
    fetchCollection: async (p: any) => { record("fetchCollection", p); return [FETCHED_ENTITY]; },
    listenCollection: (p: any) => { record("listenCollection", p); p.onUpdate([FETCHED_ENTITY]); return () => undefined; }
};

jest.mock("../src/hooks/data/useDataSource", () => ({ useDataSource: () => dataSource }));
jest.mock("../src/hooks/useNavigationController", () => ({
    // Identity: these tests are about segments, not id-to-path resolution.
    //
    // Deliberately WITHOUT `resolveSegmentsFrom`, so this doubles as the back-compat case:
    // a `navigationController` built against an earlier version is a plain object a host
    // app supplies to <FireCMS>, and adding a method it does not have must not break it.
    // Segments must still reach the datasource, just unresolved.
    useNavigationController: () => ({ resolveIdsFrom: (p: string) => p })
}));
jest.mock("../src/hooks/useFireCMSContext", () => ({ useFireCMSContext: () => ({}) }));

import { renderHook, waitFor } from "@testing-library/react";
import { useEntityFetch } from "../src/hooks/data/useEntityFetch";
import { useCollectionFetch } from "../src/hooks/data/useCollectionFetch";
import { MemoryRouter } from "react-router-dom";
import React from "react";

/** The table controller reads the location to sync filters into the URL. */
const Router = ({ children }: { children?: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

const collection = { id: "edges", path: "edges", name: "Edges", properties: {} } as any;

const PATH = "nodes/node/42/edges";
/** The parent id "node/42" is ONE segment; splitting `path` would give four. */
const SEGMENTS = ["nodes", "node/42", "edges"];

afterEach(() => {
    for (const k of Object.keys(recorded)) delete recorded[k];
});

describe("useEntityFetch", () => {

    it("passes pathSegments to the datasource", async () => {
        renderHook(() => useEntityFetch({
            path: PATH, pathSegments: SEGMENTS, entityId: "edge/99", collection, useCache: false
        }));

        await waitFor(() => expect(recorded.listenEntity ?? recorded.fetchEntity).toBeDefined());
        const call = (recorded.listenEntity ?? recorded.fetchEntity)[0];
        expect(call.pathSegments).toEqual(SEGMENTS);
        expect(call.path).toEqual(PATH);
    });

    it("does not invent segments when the caller omits them", async () => {
        renderHook(() => useEntityFetch({
            path: PATH, entityId: "edge/99", collection, useCache: false
        }));

        await waitFor(() => expect(recorded.listenEntity ?? recorded.fetchEntity).toBeDefined());
        const call = (recorded.listenEntity ?? recorded.fetchEntity)[0];
        // Undefined, never ["nodes","node","42","edges"].
        expect(call.pathSegments).toBeUndefined();
    });

    it("stamps the segments onto the fetched entity", async () => {
        // This is what lets a reference or a delete derived from the entity stay resolvable.
        const { result } = renderHook(() => useEntityFetch({
            path: PATH, pathSegments: SEGMENTS, entityId: "edge/99", collection, useCache: false
        }));

        await waitFor(() => expect(result.current.entity).toBeDefined());
        expect(result.current.entity!.pathSegments).toEqual(SEGMENTS);
    });

    it("leaves the entity unstamped when segments are unknown", async () => {
        const { result } = renderHook(() => useEntityFetch({
            path: PATH, entityId: "edge/99", collection, useCache: false
        }));

        await waitFor(() => expect(result.current.entity).toBeDefined());
        expect(result.current.entity!.pathSegments).toBeUndefined();
    });

});

describe("useCollectionFetch", () => {

    it("passes pathSegments to the datasource", async () => {
        renderHook(() => useCollectionFetch({
            path: PATH, pathSegments: SEGMENTS, collection, itemCount: 10
        } as any));

        await waitFor(() => expect(recorded.listenCollection ?? recorded.fetchCollection).toBeDefined());
        const call = (recorded.listenCollection ?? recorded.fetchCollection)[0];
        expect(call.pathSegments).toEqual(SEGMENTS);
    });

    it("does not invent segments when the caller omits them", async () => {
        renderHook(() => useCollectionFetch({
            path: PATH, collection, itemCount: 10
        } as any));

        await waitFor(() => expect(recorded.listenCollection ?? recorded.fetchCollection).toBeDefined());
        const call = (recorded.listenCollection ?? recorded.fetchCollection)[0];
        expect(call.pathSegments).toBeUndefined();
    });

    it("stamps the segments onto every fetched entity", async () => {
        const { result } = renderHook(() => useCollectionFetch({
            path: PATH, pathSegments: SEGMENTS, collection, itemCount: 10
        } as any));

        await waitFor(() => expect(result.current.data.length).toBeGreaterThan(0), { timeout: 15000 });
        for (const e of result.current.data) {
            expect(e.pathSegments).toEqual(SEGMENTS);
        }
    }, 30000);

});

/**
 * The table controller is where `countEntities` and `isFilterCombinationValid` silently
 * dropped segments — the exact symptom reported ("count, fetch etc seem to be missing
 * path segments").
 */
describe("useDataSourceTableController", () => {

    it("passes pathSegments when fetching the collection", async () => {
        const { useDataSourceTableController } = require("../src/components/common/useDataSourceTableController");
        renderHook(() => useDataSourceTableController({
            fullPath: PATH, pathSegments: SEGMENTS, collection
        }), { wrapper: Router });

        await waitFor(() => expect(recorded.listenCollection ?? recorded.fetchCollection).toBeDefined(), { timeout: 15000 });
        const call = (recorded.listenCollection ?? recorded.fetchCollection)[0];
        expect(call.pathSegments).toEqual(SEGMENTS);
    }, 30000);

    it("does not invent segments when the caller omits them", async () => {
        const { useDataSourceTableController } = require("../src/components/common/useDataSourceTableController");
        renderHook(() => useDataSourceTableController({
            fullPath: PATH, collection
        }), { wrapper: Router });

        await waitFor(() => expect(recorded.listenCollection ?? recorded.fetchCollection).toBeDefined(), { timeout: 15000 });
        const call = (recorded.listenCollection ?? recorded.fetchCollection)[0];
        expect(call.pathSegments).toBeUndefined();
    }, 30000);

    it("stamps the segments onto every row", async () => {
        const { useDataSourceTableController } = require("../src/components/common/useDataSourceTableController");
        const { result } = renderHook(() => useDataSourceTableController({
            fullPath: PATH, pathSegments: SEGMENTS, collection
        }), { wrapper: Router });

        await waitFor(() => expect(result.current.data.length).toBeGreaterThan(0));
        for (const e of result.current.data) {
            expect(e.pathSegments).toEqual(SEGMENTS);
        }
    });

});
