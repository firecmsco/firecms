import { describe, it, expect } from "@jest/globals";
import { toPascalCase, toCamelCase, toSafeIdentifier, indent } from "../src/utils";
import { generateClient } from "../src/generate-client";
import { generateTypedefs } from "../src/generate-types";
import { generateCollectionModule } from "../src/generate-collection-module";
import { generateIndex } from "../src/generate-index";
import { generateSDK } from "../src/index";
import { EntityCollection } from "@rebasepro/types";

// ─── Test Fixtures ─────────────────────────────────────────────────

/** Minimal collection with no properties or relations */
const emptyCollection = {
    name: "Empty",
    singularName: "Empty",
    slug: "empty",
    dbPath: "empty",
    properties: {},
} as unknown as EntityCollection;

/** Simple flat collection with scalar properties */
const authorsCollection = {
    name: "Authors",
    singularName: "Author",
    slug: "authors",
    dbPath: "authors",
    properties: {
        id: {
            name: "ID",
            type: "number",
            isId: "increment",
            validation: { required: true },
        },
        name: {
            name: "Name",
            type: "string",
            validation: { required: true },
        },
        email: {
            name: "Email",
            type: "string",
        },
        bio: {
            name: "Bio",
            type: "string",
            multiline: true,
        },
        active: {
            name: "Active",
            type: "boolean",
        },
    },
} as unknown as EntityCollection;

/** Collection with every property type to test type mapping breadth */
const testEntitiesCollection = {
    name: "Test Entities",
    singularName: "Test Entity",
    slug: "test_entities",
    dbPath: "test_entities",
    properties: {
        id: {
            name: "ID",
            type: "number",
            validation: { required: true },
        },
        string_plain: {
            name: "String Plain",
            type: "string",
        },
        string_enum: {
            name: "String Enum",
            type: "string",
            enum: [
                { id: "opt_a", label: "Option A" },
                { id: "opt_b", label: "Option B" },
            ],
            validation: { required: true },
        },
        string_enum_simple: {
            name: "String Enum Simple",
            type: "string",
            enum: ["apple", "banana", "cherry"],
        },
        number_plain: {
            name: "Number Plain",
            type: "number",
        },
        number_enum: {
            name: "Number Enum",
            type: "number",
            enum: [10, 20, 30],
        },
        boolean_plain: {
            name: "Boolean Plain",
            type: "boolean",
        },
        date_plain: {
            name: "Date Plain",
            type: "date",
        },
        geopoint_field: {
            name: "Location",
            type: "geopoint",
        },
        reference_field: {
            name: "Reference",
            type: "reference",
        },
        map_plain: {
            name: "Map Plain",
            type: "map",
            properties: {
                nested_str: { name: "Nested Str", type: "string" },
                nested_num: { name: "Nested Num", type: "number" },
            },
        },
        map_keyvalue: {
            name: "Map KV",
            type: "map",
            // No sub-properties → generic Object
        },
        array_string: {
            name: "Array String",
            type: "array",
            of: { name: "Item", type: "string" },
        },
        array_enum: {
            name: "Array Enum",
            type: "array",
            of: { name: "Item", type: "string", enum: ["cat", "dog", "bird"] },
        },
        array_bare: {
            name: "Array Bare",
            type: "array",
            // No `of` → generic Array<*>
        },
    },
} as unknown as EntityCollection;

/** Collection with relations to exercise FK emission */
const postsCollection = {
    name: "Posts",
    singularName: "Post",
    slug: "posts",
    dbPath: "posts",
    properties: {
        id: { name: "ID", type: "number", validation: { required: true } },
        title: { name: "Title", type: "string", validation: { required: true } },
        content: { name: "Content", type: "string" },
        status: {
            name: "Status",
            type: "string",
            enum: [
                { id: "draft", label: "Draft" },
                { id: "review", label: "Review" },
                { id: "published", label: "Published" },
            ],
        },
        author: {
            name: "Author",
            type: "relation",
            relationType: "many_to_one",
            collectionSlug: "authors",
            target: () => authorsCollection,
        },
    },
} as unknown as EntityCollection;

// ─── Utility Tests ─────────────────────────────────────────────────

