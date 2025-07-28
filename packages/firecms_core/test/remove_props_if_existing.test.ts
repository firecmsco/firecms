import { removePropsIfExisting } from "../src";

describe("removePropsIfExisting", () => {
    test("should remove matching properties", () => {
        const source = { a: 1, b: 2, c: 3 };
        const comparison = { b: 2 };
        expect(removePropsIfExisting(source, comparison)).toEqual({ a: 1, c: 3 });
    });

    test("should handle non-objects", () => {
        expect(removePropsIfExisting(1, {})).toBe(1);
        expect(removePropsIfExisting("a", {})).toBe("a");
        expect(removePropsIfExisting(null, {})).toBe(null);
    });

    test("should remove nested properties", () => {
        const source = { a: { b: 2 }, c: 3 };
        const comparison = { a: { b: 2 } };
        expect(removePropsIfExisting(source, comparison)).toEqual({ a: {}, c: 3 });
    });

    test("should remove properties in arrays", () => {
        const source = { a: [{ b: 2 }, { c: 3 }], d: 4 };
        const comparison = { a: [{ b: 2 }] };
        expect(removePropsIfExisting(source, comparison)).toEqual({ a: [{}, { c: 3 }], d: 4 });
    });

    test("should not remove nested", () => {
        const source = {
            key: "ttt",
            name: "ttt",
            properties: {
                en: { type: "string", name: "English", editable: true },
                es: { type: "string", name: "Español" }
            }
        };
        const comparison = {
            key: "ttt",
            name: "ttt",
            properties: {
                en: { type: "string", name: "English333111", editable: true },
                es: { type: "string", name: "Español" }
            }
        };
        expect(removePropsIfExisting(source, comparison)).toEqual({
            properties: {
                en: { name: "English" },
                es: {}
            }
        });
    });
});
