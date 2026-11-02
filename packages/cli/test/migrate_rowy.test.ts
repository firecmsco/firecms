import { afterEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";
import { convertRowyConfig, rowyFunctionName } from "../src/commands/migrate_rowy/convert";
import { collectionFileContent, migrateRowy, writeOutput } from "../src/commands/migrate_rowy";
import { decodeValue } from "../src/commands/migrate_rowy/firestore_rest";
import { findCredentials } from "../src/commands/migrate_rowy/report";
import { sampleConfig } from "./fixtures/rowy_sample_config";

function propertiesOf(result: ReturnType<typeof convertRowyConfig>, tableId: string): Record<string, any> {
    return result.collections.find(c => c.tableId === tableId)!.collection.properties as Record<string, any>;
}

describe("convertRowyConfig: tables", () => {

    it("turns each table with a schema into a collection, and reports the ones without", () => {
        const result = convertRowyConfig(sampleConfig());
        expect(result.collections.map(c => c.tableId)).toEqual(["products", "orders-group"]);
        expect(result.skippedTables).toEqual([
            expect.objectContaining({ id: "missing" })
        ]);
    });

    it("keeps the table's path, section and id settings", () => {
        const products = convertRowyConfig(sampleConfig()).collections[0].collection;
        expect(products).toMatchObject({
            id: "products",
            name: "Products",
            path: "products",
            group: "Shop",
            customId: true,
            includeJsonView: true,
            initialSort: ["title", "desc"],
            initialFilter: { status: ["==", "live"] }
        });
    });

    it("makes collection group tables collection groups, and read-only tables read-only", () => {
        const result = convertRowyConfig(sampleConfig());
        const orders = result.collections[1].collection;
        expect(orders).toMatchObject({
            id: "orders-group",
            path: "orders",
            collectionGroup: true,
            permissions: { read: true, create: false, edit: false, delete: false }
        });
        expect(orders.customId).toBeUndefined();
        expect(result.findings).toContainEqual(expect.objectContaining({
            tableId: "orders-group",
            message: expect.stringContaining("decreasing IDs")
        }));
    });

    it("keeps writing Rowy's audit fields, unless the table had auditing off", () => {
        const result = convertRowyConfig(sampleConfig());
        expect(result.collections[0].collection.callbacks).toBeDefined();
        expect(result.collections[1].collection.callbacks).toBeUndefined();
    });

    it("drops filters it cannot express, and says so", () => {
        const result = convertRowyConfig(sampleConfig());
        expect(result.findings).toContainEqual(expect.objectContaining({
            tableId: "products",
            message: expect.stringContaining("`createdAt date-after`")
        }));
    });

    it("converts only the tables asked for, and reports ids that do not exist", () => {
        const result = convertRowyConfig(sampleConfig(), { tables: ["products", "nope"] });
        expect(result.collections.map(c => c.tableId)).toEqual(["products"]);
        expect(result.skippedTables).toEqual([expect.objectContaining({ id: "nope" })]);
    });
});

describe("convertRowyConfig: columns", () => {
    const result = convertRowyConfig(sampleConfig());
    const p = propertiesOf(result, "products");

    it("maps text columns", () => {
        expect(p.title).toEqual({ dataType: "string", name: "title", validation: { required: true, matches: "^[A-Z]" } });
        expect(p.summary).toEqual({ dataType: "string", name: "summary", multiline: true, hideFromCollection: true, columnWidth: 320 });
        expect(p.body).toEqual({ dataType: "string", name: "body", multiline: true });
        expect(p.notes).toEqual({ dataType: "string", name: "notes", markdown: true });
        expect(p.contact).toEqual({ dataType: "string", name: "contact", email: true });
        expect(p.website).toEqual({ dataType: "string", name: "website", url: true });
    });

    it("maps select columns to enums, without duplicate options", () => {
        expect(p.status).toEqual({
            dataType: "string",
            name: "status",
            enumValues: [{ id: "live", label: "live" }, { id: "draft", label: "draft" }],
            defaultValue: "draft"
        });
        expect(p.tags).toEqual({
            dataType: "array",
            name: "tags",
            of: { dataType: "string", enumValues: [{ id: "a", label: "a" }, { id: "b", label: "b" }] }
        });
        expect(result.findings).toContainEqual(expect.objectContaining({ column: "tags", level: "review" }));
    });

    it("maps numbers, keeping ranges", () => {
        expect(p.price).toEqual({ dataType: "number", name: "price", readOnly: true });
        expect(p.stars).toEqual({ dataType: "number", name: "stars", validation: { min: 0, max: 10 } });
        expect(p.weight).toEqual({ dataType: "number", name: "weight", description: "Unit: kg.", validation: { min: 1, max: 50 } });
        expect(p.discount.description).toContain("fraction");
    });

    it("maps dates, booleans and geopoints", () => {
        expect(p.inStock).toEqual({ dataType: "boolean", name: "inStock" });
        expect(p.location).toEqual({ dataType: "geopoint", name: "location" });
        expect(p.releaseDate).toEqual({ dataType: "date", name: "releaseDate", mode: "date" });
        expect(p.publishedAt).toEqual({ dataType: "date", name: "publishedAt", mode: "date_time" });
        expect(p.availability.properties.start).toEqual({ dataType: "date", name: "Start", mode: "date_time" });
    });

    it("shows Rowy's file lists read-only, and says how to make them uploadable", () => {
        expect(p.photos).toMatchObject({ dataType: "array", readOnly: true, of: { dataType: "map" } });
        expect(p.photos.of.properties.downloadURL).toEqual({ dataType: "string", name: "URL", url: "image" });
        expect(p.manuals.of.properties.downloadURL.url).toBe(true);
        expect(result.findings).toContainEqual(expect.objectContaining({ column: "photos", level: "todo" }));
    });

    it("leaves references without a target read-only", () => {
        expect(p.supplier).toEqual({ dataType: "reference", name: "supplier" });
    });

    it("turns sub-tables into subcollections and array sub-tables into arrays of maps", () => {
        const products = result.collections[0].collection;
        expect(products.subcollections).toEqual([
            expect.objectContaining({
                id: "variants",
                path: "variants",
                properties: {
                    size: { dataType: "string", name: "size", enumValues: [{ id: "S", label: "S" }, { id: "M", label: "M" }] },
                    stock: { dataType: "number", name: "stock" }
                }
            })
        ]);
        expect(p.variants).toBeUndefined();
        expect(p.specs).toEqual({
            dataType: "array",
            name: "specs",
            of: {
                dataType: "map",
                properties: {
                    label: { dataType: "string", name: "label" },
                    value: { dataType: "string", name: "value" }
                },
                propertiesOrder: ["label", "value"]
            }
        });
    });

    it("shows derivatives as read-only values of their display type, and copies their script", () => {
        expect(p.slug).toEqual({ dataType: "string", name: "slug", readOnly: true });
        expect(result.scripts).toContainEqual(expect.objectContaining({
            path: "rowy-scripts/products/slug.derivative.ts",
            code: expect.stringContaining("toLowerCase")
        }));
        expect(result.findings).toContainEqual(expect.objectContaining({
            column: "slug",
            level: "todo",
            message: expect.stringContaining("`R-products`")
        }));
    });

    it("does not invent properties for values Rowy never stored", () => {
        expect(p.margin).toBeUndefined();
        expect(p.id).toBeUndefined();
        expect(p.mystery).toBeUndefined();
        expect(result.scripts.map(s => s.path)).toContain("rowy-scripts/products/margin.formula.ts");
    });

    it("keeps an action's last status, and names the callable it used", () => {
        expect(p.publish).toMatchObject({ dataType: "map", readOnly: true, properties: { status: { dataType: "string" } } });
        expect(result.findings).toContainEqual(expect.objectContaining({
            column: "reindex",
            message: expect.stringContaining("`reindexProduct`")
        }));
    });

    it("maps text status labels to a read-only enum", () => {
        expect(p.stage).toEqual({
            dataType: "string",
            name: "stage",
            readOnly: true,
            enumValues: [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]
        });
    });

    it("nests dot-path fields, so `_createdBy.timestamp` lands inside the `_createdBy` map", () => {
        expect(p._createdBy).toMatchObject({ dataType: "map", name: "Created by", readOnly: true });
        expect(p._createdBy.properties.timestamp).toEqual({ dataType: "date", name: "Created at", mode: "date_time", readOnly: true });
        expect(p._createdBy.properties.email).toEqual({ dataType: "string", name: "Email", email: true });
        expect(result.collections[0].collection.propertiesOrder).toEqual(expect.arrayContaining(["_createdBy", "_updatedBy"]));
        const order = result.collections[0].collection.propertiesOrder as string[];
        expect(order.filter(key => key === "_createdBy")).toHaveLength(1);
    });

    it("copies dynamic default value scripts instead of guessing a value", () => {
        expect(p.sku.defaultValue).toBeUndefined();
        expect(result.scripts.map(s => s.path)).toContain("rowy-scripts/products/sku.default-value.ts");
    });

    it("lists roles with the tables they could see", () => {
        expect(result.roles).toEqual([
            { role: "ADMIN", visibleIn: ["products", "orders-group"], modifies: ["products"] },
            { role: "EDITOR", visibleIn: ["products"], modifies: [] }
        ]);
    });

    it("summarizes extensions and webhooks", () => {
        expect(result.extensions.map(e => [e.name, e.type, e.active])).toEqual([
            ["Search index", "algoliaIndex", true],
            ["Notify", "slackMessage", false]
        ]);
        expect(result.webhooks).toEqual([{
            tableId: "products",
            name: "Typeform",
            type: "typeform",
            active: true,
            url: "https://rowy-hooks-example.a.run.app/wh/products/abc123",
            hasAuth: true
        }]);
    });
});

describe("written output", () => {
    let dir: string | undefined;
    afterEach(() => {
        if (dir) fs.rmSync(dir, { recursive: true, force: true });
        dir = undefined;
    });

    function writeSample(target: "cloud" | "self-hosted" = "self-hosted") {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), "rowy-migration-"));
        const result = convertRowyConfig(sampleConfig());
        writeOutput(dir, result, target, "a test");
        return { dir, result };
    }

    function allFiles(root: string): string[] {
        return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry =>
            entry.isDirectory() ? allFiles(path.join(root, entry.name)) : [path.join(root, entry.name)]);
    }

    it("writes collections, an index, scripts and the report", () => {
        const { dir } = writeSample();
        const files = allFiles(dir).map(f => path.relative(dir, f)).sort();
        expect(files).toEqual(expect.arrayContaining([
            "MIGRATION_REPORT.md",
            path.join("collections", "index.ts"),
            path.join("collections", "products.ts"),
            path.join("collections", "orders-group.ts"),
            path.join("rowy-scripts", "products", "slug.derivative.ts")
        ]));
        const index = fs.readFileSync(path.join(dir, "collections", "index.ts"), "utf8");
        expect(index).toContain("import { productsCollection } from \"./products\";");
        expect(index).toContain("import { ordersGroupCollection } from \"./orders-group\";");
    });

    it("never writes a webhook's verification settings", () => {
        const { dir } = writeSample();
        for (const file of allFiles(dir)) {
            expect(fs.readFileSync(file, "utf8")).not.toContain("WEBHOOK-AUTH-MARKER");
        }
    });

    it("flags a key written into a script by file and line, without repeating it", () => {
        const { dir, result } = writeSample();
        const warnings = findCredentials(result.scripts);
        expect(warnings).toEqual([{
            path: "rowy-scripts/products/extension-Notify.ts",
            line: 7,
            kind: "hardcoded secret"
        }]);
        const scriptLines = fs.readFileSync(path.join(dir, warnings[0].path), "utf8").split("\n");
        expect(scriptLines[warnings[0].line - 1]).toContain("apiKey");
        const report = fs.readFileSync(path.join(dir, "MIGRATION_REPORT.md"), "utf8");
        expect(report).toContain("`rowy-scripts/products/extension-Notify.ts`, line 7");
        expect(report).not.toContain("not-a-real-key");
    });

    it("imports from the package that matches the target", () => {
        const result = convertRowyConfig(sampleConfig());
        expect(collectionFileContent(result.collections[0], "cloud", result)).toContain("from \"@firecms/cloud\"");
        expect(collectionFileContent(result.collections[0], "self-hosted", result)).toContain("from \"@firecms/core\"");
    });

    it("puts the storage alternative above a file field", () => {
        const result = convertRowyConfig(sampleConfig());
        const source = collectionFileContent(result.collections[0], "self-hosted", result);
        expect(source).toMatch(/\/\/ TODO\(rowy\): read-only until the stored values are storage paths[^\n]*\n(\s*\/\/[^\n]*\n)*\s*photos: \{/);
        expect(source).toContain("storagePath: \"{path}/{entityId}/{propertyKey}\"");
    });

    it("refuses to write into a folder that already has files", async () => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), "rowy-migration-"));
        fs.writeFileSync(path.join(dir, "keep.txt"), "");
        const input = path.join(dir, "config.json");
        fs.writeFileSync(input, JSON.stringify(sampleConfig()));
        await expect(migrateRowy({ inputFile: input, outDir: dir, target: "self-hosted" }))
            .rejects.toThrow("already has files");
    });
});

describe("helpers", () => {
    it("names the table's Cloud Function the way Rowy Run does", () => {
        expect(rowyFunctionName("products")).toBe("products");
        expect(rowyFunctionName("blog-posts")).toBe("blog_posts");
        expect(rowyFunctionName("users/abc/orders")).toBe("users_orders");
    });

    it("decodes Firestore REST values", () => {
        expect(decodeValue({ integerValue: "42" })).toBe(42);
        expect(decodeValue({ timestampValue: "2024-01-02T03:04:05Z" })).toEqual(new Date("2024-01-02T03:04:05Z"));
        expect(decodeValue({ referenceValue: "projects/p/databases/(default)/documents/products/1" }))
            .toEqual({ referencePath: "products/1" });
        expect(decodeValue({
            mapValue: { fields: { tags: { arrayValue: { values: [{ stringValue: "a" }, { nullValue: null }] } } } }
        })).toEqual({ tags: ["a", null] });
        expect(decodeValue({ arrayValue: {} })).toEqual([]);
    });
});
