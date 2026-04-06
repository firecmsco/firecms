import { enumToObjectEntries, getLabelOrConfigFrom } from "../src/util/enums";

describe("enums utils", () => {
    describe("enumToObjectEntries", () => {
        it("should output the same array if input is already an array of EnumValueConfig", () => {
            const arr = [{ id: "a", label: "A" }];
            expect(enumToObjectEntries(arr)).toBe(arr);
        });

        it("should parse an object mapping strings to strings", () => {
            const obj = { start: "Start", stop: "Stop" };
            const result = enumToObjectEntries(obj);
            expect(result).toEqual([
                { id: "start", label: "Start" },
                { id: "stop", label: "Stop" }
            ]);
        });

        it("should parse an object mapping strings to EnumValueConfig-like objects", () => {
            const obj = { 
                start: { label: "Start", color: "green" }, 
                stop: { label: "Stop", color: "red" } 
            };
            const result = enumToObjectEntries(obj);
            expect(result).toEqual([
                { id: "start", label: "Start", color: "green" },
                { id: "stop", label: "Stop", color: "red" }
            ]);
        });
    });

    describe("getLabelOrConfigFrom", () => {
        const enumValues = [
            { id: "1", label: "One" },
            { id: "2", label: "Two" },
            { id: "strID", label: "String" },
        ];

        it("should return undefined for null or undefined key", () => {
            expect(getLabelOrConfigFrom(enumValues, undefined)).toBeUndefined();
            expect(getLabelOrConfigFrom(enumValues, null as any)).toBeUndefined();
        });

        it("should find by string matching", () => {
            expect(getLabelOrConfigFrom(enumValues, "1")).toEqual({ id: "1", label: "One" });
            expect(getLabelOrConfigFrom(enumValues, "strID")).toEqual({ id: "strID", label: "String" });
        });

        it("should find by number matching (converting to string internally)", () => {
            expect(getLabelOrConfigFrom(enumValues, 1)).toEqual({ id: "1", label: "One" });
        });

        it("should return undefined if no match is found", () => {
            expect(getLabelOrConfigFrom(enumValues, "unknown")).toBeUndefined();
            expect(getLabelOrConfigFrom(enumValues, 999)).toBeUndefined();
        });
    });
});
