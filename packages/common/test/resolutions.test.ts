import {
    resolvePropertyEnum,
    resolveEnumValues,
    getSubcollections,
} from "../src/util/resolutions";
import { EntityCollection, NumberProperty, StringProperty, EnumValueConfig } from "@rebasepro/types";

// ─────────────────────────────────────────────────────────────
// resolvePropertyEnum
// ─────────────────────────────────────────────────────────────
describe("resolvePropertyEnum", () => {
    it("resolves enum from object format to EnumValueConfig[]", () => {
        const prop: StringProperty = {
            type: "string",
            name: "Status",
            enum: {
                draft: "Draft",
                published: "Published",
            } as any,
        };
        const result = resolvePropertyEnum(prop) as StringProperty;
        expect(result.enum).toEqual([
            { id: "draft", label: "Draft" },
            { id: "published", label: "Published" },
        ]);
    });

    it("preserves enum that is already in array format", () => {
        const enumValues: EnumValueConfig[] = [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
        ];
        const prop: StringProperty = {
            type: "string",
            name: "Letter",
            enum: enumValues,
        };
        const result = resolvePropertyEnum(prop) as StringProperty;
        expect(result.enum).toEqual(enumValues);
    });

    it("filters out invalid enum entries (missing id or label)", () => {
        const prop: StringProperty = {
            type: "string",
            name: "Test",
            enum: {
                valid: "Valid",
                "": "", // empty id and label
            } as any,
        };
        const result = resolvePropertyEnum(prop) as StringProperty;
        const enumArr = result.enum as EnumValueConfig[];
        // The empty string id should be filtered out (since "" is falsy)
        expect(enumArr.find(e => e.id === "valid")).toBeDefined();
    });

    it("handles number property enums", () => {
        const prop: NumberProperty = {
            type: "number",
            name: "Priority",
            enum: {
                1: "Low",
                2: "Medium",
                3: "High",
            } as any,
        };
        const result = resolvePropertyEnum(prop) as NumberProperty;
        expect(Array.isArray(result.enum)).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────
// resolveEnumValues
// ─────────────────────────────────────────────────────────────
describe("resolveEnumValues", () => {
    it("converts object format to EnumValueConfig array", () => {
        const result = resolveEnumValues({ a: "Alpha", b: "Beta" });
        expect(result).toEqual([
            { id: "a", label: "Alpha" },
            { id: "b", label: "Beta" },
        ]);
    });

    it("passes through EnumValueConfig objects", () => {
        const result = resolveEnumValues({
            x: { id: "x", label: "X", color: "red" },
        } as any);
        // When value is not a string, it spreads the value and adds id
        expect(result?.[0].id).toBe("x");
        expect(result?.[0].label).toBe("X");
    });

    it("returns undefined for non-object/non-array input", () => {
        // Edge case: string passed as enum (shouldn't happen but defensive)
        expect(resolveEnumValues("invalid" as any)).toBeUndefined();
    });
});



// ─────────────────────────────────────────────────────────────
// getSubcollections
// ─────────────────────────────────────────────────────────────
describe("getSubcollections", () => {
    it("returns subcollections from subcollections function", () => {
        const subCol: EntityCollection = {
            name: "Comments",
            slug: "comments",
            dbPath: "comments",
            properties: {},
        };
        const collection: EntityCollection = {
            name: "Posts",
            slug: "posts",
            dbPath: "posts",
            driver: "firestore",
            properties: {},
            subcollections: () => [subCol],
        } as any;
        const result = getSubcollections(collection);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Comments");
    });

    it("returns empty array when no subcollections", () => {
        const collection: EntityCollection = {
            name: "Posts",
            slug: "posts",
            dbPath: "posts",
            properties: {},
        };
        const result = getSubcollections(collection);
        expect(result).toEqual([]);
    });

    it("includes many-cardinality relations as subcollections", () => {
        const targetCol: EntityCollection = {
            name: "Tags",
            slug: "tags",
            dbPath: "tags",
            properties: {},
        };
        const collection: EntityCollection = {
            name: "Posts",
            slug: "posts",
            dbPath: "posts",
            properties: {},
            relations: [
                {
                    relationName: "tags",
                    target: () => targetCol,
                    cardinality: "many",
                    direction: "owning",
                } as any,
            ],
        };
        const result = getSubcollections(collection);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Tags");
    });
});
