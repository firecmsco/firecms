/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { EntityCollection } from "../src/types";
import { getNavigationEntriesFromPath, NavigationViewCollectionInternal } from "../src/util/navigation_from_path";
import {
    buildSubcollectionPathSegments,
    encodeEntityId,
    getCollectionByPathOrId,
    resolveCollectionPathIds
} from "../src/util/navigation_utils";
import { useBuildDataSource } from "../src/internal/useBuildDataSource";
import { saveEntityWithCallbacks } from "../src/hooks/data/save";

/**
 * The reported scenario, end to end, against a custom datasource whose entity ids really do
 * contain "/".
 *
 * A `test` collection, an entity whose id is literally `test/test`, and an `accommodation`
 * subcollection under it. The three things the delegate saw go wrong were
 * `resolveCollectionPathIds` (console warnings and a corrupted path), `countEntities`
 * (`pathSegments: undefined`) and `saveEntity` (segments never sent at all).
 *
 * This walks the real chain the app walks — URL → navigation entries → subcollection →
 * datasource — rather than asserting on the pieces in isolation.
 */

const collections: EntityCollection[] = [
    {
        id: "test",
        name: "Test",
        path: "test",
        properties: {},
        subcollections: [
            {
                id: "accommodation",
                name: "Accommodation",
                path: "accommodation",
                properties: {}
            }
        ]
    }
];

/** The entity id as the client has it. */
const PARENT_ID = "test/test";
/** What the URL carries: the id is escaped, so the chain stays unambiguous there. */
const URL_PATH = `test/${encodeEntityId(PARENT_ID)}`;
/** What the datasource is addressed with: the flattened, raw path. */
const SUBCOLLECTION_PATH = "test/test/test/accommodation";
const SUBCOLLECTION_SEGMENTS = ["test", "test/test", "accommodation"];

function recordingDataSource() {
    const calls: Record<string, any[]> = {};
    const delegate = {
        key: "graph",
        initialised: true,
        countEntities: async (p: any) => { (calls.countEntities ??= []).push(p); return 7; },
        saveEntity: async (p: any) => {
            (calls.saveEntity ??= []).push(p);
            return { id: p.entityId ?? "new", path: p.path, values: {}, pathSegments: p.pathSegments };
        },
        fetchCollection: async (p: any) => { (calls.fetchCollection ??= []).push(p); return []; },
        delegateToCMSModel: (d: any) => d,
        cmsToDelegateModel: (d: any) => d,
        currentTime: () => new Date()
    } as any;

    const { result } = renderHook(() => useBuildDataSource({
        delegate,
        navigationController: {
            resolveIdsFrom: (p: string, segments?: string[]) => resolveCollectionPathIds(p, collections, segments),
            getCollection: (p: string, _o?: boolean, segments?: string[]) =>
                getCollectionByPathOrId(p, collections, segments)
        } as any,
        authController: { user: null } as any
    }));
    return { calls, dataSource: result.current };
}

describe("the client's chain: URL → subcollection → datasource", () => {

    it("the navigation entries keep the slash-bearing id as one segment", () => {
        const entries = getNavigationEntriesFromPath({ path: URL_PATH, collections });

        const entity = entries.find(e => e.type === "entity") as any;
        expect(entity.entityId).toEqual(PARENT_ID);
        // The parent collection's chain, ready to be extended.
        expect(entity.pathSegments).toEqual(["test"]);
    });

    it("the subcollection chain is three segments, not four", () => {
        const entries = getNavigationEntriesFromPath({ path: URL_PATH, collections });
        const parent = entries.find(e => e.type === "collection") as NavigationViewCollectionInternal<any>;

        const segments = buildSubcollectionPathSegments(parent.pathSegments, PARENT_ID, "accommodation");

        expect(segments).toEqual(SUBCOLLECTION_SEGMENTS);
        expect(segments).toHaveLength(3);
        // The flattened form of the very same chain has four parts. That difference is the
        // entire bug.
        expect(segments!.join("/")).toEqual(SUBCOLLECTION_PATH);
        expect(SUBCOLLECTION_PATH.split("/")).toHaveLength(4);
    });

});

