/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import React from "react";
import { renderHook } from "@testing-library/react";
import { useBuildDataSource } from "../src/internal/useBuildDataSource";

/**
 * `useBuildDataSource` is the wrapper every datasource call passes through on its way to a
 * delegate. It destructures known fields and rebuilds the object, so a field that is not
 * explicitly forwarded is silently dropped — which is how `pathSegments` ended up reaching
 * some callbacks and not others.
 *
 * These tests record what the delegate actually receives.
 */

// A plain object is enough here — the wrapper only passes it through.
const collection = { id: "nodes", path: "nodes", name: "Nodes", properties: {} } as any;

const PATH = "nodes/node/42/edges";
const SEGMENTS = ["nodes", "node/42", "edges"];

/** A delegate that records the props of every call. */
function recordingDelegate() {
    const calls: Record<string, any[]> = {};
    const rec = (name: string) => (...args: any[]) => {
        (calls[name] ??= []).push(args[0]);
        return undefined as any;
    };
    return {
        calls,
        delegate: {
            key: "recording",
            initialised: true,
            fetchCollection: async (p: any) => { (calls.fetchCollection ??= []).push(p); return []; },
            listenCollection: (p: any) => { (calls.listenCollection ??= []).push(p); return () => undefined; },
            fetchEntity: async (p: any) => { (calls.fetchEntity ??= []).push(p); return undefined; },
            listenEntity: (p: any) => { (calls.listenEntity ??= []).push(p); return () => undefined; },
            saveEntity: async (p: any) => { (calls.saveEntity ??= []).push(p); return { id: "x", path: p.path, values: {} }; },
            deleteEntity: async (p: any) => { (calls.deleteEntity ??= []).push(p); },
            countEntities: async (p: any) => { (calls.countEntities ??= []).push(p); return 0; },
            checkUniqueField: async (...a: any[]) => { (calls.checkUniqueField ??= []).push(a); return true; },
            generateEntityId: (...a: any[]) => { (calls.generateEntityId ??= []).push(a); return "generated"; },
            isFilterCombinationValid: (p: any) => { (calls.isFilterCombinationValid ??= []).push(p); return true; },
            delegateToCMSModel: (d: any) => d,
            cmsToDelegateModel: (d: any) => d,
            currentTime: () => new Date()
        } as any
    };
}

function build() {
    const { calls, delegate } = recordingDelegate();
    const { result } = renderHook(() => useBuildDataSource({
        delegate,
        navigationController: { resolveIdsFrom: (p: string) => p } as any,
        authController: { user: null } as any
    }));
    return { calls, dataSource: result.current };
}

describe("pathSegments reaches the delegate", () => {

    it("fetchCollection", async () => {
        const { calls, dataSource } = build();
        await dataSource.fetchCollection({ path: PATH, pathSegments: SEGMENTS, collection });
        expect(calls.fetchCollection[0].pathSegments).toEqual(SEGMENTS);
    });

    it("listenCollection", () => {
        const { calls, dataSource } = build();
        dataSource.listenCollection!({ path: PATH, pathSegments: SEGMENTS, collection, onUpdate: () => undefined });
        expect(calls.listenCollection[0].pathSegments).toEqual(SEGMENTS);
    });

    it("fetchEntity", async () => {
        const { calls, dataSource } = build();
        await dataSource.fetchEntity({ path: PATH, pathSegments: SEGMENTS, entityId: "edge/99", collection });
        expect(calls.fetchEntity[0].pathSegments).toEqual(SEGMENTS);
    });

    it("listenEntity", () => {
        const { calls, dataSource } = build();
        dataSource.listenEntity!({ path: PATH, pathSegments: SEGMENTS, entityId: "edge/99", collection, onUpdate: () => undefined });
        expect(calls.listenEntity[0].pathSegments).toEqual(SEGMENTS);
    });

    it("saveEntity", async () => {
        const { calls, dataSource } = build();
        await dataSource.saveEntity({ path: PATH, pathSegments: SEGMENTS, entityId: "edge/99", values: {}, collection, status: "existing" });
        expect(calls.saveEntity[0].pathSegments).toEqual(SEGMENTS);
    });

    it("countEntities", async () => {
        const { calls, dataSource } = build();
        await dataSource.countEntities!({ path: PATH, pathSegments: SEGMENTS, collection });
        expect(calls.countEntities[0].pathSegments).toEqual(SEGMENTS);
    });

    it("isFilterCombinationValid", () => {
        const { calls, dataSource } = build();
        dataSource.isFilterCombinationValid!({ path: PATH, pathSegments: SEGMENTS, collection, filterValues: {} } as any);
        expect(calls.isFilterCombinationValid[0].pathSegments).toEqual(SEGMENTS);
    });

});

describe("pathSegments correctness", () => {

    it("is NOT silently derived from the flattened path when omitted", async () => {
        // The dangerous case behind "sometimes they are wrong": a caller that forgets to
        // thread pathSegments. The wrapper must pass through what it was given rather than
        // inventing segments, so a delegate can tell "absent" from "wrong".
        const { calls, dataSource } = build();
        await dataSource.fetchCollection({ path: PATH, collection });

        expect(calls.fetchCollection[0].pathSegments).toBeUndefined();
    });

    it("passes segments through verbatim, without re-splitting", async () => {
        // An id containing "/" must survive as one element. Re-splitting `path` would give
        // ["nodes","node","42","edges"] — four elements instead of three.
        const { calls, dataSource } = build();
        await dataSource.fetchCollection({ path: PATH, pathSegments: SEGMENTS, collection });

        const got = calls.fetchCollection[0].pathSegments;
        expect(got).toEqual(["nodes", "node/42", "edges"]);
        expect(got).toHaveLength(3);
        expect(got).not.toEqual(PATH.split("/"));
    });

    it("keeps path and pathSegments consistent for the same call", async () => {
        const { calls, dataSource } = build();
        await dataSource.fetchEntity({ path: PATH, pathSegments: SEGMENTS, entityId: "edge/99", collection });

        const call = calls.fetchEntity[0];
        // Rejoining the segments must reproduce the flattened path — they describe the
        // same location, one just keeps the boundaries.
        expect(call.pathSegments.join("/")).toEqual(call.path);
    });

});
