import test from "node:test";
import assert from "node:assert/strict";

import {
    toFirestoreValue,
    toFirestoreFields,
    fromFirestoreValue,
    fromFirestoreFields
} from "../dist/backend-firestore.js";

/**
 * What actually reaches Firestore is the JSON serialisation, so every assertion
 * here goes through JSON.stringify/parse rather than inspecting the object. Two of
 * these values used to serialise into something Firestore rejects outright, which
 * only showed up as an opaque failed write.
 */
const onTheWire = (value) => JSON.parse(JSON.stringify(toFirestoreValue(value)));
const roundTrip = (value) => fromFirestoreValue(onTheWire(value));

test("integers travel as decimal strings", () => {
    assert.deepEqual(onTheWire(42), { integerValue: "42" });
    assert.deepEqual(onTheWire(-7), { integerValue: "-7" });
    assert.deepEqual(onTheWire(0), { integerValue: "0" });
    // A float with no fractional part is an integer as far as Firestore is concerned.
    assert.deepEqual(onTheWire(3.0), { integerValue: "3" });
    assert.deepEqual(onTheWire(Number.MAX_SAFE_INTEGER), { integerValue: "9007199254740991" });
});

test("a number too large to be an exact integer becomes a double", () => {
    // `Number.isInteger(1e21)` is true, but `String(1e21)` is "1e+21", which is not a
    // decimal integer string — Firestore rejects the write. Past the safe range the
    // value is not an exact integer anyway, so a double is the honest representation.
    const wire = onTheWire(1e21);
    assert.equal(wire.integerValue, undefined);
    assert.equal(wire.doubleValue, 1e21);
    assert.equal(roundTrip(1e21), 1e21);

    assert.equal(onTheWire(Number.MAX_SAFE_INTEGER + 2).integerValue, undefined);
});

test("every integerValue on the wire is a decimal string", () => {
    for (const n of [0, 1, -1, 42, 1e15, Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER]) {
        const wire = onTheWire(n);
        if (wire.integerValue !== undefined) {
            assert.match(String(wire.integerValue), /^-?\d+$/, `${n} produced ${wire.integerValue}`);
        }
    }
});

test("NaN and the infinities travel as proto3's string forms", () => {
    // Left as raw numbers these serialise to `null`, which Firestore rejects.
    assert.deepEqual(onTheWire(Infinity), { doubleValue: "Infinity" });
    assert.deepEqual(onTheWire(-Infinity), { doubleValue: "-Infinity" });
    assert.deepEqual(onTheWire(NaN), { doubleValue: "NaN" });

    assert.equal(roundTrip(Infinity), Infinity);
    assert.equal(roundTrip(-Infinity), -Infinity);
    assert.ok(Number.isNaN(roundTrip(NaN)));
});

test("no doubleValue ever serialises to null", () => {
    for (const n of [1.5, -1.5, 1e21, -1e21, Infinity, -Infinity, NaN, Number.MIN_VALUE]) {
        const wire = onTheWire(n);
        if ("doubleValue" in wire) {
            assert.notEqual(wire.doubleValue, null, `${n} serialised to null`);
        }
    }
});

test("the other types round-trip", () => {
    assert.equal(roundTrip("hello"), "hello");
    assert.equal(roundTrip(""), "");
    assert.equal(roundTrip(true), true);
    assert.equal(roundTrip(false), false);
    assert.equal(roundTrip(null), null);
    assert.deepEqual(roundTrip([]), []);
    assert.deepEqual(roundTrip({}), {});
    assert.deepEqual(roundTrip([1, "a", true, null]), [1, "a", true, null]);
});

test("dates travel as timestamps", () => {
    const d = new Date("2026-01-01T00:00:00.000Z");
    assert.deepEqual(onTheWire(d), { timestampValue: "2026-01-01T00:00:00.000Z" });
});

test("nested maps and arrays survive", () => {
    const schema = {
        id: "products",
        properties: {
            price: { dataType: "number", validation: { min: 0, max: 1e21 } },
            status: { dataType: "string", enumValues: [{ id: "a", label: "A" }, { id: "b", color: "greenDark" }] },
            meta: { dataType: "map", properties: { views: { dataType: "number" } } }
        },
        propertiesOrder: ["price", "status", "meta"]
    };
    const back = fromFirestoreFields(JSON.parse(JSON.stringify(toFirestoreFields(schema))));
    assert.deepEqual(back, schema);
});

test("undefined fields are omitted rather than written as null", () => {
    const fields = toFirestoreFields({ kept: 1, dropped: undefined });
    assert.deepEqual(Object.keys(fields), ["kept"]);
});
