/**
 * @jest-environment jsdom
 */
import {
    getEntityPreviewKeys,
    getEntityTitlePropertyKey
} from "../../src/util/previews";
import type { AuthController, EntityCollection, PropertyConfig, Property } from "@rebasepro/types";

const mockAuthController = {
    user: { uid: "test" },
    initialLoading: false
} as unknown as AuthController;

const fields: Record<string, PropertyConfig> = {};

// ---------------------------------------------------------------------------
// getEntityPreviewKeys
// ---------------------------------------------------------------------------
describe("getEntityPreviewKeys", () => {
    it("returns previewProperties when explicitly passed", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                title: { type: "string", name: "Title" } as Property,
                body: { type: "string", name: "Body" } as Property,
                status: { type: "string", name: "Status" } as Property,
            }
        } as EntityCollection;

        const result = getEntityPreviewKeys(mockAuthController, collection, fields, ["title", "status"]);
        expect(result).toEqual(["title", "status"]);
    });

    it("falls back to collection.previewProperties when no explicit list", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            previewProperties: ["body"],
            properties: {
                title: { type: "string", name: "Title" } as Property,
                body: { type: "string", name: "Body" } as Property,
            }
        } as EntityCollection;

        const result = getEntityPreviewKeys(mockAuthController, collection, fields);
        expect(result).toEqual(["body"]);
    });

    it("auto-selects up to 3 non-reference, non-relation, non-id properties", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                title: { type: "string", name: "Title" } as Property,
                body: { type: "string", name: "Body" } as Property,
                count: { type: "number", name: "Count" } as Property,
                extra: { type: "string", name: "Extra" } as Property,
            }
        } as EntityCollection;

        const result = getEntityPreviewKeys(mockAuthController, collection, fields);
        expect(result).toHaveLength(3);
        expect(result).toEqual(["title", "body", "count"]);
    });

    it("excludes reference properties from auto-selection", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                title: { type: "string", name: "Title" } as Property,
                author: { type: "reference", name: "Author", path: "users" } as Property,
                body: { type: "string", name: "Body" } as Property,
            }
        } as EntityCollection;

        const result = getEntityPreviewKeys(mockAuthController, collection, fields);
        expect(result).not.toContain("author");
    });

    it("excludes relation properties from auto-selection", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                title: { type: "string", name: "Title" } as Property,
                tags: { type: "relation", name: "Tags" } as Property,
            }
        } as EntityCollection;

        const result = getEntityPreviewKeys(mockAuthController, collection, fields);
        expect(result).not.toContain("tags");
    });

    it("excludes id properties from auto-selection", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                id: { type: "string", name: "ID", isId: true } as unknown as Property,
                title: { type: "string", name: "Title" } as Property,
            }
        } as EntityCollection;

        const result = getEntityPreviewKeys(mockAuthController, collection, fields);
        expect(result).not.toContain("id");
    });

    it("respects the limit parameter", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                a: { type: "string", name: "A" } as Property,
                b: { type: "string", name: "B" } as Property,
                c: { type: "string", name: "C" } as Property,
                d: { type: "string", name: "D" } as Property,
            }
        } as EntityCollection;

        const result = getEntityPreviewKeys(mockAuthController, collection, fields, undefined, 2);
        expect(result).toHaveLength(2);
    });

    it("filters out previewProperties that don't exist in collection properties", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                title: { type: "string", name: "Title" } as Property,
            }
        } as EntityCollection;

        const result = getEntityPreviewKeys(mockAuthController, collection, fields, ["title", "nonexistent"]);
        expect(result).toEqual(["title"]);
    });
});

// ---------------------------------------------------------------------------
// getEntityTitlePropertyKey
// ---------------------------------------------------------------------------
describe("getEntityTitlePropertyKey", () => {
    it("returns explicit titleProperty when set", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            titleProperty: "name",
            properties: {
                name: { type: "string", name: "Name" } as Property,
                body: { type: "string", name: "Body", multiline: true } as Property,
            }
        } as EntityCollection;

        expect(getEntityTitlePropertyKey(collection, fields)).toBe("name");
    });

    it("auto-detects first single-line text field as title", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                count: { type: "number", name: "Count" } as Property,
                title: { type: "string", name: "Title" } as Property,
                body: { type: "string", name: "Body", multiline: true } as Property,
            }
        } as EntityCollection;

        expect(getEntityTitlePropertyKey(collection, fields)).toBe("title");
    });

    it("skips multiline text fields", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                description: { type: "string", name: "Description", multiline: true } as Property,
                name: { type: "string", name: "Name" } as Property,
            }
        } as EntityCollection;

        expect(getEntityTitlePropertyKey(collection, fields)).toBe("name");
    });

    it("skips markdown text fields", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                content: { type: "string", name: "Content", markdown: true } as Property,
                slug: { type: "string", name: "Slug" } as Property,
            }
        } as EntityCollection;

        expect(getEntityTitlePropertyKey(collection, fields)).toBe("slug");
    });

    it("skips storage text fields", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                attachment: { type: "string", name: "File", storage: { bucket: "test" } } as unknown as Property,
                label: { type: "string", name: "Label" } as Property,
            }
        } as EntityCollection;

        expect(getEntityTitlePropertyKey(collection, fields)).toBe("label");
    });

    it("skips isId fields", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                id: { type: "string", name: "ID", isId: true } as unknown as Property,
                name: { type: "string", name: "Name" } as Property,
            }
        } as EntityCollection;

        expect(getEntityTitlePropertyKey(collection, fields)).toBe("name");
    });

    it("returns undefined when no suitable title field exists", () => {
        const collection: EntityCollection = {
            id: "test",
            name: "Test",
            path: "test",
            properties: {
                count: { type: "number", name: "Count" } as Property,
                flag: { type: "boolean", name: "Flag" } as Property,
            }
        } as EntityCollection;

        expect(getEntityTitlePropertyKey(collection, fields)).toBeUndefined();
    });
});
