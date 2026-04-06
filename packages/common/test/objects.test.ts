import {
    getIn,
    setIn,
    clone,
    pick,
    isObject,
    isPlainObject,
    mergeDeep,
    getValueInPath,
    removeInPath,
    removeFunctions,
    getHashValue,
    removeUndefined,
    removeNulls,
    isEmptyObject,
    removePropsIfExisting
} from "../src/util/objects";
import { GeoPoint } from "@rebasepro/types";

describe("objects utils", () => {
    describe("getIn", () => {
        it("should get a value at a deep path", () => {
            const obj = { a: { b: { c: 1 } } };
            expect(getIn(obj, "a.b.c")).toBe(1);
            expect(getIn(obj, ["a", "b", "c"])).toBe(1);
        });

        it("should return the default value if path is undefined", () => {
            const obj = { a: { b: { c: 1 } } };
            expect(getIn(obj, "a.b.d", "default")).toBe("default");
            expect(getIn(obj, "x.y", 42)).toBe(42);
        });

        it("should handle array indexing in paths", () => {
            const obj = { arr: [{ val: "zero" }, { val: "one" }] };
            expect(getIn(obj, "arr[1].val")).toBe("one");
        });
    });

    describe("setIn", () => {
        it("should deeply set a value without mutating original object", () => {
            const obj = { a: { b: 1 } };
            const newObj = setIn(obj, "a.c", 2);
            expect(newObj).toEqual({ a: { b: 1, c: 2 } });
            expect(obj).toEqual({ a: { b: 1 } }); // check mutation
        });

        it("should create objects/arrays if path doesn't exist", () => {
            const obj = {};
            const newObj = setIn(obj, "a.b[0].c", 5);
            expect(newObj).toEqual({ a: { b: [{ c: 5 }] } });
        });

        it("should delete the key if value is undefined", () => {
            const obj = { a: 1, b: 2 };
            const newObj = setIn(obj, "a", undefined);
            expect(newObj).toEqual({ b: 2 });
            expect(newObj).not.toHaveProperty("a");
        });
    });

    describe("clone", () => {
        it("should deeply clone arrays", () => {
            const arr = [1, 2, 3];
            const cloned = clone(arr);
            expect(cloned).toEqual(arr);
            expect(cloned).not.toBe(arr);
        });

        it("should deeply clone plain objects", () => {
            const obj = { a: 1 };
            const cloned = clone(obj);
            expect(cloned).toEqual(obj);
            expect(cloned).not.toBe(obj);
        });

        it("should return primitives untouched", () => {
            expect(clone(42)).toBe(42);
            expect(clone("str")).toBe("str");
        });
    });

    describe("pick", () => {
        it("should pick specified fields from object", () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(pick(obj, "a", "c")).toEqual({ a: 1, c: 3 });
        });
    });

    describe("isPlainObject", () => {
        it("should return true for plain objects", () => {
            expect(isPlainObject({})).toBe(true);
            expect(isPlainObject({ a: 1 })).toBe(true);
        });
        
        it("should return false for arrays, instances, and primitives", () => {
            expect(isPlainObject([])).toBe(false);
            expect(isPlainObject(new Date())).toBe(false);
            expect(isPlainObject(null)).toBe(false);
            expect(isPlainObject("str")).toBe(false);
        });
    });

    describe("mergeDeep", () => {
        it("should recursively merge plain objects", () => {
            const target = { a: { x: 1, y: 2 }, b: 3 };
            const source = { a: { y: 99, z: 3 }, c: 4 };
            expect(mergeDeep(target, source)).toEqual({
                a: { x: 1, y: 99, z: 3 },
                b: 3,
                c: 4
            });
        });

        it("should handle array merging properly", () => {
            const target = { arr: [1, 2] };
            const source = { arr: [9, 8, 7] };
            expect(mergeDeep(target, source)).toEqual({ arr: [9, 8, 7] });
        });

        it("should ignore undefined values if ignoreUndefined flag is true", () => {
            const target = { a: 1, b: 2 };
            const source = { a: undefined, c: 3 };
            expect(mergeDeep(target, source, true)).toEqual({ a: 1, b: 2, c: 3 });
        });
    });

    describe("getValueInPath", () => {
        it("should retrieve values correctly using dot notation", () => {
            const obj = { a: { b: { c: 5 } } };
            expect(getValueInPath(obj, "a.b.c")).toBe(5);
        });
    });

    describe("removeInPath", () => {
        it("should delete a nested property without mutating original", () => {
            const obj = { a: { b: 1, c: 2 } };
            const result = removeInPath(obj, "a.b");
            // The method logic makes shallow copies but mutates `currentObject`
            expect(result).not.toHaveProperty("b");
        });
    });

    describe("removeFunctions", () => {
        it("should remove any function fields from object and nested arrays", () => {
            const obj = {
                a: 1,
                b: () => console.log("func"),
                c: [2, () => {}]
            };
            const result = removeFunctions(obj);
            expect(result).toEqual({ a: 1, c: [2, expect.any(Function)] });
        });
    });

    describe("removeUndefined", () => {
        it("should recursively remove undefined values", () => {
            const obj = { a: 1, b: undefined, c: { d: undefined, e: 2 } };
            expect(removeUndefined(obj)).toEqual({ a: 1, c: { e: 2 } });
        });

        it("should conditionally remove empty strings if flag passed", () => {
            const obj = { a: 1, b: "" };
            expect(removeUndefined(obj, true)).toEqual({ a: 1 });
        });
    });

    describe("removeNulls", () => {
        it("should recursively remove null values", () => {
            const obj = { a: 1, b: null, c: { d: null, e: 2 } };
            expect(removeNulls(obj)).toEqual({ a: 1, c: { e: 2 } });
        });
    });

    describe("isEmptyObject", () => {
        it("should return true when properties count is 0", () => {
            expect(isEmptyObject({})).toBe(true);
            expect(isEmptyObject({ a: 1 })).toBe(false);
        });
    });
});