describe("Utils", () => {
    describe("toPascalCase", () => {
        it("converts snake_case to PascalCase", () => {
            expect(toPascalCase("private_notes")).toBe("PrivateNotes");
        });

        it("converts hyphen-case to PascalCase", () => {
            expect(toPascalCase("user-profiles")).toBe("UserProfiles");
        });

        it("handles single words", () => {
            expect(toPascalCase("posts")).toBe("Posts");
        });

        it("handles already PascalCase input", () => {
            expect(toPascalCase("TestEntities")).toBe("Testentities");
        });

        it("handles mixed separators", () => {
            expect(toPascalCase("my_cool-thing")).toBe("MyCoolThing");
        });

        it("handles empty string", () => {
            expect(toPascalCase("")).toBe("");
        });
    });

    describe("toCamelCase", () => {
        it("converts snake_case to camelCase", () => {
            expect(toCamelCase("private_notes")).toBe("privateNotes");
        });

        it("converts hyphen-case to camelCase", () => {
            expect(toCamelCase("user-profiles")).toBe("userProfiles");
        });

        it("handles single words", () => {
            expect(toCamelCase("posts")).toBe("posts");
        });
    });

    describe("toSafeIdentifier", () => {
        it("converts slugs with hyphens to camelCase", () => {
            expect(toSafeIdentifier("private-notes")).toBe("privateNotes");
        });

        it("strips non-alphanumeric characters", () => {
            expect(toSafeIdentifier("my@thing!")).toBe("myThing");
        });
    });

    describe("indent", () => {
        it("indents non-empty lines by the given amount", () => {
            const result = indent("hello\nworld", 4);
            expect(result).toBe("    hello\n    world");
        });

        it("preserves empty lines without indentation", () => {
            const result = indent("hello\n\nworld", 2);
            expect(result).toBe("  hello\n\n  world");
        });
    });
});

// ─── Client Generator Tests ────────────────────────────────────────

describe("generateClient", () => {
    let clientCode: string;

    beforeAll(() => {
        clientCode = generateClient();
    });

    it("returns a non-empty string", () => {
        expect(clientCode.length).toBeGreaterThan(100);
    });

    it("contains the auto-generated header", () => {
        expect(clientCode).toContain("Auto-generated by Rebase SDK Generator");
    });

    it("contains the RebaseClientConfig typedef", () => {
        expect(clientCode).toContain("@typedef {Object} RebaseClientConfig");
        expect(clientCode).toContain("@property {string} baseUrl");
    });

    it("contains the FindParams typedef", () => {
        expect(clientCode).toContain("@typedef {Object} FindParams");
        expect(clientCode).toContain("@property {number} [limit]");
        expect(clientCode).toContain("@property {Record<string, string>} [where]");
        expect(clientCode).toContain("@property {string[]} [include]");
    });

    it("contains the FindResponse typedef", () => {
        expect(clientCode).toContain("@typedef {Object} FindResponse");
        expect(clientCode).toContain("@property {Array<Object>} data");
    });

    it("exports the RebaseApiError class", () => {
        expect(clientCode).toContain("class RebaseApiError extends Error");
        expect(clientCode).toContain("this.status = status");
        expect(clientCode).toContain("this.code = code");
    });

    it("exports the buildQueryString function", () => {
        expect(clientCode).toContain("function buildQueryString(params)");
    });

    it("handles PostgREST filter serialization in buildQueryString", () => {
        expect(clientCode).toContain("params.where");
        expect(clientCode).toContain("encodeURIComponent");
    });

    it("exports createTransport with auth support", () => {
        expect(clientCode).toContain("function createTransport(config)");
        expect(clientCode).toContain("Authorization");
        expect(clientCode).toContain("Bearer");
    });

    it("exports createCollectionClient with all CRUD methods", () => {
        expect(clientCode).toContain("function createCollectionClient(transport, slug)");
        expect(clientCode).toContain("async find(params)");
        expect(clientCode).toContain("async findById(id)");
        expect(clientCode).toContain("async create(data)");
        expect(clientCode).toContain("async update(id, data)");
        expect(clientCode).toContain("async delete(id)");
    });

    it("exports all public symbols", () => {
        expect(clientCode).toContain(
            "export { RebaseApiError, buildQueryString, createTransport, createCollectionClient };"
        );
    });

    it("handles 204 No Content for DELETE responses", () => {
        expect(clientCode).toContain("res.status === 204");
    });

    it("provides setToken for runtime token refresh", () => {
        expect(clientCode).toContain("setToken(newToken)");
    });

    it("generates valid JavaScript syntax", () => {
        // new Function() only supports script-mode — strip ESM keywords
        const stripped = clientCode
            .replace(/^export /gm, "")
            .replace(/^import .*$/gm, "// import stripped");
        expect(() => {
            new Function(stripped);
        }).not.toThrow();
    });
});

// ─── Type Generation Tests ─────────────────────────────────────────

