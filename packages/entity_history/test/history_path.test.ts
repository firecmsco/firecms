import { describe, expect, it } from "@jest/globals";
import { buildEntityHistoryPath, HISTORY_COLLECTION_NAME } from "../src/history_path";

/**
 * History is stored as a subcollection *under* the entity, so the entity id becomes a path
 * segment. An id containing "/" would otherwise point at a different location entirely —
 * and on Firestore it flips the path to an even segment count, which is rejected outright.
 */
describe("buildEntityHistoryPath", () => {

    it("is unchanged for ordinary ids", () => {
        // The compatibility guarantee: existing histories must not move.
        expect(buildEntityHistoryPath("products", "B000P0MDMS"))
            .toEqual("products/B000P0MDMS/__history");
        expect(buildEntityHistoryPath("users/uid123/experiences", "abc"))
            .toEqual("users/uid123/experiences/abc/__history");
    });

    it.each([
        "plain", "12345", "with space", "ünïcode", "a.b", "a-b", "a_b", "a+b", "a&b"
    ])("leaves %p untouched", (id) => {
        expect(buildEntityHistoryPath("products", id)).toEqual(`products/${id}/__history`);
    });

    it("escapes a slash so the id stays one segment", () => {
        // Without escaping this would be "nodes/edge/7/__history" — a different location,
        // and an even number of segments, which Firestore rejects.
        expect(buildEntityHistoryPath("nodes", "edge/7"))
            .toEqual("nodes/edge%2F7/__history");
    });

    it("keeps the segment count odd for slash ids", () => {
        // Firestore requires an alternating collection/document path, i.e. an odd segment
        // count for a collection. This is the property that was violated.
        for (const id of ["edge/7", "edge/7/rel", "a/b/c/d"]) {
            const segments = buildEntityHistoryPath("nodes", id).split("/");
            expect({ id, odd: segments.length % 2 === 1 }).toEqual({ id, odd: true });
            expect(segments.length).toEqual(3);
        }
    });

    it("escapes the other characters that would break a path", () => {
        expect(buildEntityHistoryPath("nodes", "a#b")).toEqual("nodes/a%23b/__history");
        expect(buildEntityHistoryPath("nodes", "a?b")).toEqual("nodes/a%3Fb/__history");
        expect(buildEntityHistoryPath("nodes", "50%")).toEqual("nodes/50%25/__history");
    });

    it("keeps a literal %2F distinct from a real slash", () => {
        // The collision case: these are two different entities and must not share history.
        expect(buildEntityHistoryPath("nodes", "a/b"))
            .not.toEqual(buildEntityHistoryPath("nodes", "a%2Fb"));
    });

    it("always ends in the history collection name", () => {
        for (const id of ["plain", "edge/7", "50%"]) {
            expect(buildEntityHistoryPath("nodes", id).endsWith("/" + HISTORY_COLLECTION_NAME))
                .toEqual(true);
        }
    });

});
