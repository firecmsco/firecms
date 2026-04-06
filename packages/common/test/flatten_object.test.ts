import { flattenObject, getArrayValuesCount } from "../src/util/flatten_object";

describe("flatten_object utils", () => {
    describe("flattenObject", () => {
        it("should handle empty or null values gracefully", () => {
            expect(flattenObject(null as any)).toBeNull();
            expect(flattenObject(undefined as any)).toBeUndefined();
        });

        it("should flatten a simple nested object", () => {
            const obj = {
                a: 1,
                b: { c: 2, d: 3 }
            };
            const result = flattenObject(obj);
            expect(result).toEqual({
                "a": 1,
                "b.c": 2,
                "b.d": 3
            });
        });

        it("should flatten an object containing arrays", () => {
            const obj = {
                a: 1,
                items: [
                    { id: 10, name: "foo" },
                    { id: 20, name: "bar" }
                ]
            };
            const result = flattenObject(obj);
            expect(result).toEqual({
                "a": 1,
                "items[0].id": 10,
                "items[0].name": "foo",
                "items[1].id": 20,
                "items[1].name": "bar"
            });
        });

        it("should flatten deeply nested structures", () => {
            const obj = {
                user: {
                    profile: {
                        tags: [{ meta: "new" }]
                    }
                }
            };
            const result = flattenObject(obj);
            expect(result).toEqual({
                "user.profile.tags[0].meta": "new"
            });
        });
    });

    describe("getArrayValuesCount", () => {
        it("should count array lengths and get the max for a specific key", () => {
            const array = [
                { id: 1, tags: ["a", "b"] },
                { id: 2, tags: ["a", "b", "c"] },
                { id: 3, tags: ["a"] }
            ];
            
            const result = getArrayValuesCount(array);
            expect(result).toEqual({ tags: 3 });
        });

        it("should handle nested arrays inside nested objects", () => {
            const array = [
                { id: 1, profile: { friends: [1, 2], settings: { keys: ["k1"] } } },
                { id: 2, profile: { friends: [1, 2, 3], settings: { keys: ["k1", "k2", "k3", "k4"] } } }
            ];
            
            const result = getArrayValuesCount(array);
            expect(result).toEqual({
                "profile.friends": 3,
                "profile.settings.keys": 4
            });
        });

        it("should return empty object if no arrays exist", () => {
            const array = [
                { id: 1, name: "foo" },
                { id: 2, name: "bar" }
            ];
            const result = getArrayValuesCount(array);
            expect(result).toEqual({});
        });
    });
});