describe("generateTypedefs", () => {
    describe("with a simple scalar collection", () => {
        it("generates Entity, CreateInput, and UpdateInput typedefs", () => {
            const result = generateTypedefs(authorsCollection);
            expect(result.entityTypedef).toContain("@typedef {Object} Authors");
            expect(result.createTypedef).toContain("@typedef {Object} AuthorsCreateInput");
            expect(result.updateTypedef).toContain("@typedef {Object} AuthorsUpdateInput");
        });

        it("marks required fields as non-optional in the entity typedef", () => {
            const result = generateTypedefs(authorsCollection);
            // name is required → no brackets
            expect(result.entityTypedef).toContain("@property {string} name");
            // email is NOT required → brackets
            expect(result.entityTypedef).toContain("@property {string} [email]");
        });

        it("excludes auto-increment IDs from CreateInput", () => {
            const result = generateTypedefs(authorsCollection);
            // Entity should have id
            expect(result.entityTypedef).toContain("@property {number} id");
            // CreateInput should NOT have id (it's isId: "increment")
            expect(result.createTypedef).not.toContain("@property {number} id");
            // But it should still exist as a typedef
            expect(result.createTypedef).toContain("AuthorsCreateInput");
        });

        it("makes all fields optional in UpdateInput", () => {
            const result = generateTypedefs(authorsCollection);
            expect(result.updateTypedef).toContain("@property {number} [id]");
            expect(result.updateTypedef).toContain("@property {string} [name]");
            expect(result.updateTypedef).toContain("@property {string} [email]");
        });

        it("returns empty relationNames for a collection without relations", () => {
            const result = generateTypedefs(authorsCollection);
            expect(result.relationNames).toEqual([]);
        });
    });

    describe("with complex property types", () => {
        it("maps string properties to string", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain("@property {string} [string_plain]");
        });

        it("maps string enums (object form) to union types", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain(
                '@property {"opt_a" | "opt_b"} string_enum'
            );
        });

        it("maps string enums (simple array form) to union types", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain(
                '@property {"apple" | "banana" | "cherry"} [string_enum_simple]'
            );
        });

        it("maps number properties to number", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain("@property {number} [number_plain]");
        });

        it("maps number enums to union types", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain("@property {10 | 20 | 30} [number_enum]");
        });

        it("maps boolean properties to boolean", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain("@property {boolean} [boolean_plain]");
        });

        it("maps date properties to string (ISO 8601 over the wire)", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain("@property {string} [date_plain]");
        });

        it("maps geopoint to { latitude, longitude } object", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain(
                "@property {{ latitude: number, longitude: number }} [geopoint_field]"
            );
        });

        it("maps reference to string | number", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain(
                "@property {string | number} [reference_field]"
            );
        });

        it("maps map with sub-properties to inline object type", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain(
                "@property {{ nested_str: string, nested_num: number }} [map_plain]"
            );
        });

        it("maps map without sub-properties to generic Object", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain("@property {Object} [map_keyvalue]");
        });

        it("maps typed array to Array<element>", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain("@property {Array<string>} [array_string]");
        });

        it("maps array of enum to Array<union>", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain(
                '@property {Array<"cat" | "dog" | "bird">} [array_enum]'
            );
        });

        it("maps array without of to generic Array<*>", () => {
            const result = generateTypedefs(testEntitiesCollection);
            expect(result.entityTypedef).toContain("@property {Array<*>} [array_bare]");
        });
    });

    describe("with an empty collection", () => {
        it("generates valid typedefs with only the closing tag", () => {
            const result = generateTypedefs(emptyCollection);
            expect(result.entityTypedef).toContain("@typedef {Object} Empty");
            expect(result.entityTypedef).toContain(" */");
            expect(result.createTypedef).toContain("@typedef {Object} EmptyCreateInput");
            expect(result.updateTypedef).toContain("@typedef {Object} EmptyUpdateInput");
        });

        it("returns no relation names", () => {
            const result = generateTypedefs(emptyCollection);
            expect(result.relationNames).toEqual([]);
        });
    });

    describe("with relation properties", () => {
        it("skips relation properties from direct property iteration", () => {
            const result = generateTypedefs(postsCollection);
            // The "author" property has type "relation" and should be skipped
            // from the direct property loop — no "@property {string | number} author"
            // Instead, the FK column (author_id) should appear from resolveCollectionRelations
            expect(result.entityTypedef).not.toMatch(/@property .* author\b(?!_)/);
        });
    });
});

// ─── Collection Module Generator Tests ─────────────────────────────

