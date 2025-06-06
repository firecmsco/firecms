import { mergeDeep } from "../src/util/objects";

describe("mergeDeep", () => {

    it("should handle merging when target property is null and source property is an object", () => {
        const target = { optionalMap: null };
        const source = {
            optionalMap: {
                "valueTwo": 222,
                "valueOne": "one",
                "nested": {
                    "valueThree": "threeee",
                    "valueFour": 444
                }
            }
        };
        const result = mergeDeep(target, source);
        expect(result).toEqual(source);
    });

    it("should merge properties from source into target, overwriting existing ones", () => {
        const target = {
            a: 1,
            b: 2
        };
        const source = {
            b: 3,
            c: 4
        };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            a: 1,
            b: 3,
            c: 4
        });
    });

    it("should perform a deep merge for nested objects when key exists in target", () => {
        const target = {
            a: 1,
            nested: {
                x: 10,
                y: 20
            }
        };
        const source = {
            b: 2,
            nested: {
                y: 30,
                z: 40
            }
        };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            a: 1,
            b: 2,
            nested: {
                x: 10,
                y: 30,
                z: 40
            }
        });
        expect(result.nested).not.toBe(source.nested); // Should be a new object
        expect(result.nested).not.toBe(target.nested); // Should be a new object
    });

    it("should add new nested objects from source by reference if key is not in target", () => {
        const target = { a: 1 };
        const source = { newNested: { x: 10 } };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            a: 1,
            newNested: { x: 10 }
        });
        // According to the implementation, if key is not in target, source[key] is assigned directly.
        expect(result.newNested).toBe(source.newNested);
    });

    it("should correctly handle Date objects by creating new instances", () => {
        const dateInSource = new Date();
        const target = { d: new Date(0) };
        const source = { d: dateInSource };
        const result = mergeDeep(target, source);
        expect(result.d).toEqual(dateInSource);
        expect(result.d).not.toBe(dateInSource); // Ensure it's a new Date instance
    });

    it("should overwrite arrays from source (not merge them element-wise)", () => {
        const target = {
            arr: [1, 2],
            other: "value"
        };
        const source = { arr: [3, 4] };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            arr: [3, 4],
            other: "value"
        });
        expect(result.arr).not.toBe(source.arr); // Should be a new array instance from source
    });

    it("should overwrite target property with different primitive types from source", () => {
        const target = {
            val: 123,
            val2: "abc"
        };
        const source = {
            val: "xyz",
            val2: true
        };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            val: "xyz",
            val2: true
        });
    });

    it("should overwrite target property with null from source", () => {
        const target = {
            a: 1,
            b: { nested: "value" }
        };
        const source = {
            a: null,
            b: null
        };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            a: null,
            b: null
        });
    });

    it("should handle merging when target property is null and source property is an object", () => {
        const target = { optionalMap: null };
        const source = {
            optionalMap: {
                "valueTwo": 222,
                "valueOne": "one",
                "nested": {
                    "valueThree": "threeee",
                    "valueFour": 444
                }
            }
        };
        const result = mergeDeep(target, source);
        expect(result).toEqual(source);
    });

    it("should overwrite target property with undefined from source if ignoreUndefined is false (default)", () => {
        const target = {
            a: 1,
            b: "defined"
        };
        const source = {
            b: undefined,
            c: 3
        };
        const result = mergeDeep(target, source); // ignoreUndefined defaults to false
        expect(result).toEqual({
            a: 1,
            b: undefined,
            c: 3
        });
    });

    it("should not overwrite target property with undefined from source if ignoreUndefined is true", () => {
        const target = {
            a: 1,
            b: "defined"
        };
        const source = {
            b: undefined,
            c: 3
        };
        const result = mergeDeep(target, source, true);
        expect(result).toEqual({
            a: 1,
            b: "defined",
            c: 3
        });
    });

    it("should add a new undefined property from source if ignoreUndefined is false", () => {
        const target = { a: 1 };
        const source = { b: undefined };
        const result = mergeDeep(target, source, false);
        expect(result).toEqual({
            a: 1,
            b: undefined
        });
    });

    it("should not add a new undefined property from source if ignoreUndefined is true", () => {
        const target = { a: 1 };
        const source = { b: undefined };
        const result = mergeDeep(target, source, true);
        expect(result).toEqual({ a: 1 });
    });

    it("should apply ignoreUndefined recursively", () => {
        const target = {
            a: 1,
            nested: {
                x: 10,
                y: "original"
            }
        };
        const source = {
            nested: {
                y: undefined,
                z: 30
            }
        };

        const resultTrue = mergeDeep(target, source, true); // ignoreUndefined = true
        expect(resultTrue).toEqual({
            a: 1,
            nested: {
                x: 10,
                y: "original",
                z: 30
            }
        });

        const resultFalse = mergeDeep(target, source, false); // ignoreUndefined = false
        expect(resultFalse).toEqual({
            a: 1,
            nested: {
                x: 10,
                y: undefined,
                z: 30
            }
        });
    });

    it("should return target if target is not an object (e.g. null, primitive)", () => {
        const source = { a: 1 };
        expect(mergeDeep(null as any, source)).toBeNull();
        expect(mergeDeep("string" as any, source)).toBe("string");
        expect(mergeDeep(123 as any, source)).toBe(123);
    });

    it("should return a shallow copy of target if target is an object and source is not an object", () => {
        const target = { a: 1 };
        const targetCopy = { ...target };

        const resultNullSource = mergeDeep(target, null as any);
        expect(resultNullSource).toEqual(targetCopy);
        expect(resultNullSource).not.toBe(target); // Should be a copy

        const resultPrimitiveSource = mergeDeep(target, "string" as any);
        expect(resultPrimitiveSource).toEqual(targetCopy);
        expect(resultPrimitiveSource).not.toBe(target); // Should be a copy
    });

    it("should handle empty target object", () => {
        const target = {};
        const source = {
            a: 1,
            b: { nested: 2 }
        };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            a: 1,
            b: { nested: 2 }
        });
        // New nested object 'b' will be a reference from source
        expect(result.b).toBe(source.b);
    });

    it("should handle empty source object", () => {
        const target = { a: 1 };
        const result = mergeDeep(target, {});
        expect(result).toEqual({ a: 1 });
        expect(result).not.toBe(target); // Should be a shallow copy
    });

    it("should handle both empty objects", () => {
        const target = {};
        const source = {};
        const result = mergeDeep(target, source);
        expect(result).toEqual({});
        expect(result).not.toBe(target);
    });

    it("should not modify the original target or source objects", () => {
        const target = {
            a: 1,
            nested: { x: 10 },
            common: "target"
        };
        const source = {
            b: 2,
            nested: { y: 20 },
            common: "source"
        };

        const targetClone = JSON.parse(JSON.stringify(target));
        const sourceClone = JSON.parse(JSON.stringify(source));

        mergeDeep(target, source);

        expect(target).toEqual(targetClone);
        expect(source).toEqual(sourceClone);
    });

    it("should overwrite a non-object in target with an object from source", () => {
        const target = {
            a: 1,
            b: "not an object"
        };
        const source = { b: { nested: "value" } };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            a: 1,
            b: { nested: "value" }
        });
        // The new object for 'b' will be a reference from source.b
        expect(result.b).toBe(source.b);
    });

    it("should overwrite an object in target with a non-object from source", () => {
        const target = {
            a: 1,
            b: { nested: "value" }
        };
        const source = { b: "not an object" };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            a: 1,
            b: "not an object"
        });
    });

    it("should merge when target has a property that source doesn't", () => {
        const target = {
            a: 1,
            b: { nestedA: "valA" }
        };
        const source = {
            b: { nestedB: "valB" },
            c: 3
        };
        const result = mergeDeep(target, source);
        expect(result).toEqual({
            a: 1,
            b: {
                nestedA: "valA",
                nestedB: "valB"
            },
            c: 3
        });
    });
});