describe("resolveCollectionPathIds", () => {

    it("no longer warns for this path", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);

        const resolved = resolveCollectionPathIds(SUBCOLLECTION_PATH, collections, SUBCOLLECTION_SEGMENTS);

        expect(resolved).toEqual(SUBCOLLECTION_PATH);
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it("reproduces the reported warning when segments are withheld", () => {
        // The before picture, kept as a test so the fix cannot be quietly undone.
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);

        resolveCollectionPathIds(SUBCOLLECTION_PATH, collections);

        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('Collection definition not found for segment starting with "test/accommodation"'));
        warn.mockRestore();
    });

    it("resolves the deeper chain too", () => {
        const deeper = [...SUBCOLLECTION_SEGMENTS, "room/7"];
        expect(resolveCollectionPathIds(deeper.join("/"), collections, deeper))
            .toEqual("test/test/test/accommodation/room/7");
    });

});

describe("countEntities", () => {

    it("reaches the delegate with the right path and three segments", async () => {
        const { calls, dataSource } = recordingDataSource();
        const collection = collections[0].subcollections![0];

        const count = await dataSource.countEntities!({
            path: SUBCOLLECTION_PATH,
            pathSegments: SUBCOLLECTION_SEGMENTS,
            collection
        });

        expect(count).toEqual(7);
        const call = calls.countEntities[0];
        expect(call.path).toEqual(SUBCOLLECTION_PATH);
        // The reported failure was exactly `pathSegments: undefined` here.
        expect(call.pathSegments).toEqual(SUBCOLLECTION_SEGMENTS);
        expect(call.pathSegments).toHaveLength(3);
        expect(call.pathSegments[1]).toEqual(PARENT_ID);
    });

    it("carries a filter through without disturbing the segments", async () => {
        const { calls, dataSource } = recordingDataSource();

        await dataSource.countEntities!({
            path: SUBCOLLECTION_PATH,
            pathSegments: SUBCOLLECTION_SEGMENTS,
            collection: collections[0].subcollections![0],
            filter: { order: ["!=", null] } as any
        });

        expect(calls.countEntities[0].pathSegments).toEqual(SUBCOLLECTION_SEGMENTS);
        expect(calls.countEntities[0].filter).toBeDefined();
    });

});

describe("saveEntity", () => {

    it("reaches the delegate with the right path and three segments", async () => {
        const { calls, dataSource } = recordingDataSource();
        const collection = collections[0].subcollections![0];

        await saveEntityWithCallbacks({
            path: SUBCOLLECTION_PATH,
            pathSegments: SUBCOLLECTION_SEGMENTS,
            entityId: "room-1",
            values: { name: "A room" },
            collection,
            status: "new",
            dataSource,
            context: {
                navigation: {
                    resolveIdsFrom: (p: string, segments?: string[]) => resolveCollectionPathIds(p, collections, segments)
                },
                customizationController: { propertyConfigs: {} },
                authController: { user: null }
            } as any
        });

        const call = calls.saveEntity[0];
        expect(call.path).toEqual(SUBCOLLECTION_PATH);
        expect(call.pathSegments).toEqual(SUBCOLLECTION_SEGMENTS);
        expect(call.pathSegments).toHaveLength(3);
        expect(call.entityId).toEqual("room-1");
    });

    it("saves an entity whose own id also contains a slash", async () => {
        const { calls, dataSource } = recordingDataSource();

        const saved = await dataSource.saveEntity({
            path: SUBCOLLECTION_PATH,
            pathSegments: SUBCOLLECTION_SEGMENTS,
            entityId: "room/7",
            values: {},
            collection: collections[0].subcollections![0],
            status: "new"
        });

        // The id is a field of its own, so it was never at risk — but the collection it
        // lands in is, and that is what the segments pin down.
        expect(calls.saveEntity[0].entityId).toEqual("room/7");
        expect(calls.saveEntity[0].pathSegments).toEqual(SUBCOLLECTION_SEGMENTS);
        // And it comes back still resolvable.
        expect(saved.pathSegments).toEqual(SUBCOLLECTION_SEGMENTS);
        expect(saved.id).toEqual("room/7");
    });

    it("resolves the collection without throwing on the even-length path", async () => {
        // `useBuildDataSource.saveEntity` looks the collection up when none is passed. That
        // lookup used to throw for this path: four "/"-separated parts, an even count.
        const { calls, dataSource } = recordingDataSource();

        await dataSource.saveEntity({
            path: SUBCOLLECTION_PATH,
            pathSegments: SUBCOLLECTION_SEGMENTS,
            entityId: "room-1",
            values: {},
            status: "new"
        } as any);

        expect(calls.saveEntity[0].pathSegments).toEqual(SUBCOLLECTION_SEGMENTS);
    });

});
