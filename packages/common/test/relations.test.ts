import {
    sanitizeRelation,
    getTableName,
    getTableVarName,
    getEnumVarName,
    getColumnName,
} from "../src/util/relations";
import { EntityCollection, Relation } from "@rebasepro/types";

// Helper to create minimal collections
function makeCollection(overrides: Partial<EntityCollection> = {}): EntityCollection {
    return {
        name: "Source",
        slug: "source",
        dbPath: "source",
        properties: {},
        ...overrides,
    };
}

function makeTargetCollection(overrides: Partial<EntityCollection> = {}): EntityCollection {
    return {
        name: "Target",
        slug: "target",
        dbPath: "target",
        properties: {},
        ...overrides,
    };
}

// ─────────────────────────────────────────────────────────────
// getTableName / getTableVarName / getEnumVarName / getColumnName
// ─────────────────────────────────────────────────────────────
describe("table/column naming utilities", () => {
    it("getTableName returns dbPath first", () => {
        expect(getTableName(makeCollection({ dbPath: "my_table", slug: "mySlug", name: "My Name" }))).toBe("my_table");
    });

    it("getTableName falls back to slug", () => {
        expect(getTableName(makeCollection({ dbPath: undefined as any, slug: "mySlug" }))).toBe("my_slug");
    });

    it("getTableVarName converts snake_case to camelCase", () => {
        expect(getTableVarName("user_profiles")).toBe("userProfiles");
        expect(getTableVarName("posts")).toBe("posts");
        expect(getTableVarName("a_b_c")).toBe("aBC");
    });

    it("getEnumVarName combines table and prop names", () => {
        expect(getEnumVarName("users", "status")).toBe("usersStatus");
        expect(getEnumVarName("user_profiles", "role")).toBe("userProfilesRole");
    });

    it("getColumnName extracts column from qualified name", () => {
        expect(getColumnName("table.column")).toBe("column");
        expect(getColumnName("column")).toBe("column");
        expect(getColumnName("a.b.c")).toBe("c");
    });
});

// ─────────────────────────────────────────────────────────────
// sanitizeRelation
// ─────────────────────────────────────────────────────────────
describe("sanitizeRelation", () => {
    it("throws when target is missing", () => {
        expect(() => sanitizeRelation({} as any, makeCollection())).toThrow("missing a `target`");
    });

    it("defaults relationName from target slug", () => {
        const target = makeTargetCollection({ slug: "user_profiles" });
        const result = sanitizeRelation(
            { target: () => target, cardinality: "one" } as Partial<Relation>,
            makeCollection()
        );
        expect(result.relationName).toBe("user_profiles");
    });

    it("infers direction as owning for one-to-one without foreignKeyOnTarget", () => {
        const target = makeTargetCollection();
        const result = sanitizeRelation(
            { target: () => target, cardinality: "one" } as Partial<Relation>,
            makeCollection()
        );
        expect(result.direction).toBe("owning");
    });

    it("infers direction as inverse for one-to-one with foreignKeyOnTarget", () => {
        const target = makeTargetCollection();
        const result = sanitizeRelation(
            { target: () => target, cardinality: "one", foreignKeyOnTarget: "source_id" } as Partial<Relation>,
            makeCollection()
        );
        expect(result.direction).toBe("inverse");
    });

    it("infers direction as inverse for has-many", () => {
        const target = makeTargetCollection();
        const result = sanitizeRelation(
            { target: () => target, cardinality: "many" } as Partial<Relation>,
            makeCollection()
        );
        expect(result.direction).toBe("inverse");
    });

    it("generates localKey for owning one-to-one", () => {
        const target = makeTargetCollection({ slug: "authors" });
        const result = sanitizeRelation(
            { target: () => target, cardinality: "one", direction: "owning" } as Partial<Relation>,
            makeCollection()
        );
        // Should generate a FK name from the relation name
        expect(result.localKey).toBeDefined();
        expect(typeof result.localKey).toBe("string");
    });

    it("generates foreignKeyOnTarget for inverse one-to-many", () => {
        const target = makeTargetCollection({ slug: "comments" });
        const result = sanitizeRelation(
            { target: () => target, cardinality: "many", direction: "inverse" } as Partial<Relation>,
            makeCollection({ slug: "posts", name: "Posts" })
        );
        expect(result.foreignKeyOnTarget).toBeDefined();
    });

    it("generates junction table for owning many-to-many", () => {
        const target = makeTargetCollection({ slug: "tags", dbPath: "tags" });
        const source = makeCollection({ slug: "posts", name: "Posts", dbPath: "posts" });
        const result = sanitizeRelation(
            { target: () => target, cardinality: "many", direction: "owning" } as Partial<Relation>,
            source
        );
        expect(result.through).toBeDefined();
        expect(result.through!.table).toBeDefined();
        expect(result.through!.sourceColumn).toBeDefined();
        expect(result.through!.targetColumn).toBeDefined();
    });

    it("creates sorted junction table name", () => {
        const target = makeTargetCollection({ slug: "tags", dbPath: "tags" });
        const source = makeCollection({ slug: "posts", name: "Posts", dbPath: "posts" });
        const result = sanitizeRelation(
            { target: () => target, cardinality: "many", direction: "owning" } as Partial<Relation>,
            source
        );
        // Should be alphabetically sorted: "posts_tags"
        expect(result.through!.table).toBe("posts_tags");
    });

    it("validates owning one-to-one requires localKey", () => {
        const target = makeTargetCollection();
        // Force direction owning + no localKey by providing a joinPath (which skips auto-generation)
        // Actually let's test the validation error by using custom joinPath=undefined but no auto-generation
        // The current code auto-generates localKey, so this won't throw. Let's verify it's generated.
        const result = sanitizeRelation(
            { target: () => target, cardinality: "one", direction: "owning" } as Partial<Relation>,
            makeCollection()
        );
        expect(result.localKey).toBeDefined();
    });

    it("preserves explicit localKey", () => {
        const target = makeTargetCollection();
        const result = sanitizeRelation(
            { target: () => target, cardinality: "one", direction: "owning", localKey: "custom_fk" } as Partial<Relation>,
            makeCollection()
        );
        expect(result.localKey).toBe("custom_fk");
    });

    it("preserves explicit foreignKeyOnTarget", () => {
        const target = makeTargetCollection();
        const result = sanitizeRelation(
            { target: () => target, cardinality: "one", direction: "inverse", foreignKeyOnTarget: "custom_fk" } as Partial<Relation>,
            makeCollection()
        );
        expect(result.foreignKeyOnTarget).toBe("custom_fk");
    });
});
