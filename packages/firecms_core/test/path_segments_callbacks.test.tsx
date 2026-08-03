/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { deleteEntityWithCallbacks } from "../src/hooks/data/delete";
import { saveEntityWithCallbacks } from "../src/hooks/data/save";
import { useBuildDataSource } from "../src/internal/useBuildDataSource";

/**
 * Collection callbacks (`onPreSave`, `onSaveSuccess`, `onSaveFailure`, `onFetch`,
 * `onPreDelete`, `onDelete`) receive a `path`, and had no way at all to receive the segments
 * describing it. A callback that wants to address the datasource itself — the entity-history
 * plugin does exactly that — was therefore stuck re-deriving them from the flattened path,
 * which is wrong for any parent id containing "/".
 *
 * `pathSegments` is now on all three callback prop types and populated at every invocation.
 * It is optional, so a collection written before it existed is unaffected.
 */

// The reported case: a parent entity whose id is "test/test".
const PATH = "test/test/test/accommodation";
const SEGMENTS = ["test", "test/test", "accommodation"];

const context = {
    navigation: { resolveIdsFrom: (p: string) => p },
    customizationController: { propertyConfigs: {} },
    authController: { user: null }
} as any;

function build() {
    const calls: Record<string, any[]> = {};
    const delegate = {
        key: "recording",
        initialised: true,
        saveEntity: async (p: any) => {
            (calls.saveEntity ??= []).push(p);
            return { id: p.entityId ?? "created", path: p.path, values: {}, pathSegments: p.pathSegments };
        },
        deleteEntity: async (p: any) => { (calls.deleteEntity ??= []).push(p); },
        fetchCollection: async () => [],
        delegateToCMSModel: (d: any) => d,
        cmsToDelegateModel: (d: any) => d,
        currentTime: () => new Date()
    } as any;

    const { result } = renderHook(() => useBuildDataSource({
        delegate,
        navigationController: { resolveIdsFrom: (p: string) => p, getCollection: () => undefined } as any,
        authController: { user: null } as any
    }));
    return { calls, dataSource: result.current };
}

describe("save callbacks receive pathSegments", () => {

    it("onPreSave and onSaveSuccess get the segments the save was issued with", async () => {
        const { dataSource } = build();
        const seen: Record<string, any> = {};

        const collection = {
            id: "accommodation",
            path: "accommodation",
            name: "Accommodation",
            properties: {},
            callbacks: {
                onPreSave: (props: any) => {
                    seen.onPreSave = props;
                    return props.values;
                },
                onSaveSuccess: (props: any) => {
                    seen.onSaveSuccess = props;
                }
            }
        } as any;

        await saveEntityWithCallbacks({
            path: PATH,
            pathSegments: SEGMENTS,
            entityId: "room-1",
            values: {},
            collection,
            status: "existing",
            dataSource,
            context
        });

        expect(seen.onPreSave.pathSegments).toEqual(SEGMENTS);
        expect(seen.onSaveSuccess.pathSegments).toEqual(SEGMENTS);
        // Three segments, not the four that splitting `path` would produce.
        expect(seen.onSaveSuccess.pathSegments).toHaveLength(3);
        expect(seen.onSaveSuccess.path).toEqual(PATH);
    });

    it("onSaveFailure gets them too", async () => {
        const calls: Record<string, any[]> = {};
        const delegate = {
            key: "failing",
            initialised: true,
            saveEntity: async () => { throw new Error("nope"); },
            delegateToCMSModel: (d: any) => d,
            cmsToDelegateModel: (d: any) => d,
            currentTime: () => new Date()
        } as any;
        const { result } = renderHook(() => useBuildDataSource({
            delegate,
            navigationController: { resolveIdsFrom: (p: string) => p, getCollection: () => undefined } as any,
            authController: { user: null } as any
        }));

        let seen: any;
        const collection = {
            id: "accommodation", path: "accommodation", name: "Accommodation", properties: {},
            callbacks: { onSaveFailure: (props: any) => { seen = props; } }
        } as any;

        await saveEntityWithCallbacks({
            path: PATH,
            pathSegments: SEGMENTS,
            entityId: "room-1",
            values: {},
            collection,
            status: "existing",
            dataSource: result.current,
            context,
            onSaveFailure: () => undefined
        });

        expect(seen.pathSegments).toEqual(SEGMENTS);
        expect(calls).toEqual({});
    });

    it("leaves them undefined when the save had none", async () => {
        const { dataSource } = build();
        let seen: any;
        const collection = {
            id: "accommodation", path: "accommodation", name: "Accommodation", properties: {},
            callbacks: { onSaveSuccess: (props: any) => { seen = props; } }
        } as any;

        await saveEntityWithCallbacks({
            path: PATH, entityId: "room-1", values: {}, collection,
            status: "existing", dataSource, context
        });

        expect(seen.pathSegments).toBeUndefined();
    });

    it("a collection written before the field existed still works", async () => {
        // The back-compat case: callbacks that ignore the new prop entirely.
        const { calls, dataSource } = build();
        const onPreSave = jest.fn((props: any) => props.values);
        const collection = {
            id: "accommodation", path: "accommodation", name: "Accommodation", properties: {},
            callbacks: { onPreSave }
        } as any;

        await saveEntityWithCallbacks({
            path: PATH, pathSegments: SEGMENTS, entityId: "room-1", values: { a: 1 },
            collection, status: "existing", dataSource, context
        });

        expect(onPreSave).toHaveBeenCalled();
        expect(calls.saveEntity[0].pathSegments).toEqual(SEGMENTS);
    });

});

