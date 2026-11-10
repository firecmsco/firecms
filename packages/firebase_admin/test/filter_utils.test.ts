import { describe, expect, test } from "@jest/globals";
import { parseFilterValueForApi } from "../src/filter_utils";

// A timestamp filter went to the backend as an ISO string and a reference filter as a
// plain path, so neither ever matched a Timestamp or DocumentReference field.

describe("parseFilterValueForApi", () => {

    test("sends a date in the wire format", () => {
        const date = new Date("2026-11-10T09:30:00.250Z");
        expect(parseFilterValueForApi({ field: "published", op: ">=", value: date, valueType: "timestamp" }))
            .toEqual({ field: "published", op: ">=", value: { _seconds: 1794303000, _nanoseconds: 250000000 } });
    });

    test("sends a date restored from localStorage as a string the same way", () => {
        expect(parseFilterValueForApi({ field: "published", op: "<", value: "2026-11-10T09:30:00.000Z", valueType: "timestamp" }).value)
            .toEqual({ _seconds: 1794303000, _nanoseconds: 0 });
    });

    test("converts each date of an in filter", () => {
        const value = parseFilterValueForApi({ field: "day", op: "in", value: [new Date(0), new Date(1500)], valueType: "timestamp" }).value;
        expect(value).toEqual([{ _seconds: 0, _nanoseconds: 0 }, { _seconds: 1, _nanoseconds: 500000000 }]);
    });

    test("sends a document path as a reference, and anything else as typed", () => {
        expect(parseFilterValueForApi({ field: "author", op: "==", value: "/authors/bob", valueType: "reference" }).value)
            .toEqual({ _ref: "authors/bob" });
        expect(parseFilterValueForApi({ field: "author", op: "==", value: "authors", valueType: "reference" }).value)
            .toEqual("authors");
    });

    test("leaves other types and is-null alone", () => {
        expect(parseFilterValueForApi({ field: "title", op: "==", value: "2026-11-10", valueType: "string" }).value).toEqual("2026-11-10");
        expect(parseFilterValueForApi({ field: "price", op: ">", value: 3, valueType: "number" }).value).toEqual(3);
        expect(parseFilterValueForApi({ field: "published", op: "is-null", value: null, valueType: "timestamp" }))
            .toEqual({ field: "published", op: "==", value: null });
    });
});
