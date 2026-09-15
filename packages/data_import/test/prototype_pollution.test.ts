import { afterEach, describe, expect, test } from "@jest/globals";
import { mapJsonParse, unflattenObject } from "../src/utils/transforms";
import { parseCsvToObjects } from "../src/utils/csv";
import { pathTraversesPrototype } from "../src/utils/prototype_keys";
import { flattenEntry } from "../src/utils/data";

/**
 * The keys these functions write are the header row (or JSON keys) of an uploaded
 * file. `res["__proto__"]` is the prototype setter rather than an own property, so
 * a column named `__proto__.polluted` walked out of the accumulator and onto
 * `Object.prototype` for the life of the tab.
 */
describe("import refuses header keys that reach the prototype chain", () => {

    afterEach(() => {
        // Nothing should have leaked, but a leak must not make the next test pass
        // for the wrong reason.
        delete (Object.prototype as Record<string, unknown>).polluted;
        delete (Object.prototype as Record<string, unknown>).isAdmin;
    });

    test("unflattenObject does not write through __proto__", () => {
        const result = unflattenObject({ "__proto__.polluted": "pwned" }) as Record<string, unknown>;

        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        expect(result.polluted).toBeUndefined();
    });

    test("unflattenObject does not write through constructor.prototype", () => {
        // Three ordinary nested names: the walk never enters the inherited
        // `constructor`, so this builds own objects instead.
        const result = unflattenObject({ "constructor.prototype.polluted": "pwned" }) as Record<string, any>;

        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        expect(Object.prototype.hasOwnProperty.call(Object.prototype, "polluted")).toBe(false);
        expect(result.constructor).toEqual({ prototype: { polluted: "pwned" } });
    });

    test.each([
        ["toString.call", () => Object.prototype.toString.call([])],
        ["hasOwnProperty.x", () => (Object.prototype.hasOwnProperty as unknown as Record<string, unknown>).x],
        ["valueOf[0]", () => (Object.prototype.valueOf as unknown as Record<number, unknown>)[0]]
    ])("unflattenObject leaves the built-in behind %j alone", (header, probe) => {
        // `currentObj[key] || {}` walked into the inherited function and set a
        // property on it: `toString.call` broke Object.prototype.toString.call
        // for the whole tab.
        const before = probe();
        const result = unflattenObject({ [header]: "pwned" }) as Record<string, any>;

        expect(probe()).toEqual(before);
        expect(Object.prototype.hasOwnProperty.call(result, header.split(/[.[]/)[0])).toBe(true);
    });

    test("unflattenObject does not write through an indexed __proto__ header", () => {
        const result = unflattenObject({ "__proto__[0]": "pwned" }) as Record<string, unknown>;

        expect(([] as unknown[])[0]).toBeUndefined();
        expect(({} as Record<string, unknown>)[0]).toBeUndefined();
        expect(result[0]).toBeUndefined();
    });

    test("unflattenObject keeps ordinary keys while refusing the unsafe one", () => {
        const result = unflattenObject({
            "address.street": "Main St",
            "__proto__.isAdmin": true
        });

        expect(result).toEqual({ address: { street: "Main St" } });
        expect(({} as Record<string, unknown>).isAdmin).toBeUndefined();
    });

    test("mapJsonParse does not replace the accumulator's prototype", () => {
        const input = JSON.parse("{\"__proto__\":\"{\\\"isAdmin\\\":true}\",\"name\":\"Alice\"}");
        const result = mapJsonParse(input);

        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect((result as Record<string, unknown>).isAdmin).toBeUndefined();
        expect(result.name).toEqual("Alice");
    });

    test("flattenEntry drops a __proto__ key of an uploaded JSON row", () => {
        // JSON.parse makes `__proto__` an own key, so it reaches `acc[key] = …`.
        const row = JSON.parse("{\"__proto__\":{\"isAdmin\":true},\"name\":\"Alice\"}");
        const result = flattenEntry(row);

        expect(result).toEqual({ name: "Alice" });
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(({} as Record<string, unknown>).isAdmin).toBeUndefined();
    });

    test("a CSV whose header row is the payload imports nothing dangerous", () => {
        // The same two steps `convertFileToJson` runs over the parsed cells.
        const { data } = parseCsvToObjects("name,__proto__.polluted\nAlice,pwned\n");
        const rows = data.map(mapJsonParse).map(unflattenObject);

        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        expect(rows).toEqual([{ name: "Alice" }]);
    });

    test("a CSV header that is exactly __proto__ never reaches the row object", () => {
        const { data } = parseCsvToObjects("name,__proto__\nAlice,pwned\n");

        expect(Object.getPrototypeOf(data[0])).toBe(Object.prototype);
        expect(data).toEqual([{ name: "Alice" }]);
    });

    test("a column called constructor survives every step", () => {
        const { data } = parseCsvToObjects("driver,constructor,prototype\nHamilton,Mercedes,x\n");
        const rows = data.map(mapJsonParse).map(unflattenObject);

        expect(rows).toEqual([{ driver: "Hamilton", constructor: "Mercedes", prototype: "x" }]);
        expect(flattenEntry(rows[0])).toEqual({ driver: "Hamilton", constructor: "Mercedes", prototype: "x" });
    });

    test.each([
        ["a.__proto__.b", true],
        ["__proto__[0]", true],
        ["constructor.prototype.x", false],
        ["address.street", false],
        ["tags[0]", false],
        ["proto", false]
    ])("pathTraversesPrototype(%j) is %j", (path, expected) => {
        expect(pathTraversesPrototype(path)).toBe(expected);
    });
});
