import { buildPropertiesOrder, buildEntityPropertiesFromData } from "../src/collection_builder";
import { DataType, Properties, Property } from "@rebasepro/types";

// Simple type inferrer for testing
function inferType(value: any): DataType {
    if (value === null || value === undefined) return "string";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (value instanceof Date) return "date";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "map";
    return "string";
}

// ─────────────────────────────────────────────────────────────
// buildPropertiesOrder
// ─────────────────────────────────────────────────────────────
describe("buildPropertiesOrder", () => {
    it("prioritizes 'name' and 'title' keys", () => {
        const properties: Properties = {
            description: { type: "string", name: "Description" } as Property,
            name: { type: "string", name: "Name" } as Property,
            status: { type: "string", name: "Status" } as Property,
        };
        const order = buildPropertiesOrder(properties);
        expect(order[0]).toBe("name");
    });

    it("prioritizes 'title' key", () => {
        const properties: Properties = {
            zzz: { type: "string", name: "ZZZ" } as Property,
            title: { type: "string", name: "Title" } as Property,
            aaa: { type: "string", name: "AAA" } as Property,
        };
        const order = buildPropertiesOrder(properties);
        expect(order[0]).toBe("title");
    });

    it("puts image keys second", () => {
        const properties: Properties = {
            description: { type: "string", name: "Description" } as Property,
            main_image: { type: "string", name: "Main Image" } as Property,
            title: { type: "string", name: "Title" } as Property,
        };
        const order = buildPropertiesOrder(properties);
        expect(order.indexOf("title")).toBeLessThan(order.indexOf("main_image"));
        expect(order.indexOf("main_image")).toBeLessThan(order.indexOf("description"));
    });

    it("respects custom priority keys", () => {
        const properties: Properties = {
            slug: { type: "string", name: "Slug" } as Property,
            custom_field: { type: "string", name: "Custom" } as Property,
            name: { type: "string", name: "Name" } as Property,
        };
        const order = buildPropertiesOrder(properties, undefined, ["custom_field"]);
        expect(order[0]).toBe("custom_field");
    });

    it("preserves existing propertiesOrder when provided", () => {
        const properties: Properties = {
            a: { type: "string", name: "A" } as Property,
            b: { type: "string", name: "B" } as Property,
        };
        const order = buildPropertiesOrder(properties, ["b", "a"]);
        expect(order).toEqual(["a", "b"]); // sorted alphabetically then by priority
    });

    it("handles empty properties", () => {
        expect(buildPropertiesOrder({})).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────
// buildEntityPropertiesFromData
// ─────────────────────────────────────────────────────────────
describe("buildEntityPropertiesFromData", () => {
    it("infers string properties from data", async () => {
        const data = [
            { name: "Camera", description: "A great camera" },
            { name: "Lens", description: "50mm lens" },
        ];
        const properties = await buildEntityPropertiesFromData(data, inferType);
        expect(properties.name).toBeDefined();
        expect(properties.name.type).toBe("string");
        expect(properties.description).toBeDefined();
    });

    it("infers number properties from data", async () => {
        const data = [
            { price: 100, count: 5 },
            { price: 200, count: 10 },
        ];
        const properties = await buildEntityPropertiesFromData(data, inferType);
        expect(properties.price.type).toBe("number");
        expect(properties.count.type).toBe("number");
    });

    it("infers boolean properties from data", async () => {
        const data = [
            { active: true },
            { active: false },
        ];
        const properties = await buildEntityPropertiesFromData(data, inferType);
        expect(properties.active.type).toBe("boolean");
    });

    it("infers array properties from data", async () => {
        const data = [
            { tags: ["electronics", "camera"] },
            { tags: ["lens", "photography"] },
        ];
        const properties = await buildEntityPropertiesFromData(data, inferType);
        expect(properties.tags.type).toBe("array");
    });

    it("infers map properties from data", async () => {
        const data = [
            { address: { city: "NYC", zip: "10001" } },
            { address: { city: "LA", zip: "90001" } },
        ];
        const properties = await buildEntityPropertiesFromData(data, inferType);
        expect(properties.address.type).toBe("map");
    });

    it("handles mixed types — uses most common type", async () => {
        const data = [
            { value: "hello" },
            { value: "world" },
            { value: 42 },
        ];
        const properties = await buildEntityPropertiesFromData(data, inferType);
        // String should win (2 vs 1)
        expect(properties.value.type).toBe("string");
    });

    it("ignores keys starting with underscore", async () => {
        const data = [
            { _id: "abc", name: "Test", _internal: true },
        ];
        const properties = await buildEntityPropertiesFromData(data, inferType);
        expect(properties._id).toBeUndefined();
        expect(properties._internal).toBeUndefined();
        expect(properties.name).toBeDefined();
    });

    it("handles empty data array", async () => {
        const properties = await buildEntityPropertiesFromData([], inferType);
        expect(Object.keys(properties)).toHaveLength(0);
    });

    it("handles null entries in data", async () => {
        const data = [null, { name: "Test" }, null] as any[];
        const properties = await buildEntityPropertiesFromData(data, inferType);
        expect(properties.name).toBeDefined();
    });
});