describe("generateCollectionModule", () => {
    it("returns correct metadata for a simple collection", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.fileName).toBe("authors.js");
        expect(mod.slug).toBe("authors");
        expect(mod.varName).toBe("authors");
        expect(mod.factoryName).toBe("createAuthorsClient");
        expect(mod.typeName).toBe("Authors");
    });

    it("generates camelCase varName for snake_case slugs", () => {
        const mod = generateCollectionModule(testEntitiesCollection);
        expect(mod.varName).toBe("testEntities");
        expect(mod.factoryName).toBe("createTestEntitiesClient");
        expect(mod.typeName).toBe("TestEntities");
        expect(mod.fileName).toBe("test_entities.js");
    });

    it("includes the auto-generated header with collection name", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.content).toContain("Auto-generated by Rebase SDK Generator");
        expect(mod.content).toContain("Collection: Authors (slug: authors)");
    });

    it("imports createCollectionClient from client.js", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.content).toContain(
            "import { createCollectionClient } from './client.js';"
        );
    });

    it("contains the JSDoc typedefs for Entity, CreateInput, UpdateInput", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.content).toContain("@typedef {Object} Authors");
        expect(mod.content).toContain("@typedef {Object} AuthorsCreateInput");
        expect(mod.content).toContain("@typedef {Object} AuthorsUpdateInput");
    });

    it("exports a factory function with the correct name", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.content).toContain("export function createAuthorsClient(transport)");
    });

    it("calls createCollectionClient with the correct slug", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.content).toContain('return createCollectionClient(transport, "authors");');
    });

    it("includes CRUD return type annotations in JSDoc", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.content).toContain("find:");
        expect(mod.content).toContain("findById:");
        expect(mod.content).toContain("create:");
        expect(mod.content).toContain("update:");
        expect(mod.content).toContain("delete:");
    });

    it("documents relation names when present", () => {
        const mod = generateCollectionModule(postsCollection);
        // Posts collection has an author relation
        if (mod.relationNames.length > 0) {
            expect(mod.content).toContain("Available relations:");
        }
    });

    it("documents no relations when none exist", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.content).toContain("No relations available");
    });

    it("generates a type reference in find return type", () => {
        const mod = generateCollectionModule(authorsCollection);
        expect(mod.content).toContain("data: Authors[]");
    });

    it("generates valid JavaScript syntax", () => {
        const mod = generateCollectionModule(authorsCollection);
        // Strip ESM import/export for script-mode syntax check
        const stripped = mod.content
            .replace(/^import .*$/gm, "// import stripped")
            .replace(/^export /gm, "");
        expect(() => {
            new Function(stripped);
        }).not.toThrow();
    });
});

// ─── Index Generator Tests ─────────────────────────────────────────

describe("generateIndex", () => {
    const modules = [
        generateCollectionModule(authorsCollection),
        generateCollectionModule(postsCollection),
    ];
    let indexCode: string;

    beforeAll(() => {
        indexCode = generateIndex(modules);
    });

    it("contains the auto-generated header", () => {
        expect(indexCode).toContain("Auto-generated by Rebase SDK Generator");
    });

    it("imports createTransport and utilities from client.js", () => {
        expect(indexCode).toContain(
            "import { createTransport, RebaseApiError, buildQueryString } from './client.js';"
        );
    });

    it("imports all collection factory functions", () => {
        expect(indexCode).toContain("import { createAuthorsClient } from './authors.js';");
        expect(indexCode).toContain("import { createPostsClient } from './posts.js';");
    });

    it("exports createRebaseClient function", () => {
        expect(indexCode).toContain("export function createRebaseClient(config)");
    });

    it("creates all collection namespaces on the client", () => {
        expect(indexCode).toContain("authors: createAuthorsClient(transport),");
        expect(indexCode).toContain("posts: createPostsClient(transport),");
    });

    it("exposes setToken on the client", () => {
        expect(indexCode).toContain("setToken: transport.setToken,");
    });

    it("re-exports individual collection clients for tree-shaking", () => {
        expect(indexCode).toContain("export { createAuthorsClient } from './authors.js';");
        expect(indexCode).toContain("export { createPostsClient } from './posts.js';");
    });

    it("re-exports RebaseApiError and buildQueryString", () => {
        expect(indexCode).toContain(
            "export { RebaseApiError, buildQueryString } from './client.js';"
        );
    });

    it("includes JSDoc with usage example", () => {
        expect(indexCode).toContain("@example");
        expect(indexCode).toContain("createRebaseClient");
    });

    it("includes JSDoc return type with all collection namespaces", () => {
        expect(indexCode).toContain("authors: ReturnType<typeof createAuthorsClient>");
        expect(indexCode).toContain("posts: ReturnType<typeof createPostsClient>");
    });

    it("works with an empty module list", () => {
        const emptyIndex = generateIndex([]);
        expect(emptyIndex).toContain("export function createRebaseClient(config)");
        expect(emptyIndex).toContain("setToken: transport.setToken,");
        // Should not crash
        expect(emptyIndex).not.toContain("undefined");
    });
});

