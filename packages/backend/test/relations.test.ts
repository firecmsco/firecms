import { EntityCollection, Relation } from "@firecms/types";
import { normalizeRelation } from "@firecms/common";

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

    it("should not modify a fully defined relation with joins", () => {
        const relation: Relation = {
            relationName: "custom_posts",
            target: () => mockPostCollection,
            cardinality: "many",
            joins: [
                {
                    table: "posts",
                    sourceColumn: "authors.id",
                    targetColumn: "posts.author_id"
                }
            ]
        };
        const normalized = normalizeRelation(relation, mockAuthorCollection);
        expect(normalized.joins).toEqual([
            {
                table: "posts",
                sourceColumn: "authors.id",
                targetColumn: "posts.author_id"
            }
        ]);
        expect(normalized.relationName).toBe("custom_posts");
    });

    it("should generate a default relationName if not provided", () => {
        const relation: Relation = {
            target: () => mockPostCollection,
            cardinality: "one"
        };
        const normalized = normalizeRelation(relation, mockAuthorCollection);
        expect(normalized.relationName).toBe("posts");
    });

    // --- Belongs-To (cardinality: 'one', direction: 'owning') ---
    describe("Belongs-To (one-to-one/many-to-one)", () => {
        it("should generate default joins for a simple belongs-to relation", () => {
            const relation: Relation = {
                relationName: "post",
                target: () => mockPostCollection,
                cardinality: "one"
            };
            const normalized = normalizeRelation(relation, mockAuthorCollection);
            expect(normalized.joins).toEqual([
                {
                    table: "posts",
                    sourceColumn: "authors.post_id",
                    targetColumn: "posts.id"
                }
            ]);
        });

        it("should use `localKey` for a belongs-to relation", () => {
            const relation: Relation = {
                relationName: "post",
                target: () => mockPostCollection,
                cardinality: "one",
                localKey: "custom_post_fk"
            };
            const normalized = normalizeRelation(relation, mockAuthorCollection);
            expect(normalized.joins).toEqual([
                {
                    table: "posts",
                    sourceColumn: "authors.custom_post_fk",
                    targetColumn: "posts.id"
                }
            ]);
        });
    });

    // --- Has-Many (cardinality: 'many', direction: 'inverse') ---
    describe("Has-Many (one-to-many)", () => {
        it("should generate default joins for a simple has-many relation", () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => mockPostCollection,
                cardinality: "many",
                direction: "inverse"
            };
            const normalized = normalizeRelation(relation, mockAuthorCollection);
            expect(normalized.joins).toEqual([
                {
                    table: "posts",
                    sourceColumn: "authors.id",
                    targetColumn: "posts.author_id"
                }
            ]);
        });

        it("should use `foreignKeyOnTarget` for a has-many relation", () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => mockPostCollection,
                cardinality: "many",
                direction: "inverse",
                foreignKeyOnTarget: "writer_id"
            };
            const normalized = normalizeRelation(relation, mockAuthorCollection);
            expect(normalized.joins).toEqual([
                {
                    table: "posts",
                    sourceColumn: "authors.id",
                    targetColumn: "posts.writer_id"
                }
            ]);
        });
    });

    // --- Many-To-Many (cardinality: 'many', through) ---
    describe("Many-To-Many", () => {
        it("should generate joins for a many-to-many relation using `through`", () => {
            const relation: Relation = {
                relationName: "tags",
                target: () => mockTagCollection,
                cardinality: "many",
                through: {
                    table: "posts_tags",
                    sourceColumn: "post_id",
                    targetColumn: "tag_id"
                }
            };
            const normalized = normalizeRelation(relation, mockPostCollection);
            expect(normalized.joins).toEqual([
                {
                    table: "posts_tags",
                    sourceColumn: "posts.id",
                    targetColumn: "posts_tags.post_id"
                },
                {
                    table: "tags",
                    sourceColumn: "posts_tags.tag_id",
                    targetColumn: "tags.id"
                }
            ]);
        });

        it("should handle custom source/target ID fields in many-to-many", () => {
            const postWithCustomId: EntityCollection = { ...mockPostCollection, idField: "post_uuid" };
            const tagWithCustomId: EntityCollection = { ...mockTagCollection, idField: "tag_uuid" };
            const relation: Relation = {
                relationName: "tags",
                target: () => tagWithCustomId,
                cardinality: "many",
                through: {
                    table: "posts_tags",
                    sourceColumn: "post_reference",
                    targetColumn: "tag_reference"
                }
            };
            const normalized = normalizeRelation(relation, postWithCustomId);
            expect(normalized.joins).toEqual([
                {
                    table: "posts_tags",
                    sourceColumn: "posts.post_uuid",
                    targetColumn: "posts_tags.post_reference"
                },
                {
                    table: "tags",
                    sourceColumn: "posts_tags.tag_reference",
                    targetColumn: "tags.tag_uuid"
                }
            ]);
        });
    });

    // --- Fallback/Default Behavior ---
    describe("Fallback Behavior", () => {
        it("should use fallback logic for ambiguous 'many' without direction or through", () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => mockPostCollection,
                cardinality: "many"
            };
            const normalized = normalizeRelation(relation, mockAuthorCollection);
            // Should default to has-many (inverse) behavior for cardinality 'many'
            expect(normalized.joins).toEqual([
                {
                    table: "posts",
                    sourceColumn: "authors.id",
                    targetColumn: "posts.author_id"
                }
            ]);
        });

        it("should use fallback logic for 'one' with 'inverse' direction", () => {
            const relation: Relation = {
                relationName: "author",
                target: () => mockAuthorCollection,
                cardinality: "one",
                direction: "inverse"
            };
            const normalized = normalizeRelation(relation, mockPostCollection);
            // Falls back to the 'one'/'belongs-to' style join generation
            expect(normalized.joins).toEqual([
                {
                    table: "authors",
                    sourceColumn: "posts.author_id",
                    targetColumn: "authors.id"
                }
            ]);
        });
    });

    it("should normalize join columns to include table names", () => {
        const relation: Relation = {
            relationName: "tags",
            target: () => mockTagCollection,
            cardinality: "many",
            joins: [
                {
                    table: "posts_tags",
                    sourceColumn: "id", // should become posts.id
                    targetColumn: "post_id" // should become posts_tags.post_id
                },
                {
                    table: "tags",
                    sourceColumn: "tag_id", // should become posts_tags.tag_id
                    targetColumn: "id" // should become tags.id
                }
            ]
        };
        const normalized = normalizeRelation(relation, mockPostCollection);
        expect(normalized.joins).toEqual([
            {
                table: "posts_tags",
                sourceColumn: "posts.id",
                targetColumn: "posts_tags.post_id"
            },
            {
                table: "tags",
                sourceColumn: "posts_tags.tag_id",
                targetColumn: "tags.id"
            }
        ]);
    });
});
