/**
 * @jest-environment jsdom
 */
import {
    isReferenceProperty,
    isRelationProperty,
    getPropertyInPath,
    getResolvedPropertyInPath,
    getBracketNotation,
    getPropertiesWithPropertiesOrder,
    getDefaultPropertiesOrder,
} from "../../src/util/property_utils";
import type { Property, EntityCollection, Properties, MapProperty } from "@rebasepro/types";

// ---------------------------------------------------------------------------
// isReferenceProperty
// ---------------------------------------------------------------------------
describe("isReferenceProperty", () => {
    it("returns true for direct reference property", () => {
        expect(isReferenceProperty({ type: "reference", path: "col" } as Property)).toBe(true);
    });

    it("returns true for array of references", () => {
        const prop = {
            type: "array",
            of: { type: "reference", path: "col" }
        } as Property;
        expect(isReferenceProperty(prop)).toBe(true);
    });

    it("returns false for array of strings", () => {
        const prop = {
            type: "array",
            of: { type: "string" }
        } as Property;
        expect(isReferenceProperty(prop)).toBe(false);
    });

    it("returns false for string property", () => {
        expect(isReferenceProperty({ type: "string" } as Property)).toBe(false);
    });

    it("returns false for map property", () => {
        expect(isReferenceProperty({ type: "map" } as Property)).toBe(false);
    });

    it("returns null for undefined/null property", () => {
        expect(isReferenceProperty(undefined as unknown as Property)).toBeNull();
        expect(isReferenceProperty(null as unknown as Property)).toBeNull();
    });

    it("returns false for array with Array.isArray(of)", () => {
        const prop = {
            type: "array",
            of: [{ type: "string" }, { type: "number" }]
        } as unknown as Property;
        expect(isReferenceProperty(prop)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isRelationProperty
// ---------------------------------------------------------------------------
describe("isRelationProperty", () => {
    it("returns true for direct relation property", () => {
        expect(isRelationProperty({ type: "relation" } as Property)).toBe(true);
    });

    it("returns true for array of relations", () => {
        const prop = {
            type: "array",
            of: { type: "relation" }
        } as Property;
        expect(isRelationProperty(prop)).toBe(true);
    });

    it("returns false for array of strings", () => {
        const prop = {
            type: "array",
            of: { type: "string" }
        } as Property;
        expect(isRelationProperty(prop)).toBe(false);
    });

    it("returns false for non-relation type", () => {
        expect(isRelationProperty({ type: "number" } as Property)).toBe(false);
    });

    it("returns null for undefined property", () => {
        expect(isRelationProperty(undefined as unknown as Property)).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// getPropertyInPath
// ---------------------------------------------------------------------------
describe("getPropertyInPath", () => {
    const nameProperty: Property = { type: "string", name: "Name" } as Property;
    const streetProperty: Property = { type: "string", name: "Street" } as Property;
    const addressProperty: MapProperty = {
        type: "map",
        name: "Address",
        properties: { street: streetProperty }
    } as MapProperty;

    const properties: Properties = {
        name: nameProperty,
        address: addressProperty,
    };

    it("finds a top-level property", () => {
        expect(getPropertyInPath(properties, "name")).toBe(nameProperty);
    });

    it("finds a nested property via dot notation", () => {
        expect(getPropertyInPath(properties, "address.street")).toBe(streetProperty);
    });

    it("returns undefined for a non-existent top-level key", () => {
        expect(getPropertyInPath(properties, "unknown")).toBeUndefined();
    });

    it("returns undefined for a non-existent nested key", () => {
        expect(getPropertyInPath(properties, "address.city")).toBeUndefined();
    });

    it("returns undefined for dot-path into non-map property", () => {
        expect(getPropertyInPath(properties, "name.sub")).toBeUndefined();
    });

    it("handles deeply nested properties", () => {
        const deepProp: Property = { type: "number", name: "ZIP" } as Property;
        const deepMap: MapProperty = {
            type: "map",
            name: "Location",
            properties: { zip: deepProp }
        } as MapProperty;
        const outerMap: MapProperty = {
            type: "map",
            name: "Outer",
            properties: { location: deepMap }
        } as MapProperty;
        const props: Properties = { outer: outerMap };

        expect(getPropertyInPath(props, "outer.location.zip")).toBe(deepProp);
    });
});

// ---------------------------------------------------------------------------
// getResolvedPropertyInPath
// ---------------------------------------------------------------------------
describe("getResolvedPropertyInPath", () => {
    const streetProp: Property = { type: "string", name: "Street" } as Property;
    const addressProp: MapProperty = {
        type: "map",
        properties: { street: streetProp }
    } as MapProperty;

    const properties: Record<string, Property> = {
        title: { type: "string", name: "Title" } as Property,
        address: addressProp as Property,
    };

    it("finds top-level property", () => {
        expect(getResolvedPropertyInPath(properties, "title")?.type).toBe("string");
    });

    it("finds nested property via dot notation", () => {
        expect(getResolvedPropertyInPath(properties, "address.street")).toBe(streetProp);
    });

    it("returns undefined for missing path", () => {
        expect(getResolvedPropertyInPath(properties, "nope")).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// getBracketNotation
// ---------------------------------------------------------------------------
describe("getBracketNotation", () => {
    it("converts dot notation to bracket notation", () => {
        expect(getBracketNotation("address.street")).toBe("address[street]");
    });

    it("handles multiple levels", () => {
        expect(getBracketNotation("a.b.c")).toBe("a[b][c]");
    });

    it("returns unchanged string when no dots", () => {
        expect(getBracketNotation("simple")).toBe("simple");
    });
});

// ---------------------------------------------------------------------------
// getPropertiesWithPropertiesOrder
// ---------------------------------------------------------------------------
describe("getPropertiesWithPropertiesOrder", () => {
    const properties: Properties = {
        title: { type: "string", name: "Title" } as Property,
        body: { type: "string", name: "Body", multiline: true } as Property,
        status: { type: "string", name: "Status" } as Property,
    };

    it("returns properties in specified order", () => {
        const result = getPropertiesWithPropertiesOrder(properties, ["status", "title", "body"]);
        expect(Object.keys(result)).toEqual(["status", "title", "body"]);
    });

    it("includes unordered properties at the end", () => {
        const result = getPropertiesWithPropertiesOrder(properties, ["status"]);
        const keys = Object.keys(result);
        expect(keys[0]).toBe("status");
        expect(keys).toContain("title");
        expect(keys).toContain("body");
    });

    it("returns all properties when no order specified", () => {
        const result = getPropertiesWithPropertiesOrder(properties, undefined);
        expect(Object.keys(result)).toEqual(Object.keys(properties));
    });

    it("ignores nested dotted keys in propertiesOrder", () => {
        const result = getPropertiesWithPropertiesOrder(properties, ["status", "data.mode"]);
        const keys = Object.keys(result);
        // "data.mode" should be ignored because it contains a dot
        expect(keys).not.toContain("data.mode");
        expect(keys[0]).toBe("status");
    });

    it("ignores order keys that don't exist in properties", () => {
        const result = getPropertiesWithPropertiesOrder(properties, ["missing_key", "title"]);
        const keys = Object.keys(result);
        expect(keys[0]).toBe("title");
        expect(keys).not.toContain("missing_key");
    });

    it("recursively orders nested map properties", () => {
        const mapProps: Properties = {
            outerField: { type: "string", name: "Outer" } as Property,
            nested: {
                type: "map",
                name: "Nested",
                properties: {
                    a: { type: "string", name: "A" } as Property,
                    b: { type: "string", name: "B" } as Property,
                    c: { type: "string", name: "C" } as Property,
                },
                propertiesOrder: ["c", "a", "b"]
            } as Property,
        };

        const result = getPropertiesWithPropertiesOrder(mapProps, ["nested", "outerField"]);
        const keys = Object.keys(result);
        expect(keys[0]).toBe("nested");
        // The nested map should also have its children reordered
        const nestedKeys = Object.keys((result.nested as MapProperty).properties!);
        expect(nestedKeys).toEqual(["c", "a", "b"]);
    });
});

// ---------------------------------------------------------------------------
// getDefaultPropertiesOrder
// ---------------------------------------------------------------------------
describe("getDefaultPropertiesOrder", () => {
    it("returns explicit propertiesOrder when set", () => {
        const collection = {
            propertiesOrder: ["status", "title"],
            properties: { title: {}, body: {} },
        } as unknown as EntityCollection;

        expect(getDefaultPropertiesOrder(collection)).toEqual(["status", "title"]);
    });

    it("falls back to property keys + additionalFields keys", () => {
        const collection = {
            properties: { title: {}, body: {} },
            additionalFields: [{ key: "computed" }],
        } as unknown as EntityCollection;

        expect(getDefaultPropertiesOrder(collection)).toEqual(["title", "body", "computed"]);
    });

    it("returns only property keys when no additionalFields", () => {
        const collection = {
            properties: { x: {}, y: {} },
        } as unknown as EntityCollection;

        expect(getDefaultPropertiesOrder(collection)).toEqual(["x", "y"]);
    });
});
