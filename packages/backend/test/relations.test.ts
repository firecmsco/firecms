import { EntityCollection, Relation } from "@firecms/types";
import { sanitizeRelation } from "@firecms/common";

const mockAuthorCollection: EntityCollection = {
    name: "Author",
    slug: "author",
    dbPath: "authors",
    properties: {
        id: {
            type: "number"
        },
        name: {
            type: "string"
        }
    },
    idField: "id"
};

const mockPostCollection: EntityCollection = {
    name: "Post",
    dbPath: "posts",
    properties: {
        id: {
            type: "number"
        },
        title: {
            type: "string"
        },
        author_id: {
            type: "number"
        }
    },
    idField: "id"
};

const mockTagCollection: EntityCollection = {
    name: "Tag",
    slug: "tags",
    properties: {
        id: {
            type: "string"
        },
        name: {
            type: "string"
        }
    },
    idField: "id"
};

describe("normalizeRelation", () => {

    it("should generate a default relationName if not provided", () => {
        const relation: Partial<Relation> = {
            target: () => mockPostCollection,
            cardinality: "one"
        };
        const normalized = sanitizeRelation(relation, mockAuthorCollection);
        expect(normalized.relationName).toBe("posts");
    });

    // --- Belongs-To (cardinality: 'one', direction: 'owning') ---
    describe("Belongs-To (one-to-one/many-to-one)", () => {
        it("should generate default localKey for a simple belongs-to relation", () => {
            const relation: Partial<Relation> = {
                relationName: "post",
                target: () => mockPostCollection,
                cardinality: "one"
            };
            const normalized = sanitizeRelation(relation, mockAuthorCollection);
            expect(normalized.localKey).toEqual("post_id");
            expect(normalized.direction).toEqual("owning");
        });

        it("should use provided `localKey` for a belongs-to relation", () => {
            const relation: Partial<Relation> = {
                relationName: "post",
                target: () => mockPostCollection,
                cardinality: "one",
                localKey: "custom_post_fk"
            };
            const normalized = sanitizeRelation(relation, mockAuthorCollection);
            expect(normalized.localKey).toEqual("custom_post_fk");
            expect(normalized.direction).toEqual("owning");
        });
    });

    // --- Has-Many (cardinality: 'many', direction: 'inverse') ---
    describe("Has-Many (one-to-many)", () => {
        it("should generate default foreignKeyOnTarget for a simple has-many relation", () => {
            const relation: Partial<Relation> = {
                relationName: "posts",
                target: () => mockPostCollection,
                cardinality: "many",
                direction: "inverse"
            };
            const normalized = sanitizeRelation(relation, mockAuthorCollection);
            expect(normalized.foreignKeyOnTarget).toEqual("author_id");
        });

        it("should use provided `foreignKeyOnTarget` for a has-many relation", () => {
            const relation: Partial<Relation> = {
                relationName: "posts",
                target: () => mockPostCollection,
                cardinality: "many",
                direction: "inverse",
                foreignKeyOnTarget: "writer_id"
            };
            const normalized = sanitizeRelation(relation, mockAuthorCollection);
            expect(normalized.foreignKeyOnTarget).toEqual("writer_id");
        });
    });

    // --- Many-To-Many (cardinality: 'many', through) ---
    describe("Many-To-Many", () => {
        it("should use provided `through` for a many-to-many relation", () => {
            const relation: Partial<Relation> = {
                relationName: "tags",
                target: () => mockTagCollection,
                cardinality: "many",
                through: {
                    table: "posts_tags",
                    sourceColumn: "post_id",
                    targetColumn: "tag_id"
                }
            };
            const normalized = sanitizeRelation(relation, mockPostCollection);
            expect(normalized.through).toEqual({
                table: "posts_tags",
                sourceColumn: "post_id",
                targetColumn: "tag_id"
            });
            expect(normalized.direction).toEqual("owning");
        });
    });

    // --- Fallback/Default Behavior ---
    describe("Fallback Behavior", () => {
        it("should fallback to has-many for ambiguous 'many' without direction or through", () => {
            const relation: Partial<Relation> = {
                relationName: "posts",
                target: () => mockPostCollection,
                cardinality: "many"
            };
            const normalized = sanitizeRelation(relation, mockAuthorCollection);
            // Should default to has-many (inverse) behavior
            expect(normalized.direction).toEqual("inverse");
            expect(normalized.foreignKeyOnTarget).toEqual("author_id");
        });

        it("should handle 'one' with 'owning' direction", () => {
            const relation: Partial<Relation> = {
                relationName: "author",
                target: () => mockAuthorCollection,
                cardinality: "one",
                direction: "owning" // Changed from "inverse"
            };
            const normalized = sanitizeRelation(relation, mockPostCollection);
            expect(normalized.localKey).toEqual("author_id");
        });
    });
});