describe("delete callbacks receive pathSegments", () => {

    it("onPreDelete and onDelete get the segments the entity was loaded with", async () => {
        const { calls, dataSource } = build();
        const seen: Record<string, any> = {};

        const collection = {
            id: "accommodation", path: "accommodation", name: "Accommodation", properties: {},
            callbacks: {
                onPreDelete: (props: any) => { seen.onPreDelete = props; },
                onDelete: (props: any) => { seen.onDelete = props; }
            }
        } as any;

        await deleteEntityWithCallbacks({
            dataSource,
            entity: { id: "room-1", path: PATH, pathSegments: SEGMENTS, values: {} } as any,
            collection,
            callbacks: collection.callbacks,
            context
        });

        expect(seen.onPreDelete.pathSegments).toEqual(SEGMENTS);
        expect(seen.onDelete.pathSegments).toEqual(SEGMENTS);
        // And the delegate itself received them, from the entity.
        expect(calls.deleteEntity[0].pathSegments).toEqual(SEGMENTS);
    });

    it("leaves them undefined for an entity loaded without them", async () => {
        const { dataSource } = build();
        let seen: any;
        const collection = {
            id: "accommodation", path: "accommodation", name: "Accommodation", properties: {},
            callbacks: { onPreDelete: (props: any) => { seen = props; } }
        } as any;

        await deleteEntityWithCallbacks({
            dataSource,
            entity: { id: "room-1", path: PATH, values: {} } as any,
            collection,
            callbacks: collection.callbacks,
            context
        });

        expect(seen.pathSegments).toBeUndefined();
    });

});

/**
 * Found by temporarily making `pathSegments` non-optional: `deleteEntityWithCallbacks`
 * declared the prop (it extends `DeleteEntityProps`) but never destructured it, so a caller
 * that passed segments had them silently discarded — the exact failure mode the field
 * exists to prevent, hiding inside the fix for it.
 */
describe("deleteEntityWithCallbacks honours an explicit pathSegments", () => {

    const OVERRIDE = ["test", "test/test", "other"];

    it("prefers the explicit segments over the entity's", async () => {
        const { calls, dataSource } = build();
        let seen: any;
        const collection = {
            id: "accommodation", path: "accommodation", name: "A", properties: {},
            callbacks: { onPreDelete: (props: any) => { seen = props; } }
        } as any;

        await deleteEntityWithCallbacks({
            dataSource,
            entity: { id: "room-1", path: PATH, pathSegments: SEGMENTS, values: {} } as any,
            pathSegments: OVERRIDE,
            collection,
            callbacks: collection.callbacks,
            context
        });

        expect(calls.deleteEntity[0].pathSegments).toEqual(OVERRIDE);
        expect(seen.pathSegments).toEqual(OVERRIDE);
    });

    it("falls back to the entity's when none is passed", async () => {
        const { calls, dataSource } = build();

        await deleteEntityWithCallbacks({
            dataSource,
            entity: { id: "room-1", path: PATH, pathSegments: SEGMENTS, values: {} } as any,
            collection: { id: "a", path: "a", name: "A", properties: {} } as any,
            context
        });

        expect(calls.deleteEntity[0].pathSegments).toEqual(SEGMENTS);
    });

});
