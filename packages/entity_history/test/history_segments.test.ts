import { describe, expect, it } from "@jest/globals";
import { createHistoryEntry, entityHistoryCallbacks } from "../src/entity_history_callbacks";
import { HISTORY_COLLECTION_NAME } from "../src/history_path";

/**
 * The history plugin writes into a `__history` subcollection *of the entity*, so it builds
 * a path itself rather than being handed one. That made it the clearest case of the plugin
 * layer being cut off from `pathSegments`: the entity id becomes a path segment, and with a
 * "/" in it the flattened path pointed somewhere else entirely.
 *
 * These drive the real callback and record what reaches the datasource.
 */

const SEGMENTS = ["test", "test/test", "accommodation"];
const PATH = "test/test/test/accommodation";

function recordingContext() {
    const calls: any[] = [];
    return {
        calls,
        context: {
            authController: { user: { uid: "u1" } },
            dataSource: {
                saveEntity: async (props: any) => {
                    calls.push(props);
                    return { id: "h1", path: props.path, values: {} };
                }
            }
        } as any
    };
}

describe("createHistoryEntry", () => {

    it("keeps a slash-bearing entity id whole in the segments", async () => {
        const { calls, context } = recordingContext();

        createHistoryEntry({
            context,
            values: { a: 1 },
            previousValues: { a: 0 },
            path: PATH,
            pathSegments: SEGMENTS,
            entityId: "room/7"
        });

        expect(calls).toHaveLength(1);
        expect(calls[0].pathSegments).toEqual([...SEGMENTS, "room/7", HISTORY_COLLECTION_NAME]);
        // Five segments, where splitting the flattened path would give seven.
        expect(calls[0].pathSegments).toHaveLength(5);
        expect(calls[0].path.split("/").length).toBeGreaterThan(5);
    });

    it("escapes the id in the flattened path, while the segments keep it raw", async () => {
        const { calls, context } = recordingContext();

        createHistoryEntry({
            context, values: {}, path: PATH, pathSegments: SEGMENTS, entityId: "room/7"
        });

        expect(calls[0].path).toEqual(`${PATH}/room%2F7/${HISTORY_COLLECTION_NAME}`);
        expect(calls[0].pathSegments[3]).toEqual("room/7");
    });

    it("does not invent segments when the caller has none", async () => {
        const { calls, context } = recordingContext();

        createHistoryEntry({ context, values: {}, path: PATH, entityId: "room-7" });

        expect(calls[0].pathSegments).toBeUndefined();
        // The write still happens, exactly as before the field existed.
        expect(calls[0].path).toEqual(`${PATH}/room-7/${HISTORY_COLLECTION_NAME}`);
    });

});

describe("entityHistoryCallbacks.onSaveSuccess", () => {

    it("forwards the segments it receives from the save", async () => {
        const { calls, context } = recordingContext();

        await entityHistoryCallbacks.onSaveSuccess!({
            values: { a: 1 },
            previousValues: { a: 0 },
            path: PATH,
            pathSegments: SEGMENTS,
            entityId: "room/7",
            context,
            collection: { id: "accommodation", path: "accommodation", name: "A", properties: {} }
        } as any);

        expect(calls[0].pathSegments).toEqual([...SEGMENTS, "room/7", HISTORY_COLLECTION_NAME]);
    });

    it("still works when the save carried none", async () => {
        const { calls, context } = recordingContext();

        await entityHistoryCallbacks.onSaveSuccess!({
            values: {}, path: PATH, entityId: "room-7", context,
            collection: { id: "accommodation", path: "accommodation", name: "A", properties: {} }
        } as any);

        expect(calls).toHaveLength(1);
        expect(calls[0].pathSegments).toBeUndefined();
    });

});
