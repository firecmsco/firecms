import { removeFunctions, removeUndefined, isPlainObject } from "../objects";

describe("objects utilities", () => {

    describe("removeFunctions", () => {

        it("should remove functions from objects", () => {
            const obj = {
                name: "test",
                value: 42,
                callback: () => console.log("hi")
            };

            const result = removeFunctions(obj);

            expect(result.name).toBe("test");
            expect(result.value).toBe(42);
            expect(result.callback).toBeUndefined();
        });

        it("should preserve arrays at top level", () => {
            const arr = ["a", "b", "c"];
            const result = removeFunctions(arr);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(["a", "b", "c"]);
        });

        it("should preserve nested arrays", () => {
            const obj = {
                items: ["a", "b", "c"],
                numbers: [1, 2, 3]
            };

            const result = removeFunctions(obj);

            expect(Array.isArray(result.items)).toBe(true);
            expect(result.items).toEqual(["a", "b", "c"]);
            expect(Array.isArray(result.numbers)).toBe(true);
            expect(result.numbers).toEqual([1, 2, 3]);
        });

        it("should NOT convert arrays to objects with numeric keys", () => {
            const arr = ["first", "second", "third"];
            const result = removeFunctions(arr);

            // Key check: the result should be an Array, not a plain object
            // If it were converted to an object, Array.isArray would return false
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(3);
            expect(result[0]).toBe("first");
            expect(result[1]).toBe("second");
            expect(result[2]).toBe("third");
        });

        it("should handle undefined", () => {
            expect(removeFunctions(undefined)).toBeUndefined();
        });

        it("should handle null", () => {
            expect(removeFunctions(null as any)).toBeNull();
        });

        it("should preserve class instances (not recurse into them)", () => {
            class CustomClass {
                value = 42;
                getDouble() { return this.value * 2; }
            }

            const instance = new CustomClass();
            const obj = { custom: instance };

            const result = removeFunctions(obj);

            // Class instances should be preserved as-is (not have functions stripped)
            expect(result.custom).toBe(instance);
            expect(result.custom.getDouble()).toBe(84);
        });

        it("should recursively remove functions from nested objects", () => {
            const obj = {
                level1: {
                    name: "nested",
                    fn: () => "should be removed",
                    level2: {
                        value: 100,
                        anotherFn: () => "also removed"
                    }
                }
            };

            const result = removeFunctions(obj);

            expect(result.level1.name).toBe("nested");
            expect(result.level1.fn).toBeUndefined();
            expect(result.level1.level2.value).toBe(100);
            expect(result.level1.level2.anotherFn).toBeUndefined();
        });

        it("should handle arrays containing objects with functions", () => {
            const arr = [
                { name: "item1", fn: () => { } },
                { name: "item2", fn: () => { } }
            ];

            const result = removeFunctions(arr);

            expect(Array.isArray(result)).toBe(true);
            expect(result[0].name).toBe("item1");
            expect(result[0].fn).toBeUndefined();
            expect(result[1].name).toBe("item2");
            expect(result[1].fn).toBeUndefined();
        });

        it("should handle deeply nested arrays", () => {
            const obj = {
                conditions: {
                    allowedEnumValues: {
                        if: [
                            { "==": [{ var: "values.status" }, "active"] },
                            ["a", "b"],
                            ["a", "b", "c"]
                        ]
                    }
                }
            };

            const result = removeFunctions(obj);

            // Ensure arrays inside the if array are preserved as arrays
            expect(Array.isArray(result.conditions.allowedEnumValues.if)).toBe(true);
            expect(Array.isArray(result.conditions.allowedEnumValues.if[1])).toBe(true);
            expect(result.conditions.allowedEnumValues.if[1]).toEqual(["a", "b"]);
        });
    });

    describe("removeUndefined", () => {

        it("should remove undefined values from objects", () => {
            const obj = {
                name: "test",
                value: undefined,
                count: 0
            };

            const result = removeUndefined(obj);

            expect(result.name).toBe("test");
            expect(result.count).toBe(0);
            expect("value" in result).toBe(false);
        });

        it("should preserve arrays", () => {
            const arr = ["a", "b", "c"];
            const result = removeUndefined(arr);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(["a", "b", "c"]);
        });

        it("should handle null values", () => {
            const obj = { value: null };
            const result = removeUndefined(obj);

            expect(result.value).toBeNull();
        });
    });

    describe("isPlainObject", () => {

        it("should return true for plain objects", () => {
            expect(isPlainObject({})).toBe(true);
            expect(isPlainObject({ a: 1 })).toBe(true);
        });

        it("should return false for arrays", () => {
            expect(isPlainObject([])).toBe(false);
            expect(isPlainObject([1, 2, 3])).toBe(false);
        });

        it("should return false for null", () => {
            expect(isPlainObject(null)).toBe(false);
        });

        it("should return false for primitives", () => {
            expect(isPlainObject("string")).toBe(false);
            expect(isPlainObject(42)).toBe(false);
            expect(isPlainObject(true)).toBe(false);
        });

        it("should return false for class instances", () => {
            class MyClass { }
            expect(isPlainObject(new MyClass())).toBe(false);
        });
    });
});