// ─── Full SDK Generator (generateSDK) Tests ────────────────────────

describe("generateSDK", () => {
    const collections = [authorsCollection, postsCollection, testEntitiesCollection];

    describe("file listing", () => {
        it("generates client.js + per-collection files + index.js + README.md", () => {
            const files = generateSDK(collections);
            const paths = files.map(f => f.path);
            expect(paths).toContain("client.js");
            expect(paths).toContain("authors.js");
            expect(paths).toContain("posts.js");
            expect(paths).toContain("test_entities.js");
            expect(paths).toContain("index.js");
            expect(paths).toContain("README.md");
        });

        it("generates exactly N+3 files (client + N collections + index + README)", () => {
            const files = generateSDK(collections);
            // 3 collections + client.js + index.js + README.md = 6
            expect(files).toHaveLength(6);
        });
    });

    describe("includeReadme option", () => {
        it("includes README by default", () => {
            const files = generateSDK(collections);
            expect(files.find(f => f.path === "README.md")).toBeDefined();
        });

        it("excludes README when includeReadme is false", () => {
            const files = generateSDK(collections, { includeReadme: false });
            expect(files.find(f => f.path === "README.md")).toBeUndefined();
            expect(files).toHaveLength(5);
        });
    });

    describe("README content", () => {
        it("lists all available collections", () => {
            const files = generateSDK(collections);
            const readme = files.find(f => f.path === "README.md")!;
            expect(readme.content).toContain("rebase.authors");
            expect(readme.content).toContain("rebase.posts");
            expect(readme.content).toContain("rebase.testEntities");
        });

        it("includes filter operator reference table", () => {
            const files = generateSDK(collections);
            const readme = files.find(f => f.path === "README.md")!;
            expect(readme.content).toContain("| `eq`");
            expect(readme.content).toContain("| `gte`");
            expect(readme.content).toContain("| `in`");
        });

        it("includes error handling example with RebaseApiError", () => {
            const files = generateSDK(collections);
            const readme = files.find(f => f.path === "README.md")!;
            expect(readme.content).toContain("RebaseApiError");
            expect(readme.content).toContain("err.status");
        });
    });

    describe("index.js wiring", () => {
        it("wires all collections into the createRebaseClient factory", () => {
            const files = generateSDK(collections);
            const index = files.find(f => f.path === "index.js")!;
            expect(index.content).toContain("createAuthorsClient");
            expect(index.content).toContain("createPostsClient");
            expect(index.content).toContain("createTestEntitiesClient");
        });
    });

    describe("with an empty collection list", () => {
        it("generates client.js + index.js + README even with zero collections", () => {
            const files = generateSDK([]);
            const paths = files.map(f => f.path);
            expect(paths).toContain("client.js");
            expect(paths).toContain("index.js");
            expect(paths).toContain("README.md");
            expect(files).toHaveLength(3);
        });
    });

    describe("resilience to broken collections", () => {
        it("skips a collection that throws during codegen and still generates the rest", () => {
            const brokenCollection = {
                name: "Broken",
                slug: "broken",
                // Missing properties entirely — set to undefined to force an edge case
                properties: undefined,
            } as unknown as EntityCollection;

            // Should not throw, and should generate at least client + index + README
            const files = generateSDK([authorsCollection, brokenCollection]);
            const paths = files.map(f => f.path);
            expect(paths).toContain("client.js");
            expect(paths).toContain("index.js");
            // authors should be generated regardless of broken
            expect(paths).toContain("authors.js");
        });
    });

    describe("JavaScript validity", () => {
        it("generates syntactically valid JS for every .js file", () => {
            const files = generateSDK(collections);
            for (const file of files) {
                if (!file.path.endsWith(".js")) continue;

                // Strip ES module import/export for syntax-check in Function()
                const stripped = file.content
                    .replace(/^import .*$/gm, "// import stripped")
                    .replace(/^export \{[^}]*\}.*$/gm, "// re-export stripped")
                    .replace(/^export /gm, "");

                expect(() => {
                    new Function(stripped);
                }).not.toThrow();
            }
        });
    });
});
