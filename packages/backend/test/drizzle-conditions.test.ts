import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { eq } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { Relation } from "@firecms/types";
import { BackendCollectionRegistry } from "../src/collections/BackendCollectionRegistry";
import { DrizzleConditionBuilder } from "../src/utils/drizzle-conditions";

// Mock tables for testing
const mockAuthorsTable = pgTable("authors", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    email: varchar("email").notNull()
});

const mockPostsTable = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: varchar("title").notNull(),
    content: varchar("content"),
    author_id: integer("author_id")
});

const mockTagsTable = pgTable("tags", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull()
});

const mockPostsTagsTable = pgTable("posts_tags", {
    post_id: integer("post_id").notNull(),
    tag_id: integer("tag_id").notNull()
});

// Mock registry
const createMockRegistry = () => {
    const registry = {
        getTable: jest.fn()
    } as unknown as BackendCollectionRegistry;

    (registry.getTable as jest.Mock).mockImplementation((tableName: string) => {
        switch (tableName) {
            case "authors": return mockAuthorsTable;
            case "posts": return mockPostsTable;
            case "tags": return mockTagsTable;
            case "posts_tags": return mockPostsTagsTable;
            default: return undefined;
        }
    });

    return registry;
};

describe('DrizzleConditionBuilder - Many-to-Many Relations', () => {
    let mockRegistry: BackendCollectionRegistry;

    beforeEach(() => {
        mockRegistry = createMockRegistry();
        jest.clearAllMocks();
    });

    describe('buildRelationConditions - Owning Many-to-Many', () => {
        it('should build correct conditions for owning many-to-many relation', () => {
            const relation: Relation = {
                relationName: "tags",
                target: () => ({ slug: "tags" } as any),
                cardinality: "many",
                direction: "owning",
                through: {
                    table: "posts_tags",
                    sourceColumn: "post_id",
                    targetColumn: "tag_id"
                }
            };

            const result = DrizzleConditionBuilder.buildRelationConditions(
                relation,
                1, // parentEntityId (post ID)
                mockTagsTable, // targetTable
                mockPostsTable, // parentTable
                mockPostsTable.id, // parentIdColumn
                mockTagsTable.id, // targetIdColumn
                mockRegistry
            );

            expect(result.joinConditions).toHaveLength(1);
            expect(result.whereConditions).toHaveLength(1);
            expect(mockRegistry.getTable).toHaveBeenCalledWith("posts_tags");
        });

        it('should handle array of parent entity IDs for owning relation', () => {
            const relation: Relation = {
                relationName: "tags",
                target: () => ({ slug: "tags" } as any),
                cardinality: "many",
                direction: "owning",
                through: {
                    table: "posts_tags",
                    sourceColumn: "post_id",
                    targetColumn: "tag_id"
                }
            };

            const result = DrizzleConditionBuilder.buildRelationConditions(
                relation,
                [1, 2, 3], // multiple post IDs
                mockTagsTable,
                mockPostsTable,
                mockPostsTable.id,
                mockTagsTable.id,
                mockRegistry
            );

            expect(result.joinConditions).toHaveLength(1);
            expect(result.whereConditions).toHaveLength(1);
        });
    });

    describe('buildRelationConditions - Inverse Many-to-Many', () => {
        it('should build correct conditions for inverse many-to-many relation', () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => ({ slug: "posts" } as any),
                cardinality: "many",
                direction: "inverse",
                through: {
                    table: "posts_tags",
                    sourceColumn: "tag_id",
                    targetColumn: "post_id"
                }
            };

            const result = DrizzleConditionBuilder.buildRelationConditions(
                relation,
                20, // parentEntityId (tag ID)
                mockPostsTable, // targetTable
                mockTagsTable, // parentTable
                mockTagsTable.id, // parentIdColumn
                mockPostsTable.id, // targetIdColumn
                mockRegistry
            );

            expect(result.joinConditions).toHaveLength(1);
            expect(result.whereConditions).toHaveLength(1);
            expect(mockRegistry.getTable).toHaveBeenCalledWith("posts_tags");
        });

        it('should handle array of parent entity IDs for inverse relation', () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => ({ slug: "posts" } as any),
                cardinality: "many",
                direction: "inverse",
                through: {
                    table: "posts_tags",
                    sourceColumn: "tag_id",
                    targetColumn: "post_id"
                }
            };

            const result = DrizzleConditionBuilder.buildRelationConditions(
                relation,
                [20, 21, 22], // multiple tag IDs
                mockPostsTable,
                mockTagsTable,
                mockTagsTable.id,
                mockPostsTable.id,
                mockRegistry
            );

            expect(result.joinConditions).toHaveLength(1);
            expect(result.whereConditions).toHaveLength(1);
        });
    });

    describe('Error handling', () => {
        it('should throw error when junction table is not found', () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => ({ slug: "posts" } as any),
                cardinality: "many",
                direction: "inverse",
                through: {
                    table: "nonexistent_table",
                    sourceColumn: "tag_id",
                    targetColumn: "post_id"
                }
            };

            expect(() => {
                DrizzleConditionBuilder.buildRelationConditions(
                    relation,
                    20,
                    mockPostsTable,
                    mockTagsTable,
                    mockTagsTable.id,
                    mockPostsTable.id,
                    mockRegistry
                );
            }).toThrow("Junction table not found: nonexistent_table");
        });

        it('should throw error when source column is not found in junction table', () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => ({ slug: "posts" } as any),
                cardinality: "many",
                direction: "inverse",
                through: {
                    table: "posts_tags",
                    sourceColumn: "nonexistent_column",
                    targetColumn: "post_id"
                }
            };

            expect(() => {
                DrizzleConditionBuilder.buildRelationConditions(
                    relation,
                    20,
                    mockPostsTable,
                    mockTagsTable,
                    mockTagsTable.id,
                    mockPostsTable.id,
                    mockRegistry
                );
            }).toThrow("Source column 'nonexistent_column' not found in junction table 'posts_tags'");
        });

        it('should throw error when target column is not found in junction table', () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => ({ slug: "posts" } as any),
                cardinality: "many",
                direction: "inverse",
                through: {
                    table: "posts_tags",
                    sourceColumn: "tag_id",
                    targetColumn: "nonexistent_column"
                }
            };

            expect(() => {
                DrizzleConditionBuilder.buildRelationConditions(
                    relation,
                    20,
                    mockPostsTable,
                    mockTagsTable,
                    mockTagsTable.id,
                    mockPostsTable.id,
                    mockRegistry
                );
            }).toThrow("Target column 'nonexistent_column' not found in junction table 'posts_tags'");
        });
    });

    describe('buildRelationCountQuery - Many-to-Many', () => {
        it('should build correct count query for owning many-to-many relation', () => {
            const relation: Relation = {
                relationName: "tags",
                target: () => ({ slug: "tags" } as any),
                cardinality: "many",
                direction: "owning",
                through: {
                    table: "posts_tags",
                    sourceColumn: "post_id",
                    targetColumn: "tag_id"
                }
            };

            const mockBaseQuery = {
                innerJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis()
            };

            const result = DrizzleConditionBuilder.buildRelationCountQuery(
                mockBaseQuery,
                relation,
                1, // parentEntityId
                mockTagsTable,
                mockPostsTable,
                mockPostsTable.id,
                mockTagsTable.id,
                mockRegistry
            );

            expect(mockBaseQuery.innerJoin).toHaveBeenCalled();
            expect(mockBaseQuery.where).toHaveBeenCalled();
        });

        it('should build correct count query for inverse many-to-many relation', () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => ({ slug: "posts" } as any),
                cardinality: "many",
                direction: "inverse",
                through: {
                    table: "posts_tags",
                    sourceColumn: "tag_id",
                    targetColumn: "post_id"
                }
            };

            const mockBaseQuery = {
                innerJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis()
            };

            const result = DrizzleConditionBuilder.buildRelationCountQuery(
                mockBaseQuery,
                relation,
                20, // parentEntityId (tag ID)
                mockPostsTable,
                mockTagsTable,
                mockTagsTable.id,
                mockPostsTable.id,
                mockRegistry
            );

            expect(mockBaseQuery.innerJoin).toHaveBeenCalled();
            expect(mockBaseQuery.where).toHaveBeenCalled();
        });
    });

    describe('buildRelationQuery - Many-to-Many', () => {
        it('should build correct query for owning many-to-many relation with additional filters', () => {
            const relation: Relation = {
                relationName: "tags",
                target: () => ({ slug: "tags" } as any),
                cardinality: "many",
                direction: "owning",
                through: {
                    table: "posts_tags",
                    sourceColumn: "post_id",
                    targetColumn: "tag_id"
                }
            };

            const mockBaseQuery = {
                innerJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis()
            };

            const additionalFilters = [eq(mockTagsTable.name, "javascript")];

            const result = DrizzleConditionBuilder.buildRelationQuery(
                mockBaseQuery,
                relation,
                1, // parentEntityId
                mockTagsTable,
                mockPostsTable,
                mockPostsTable.id,
                mockTagsTable.id,
                mockRegistry,
                additionalFilters
            );

            expect(mockBaseQuery.innerJoin).toHaveBeenCalled();
            expect(mockBaseQuery.where).toHaveBeenCalled();
        });

        it('should build correct query for inverse many-to-many relation with additional filters', () => {
            const relation: Relation = {
                relationName: "posts",
                target: () => ({ slug: "posts" } as any),
                cardinality: "many",
                direction: "inverse",
                through: {
                    table: "posts_tags",
                    sourceColumn: "tag_id",
                    targetColumn: "post_id"
                }
            };

            const mockBaseQuery = {
                innerJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis()
            };

            const additionalFilters = [eq(mockPostsTable.title, "Test Post")];

            const result = DrizzleConditionBuilder.buildRelationQuery(
                mockBaseQuery,
                relation,
                20, // parentEntityId (tag ID)
                mockPostsTable,
                mockTagsTable,
                mockTagsTable.id,
                mockPostsTable.id,
                mockRegistry,
                additionalFilters
            );

            expect(mockBaseQuery.innerJoin).toHaveBeenCalled();
            expect(mockBaseQuery.where).toHaveBeenCalled();
        });
    });

    describe('Real-world scenario: tags/20/posts', () => {
        it('should correctly handle the tags/20/posts scenario that was failing', () => {
            // This is the exact scenario from the user's error
            const tagsToPostsRelation: Relation = {
                relationName: "posts",
                target: () => ({ slug: "posts" } as any),
                cardinality: "many",
                direction: "inverse",
                through: {
                    table: "posts_tags",
                    sourceColumn: "tag_id", // FK to this collection's PK in junction table
                    targetColumn: "post_id" // FK to the target collection's PK in junction table
                }
            };

            const result = DrizzleConditionBuilder.buildRelationConditions(
                tagsToPostsRelation,
                20, // tag ID from URL: tags/20/posts
                mockPostsTable, // we want to get posts
                mockTagsTable, // from the tags collection
                mockTagsTable.id, // tag ID column
                mockPostsTable.id, // post ID column
                mockRegistry
            );

            // Should not throw an error and should return proper conditions
            expect(result.joinConditions).toHaveLength(1);
            expect(result.whereConditions).toHaveLength(1);

            // Verify the registry was called correctly
            expect(mockRegistry.getTable).toHaveBeenCalledWith("posts_tags");

            // This should no longer throw "Foreign key column 'tags_id' not found in target table"
            expect(() => result).not.toThrow();
        });
    });
});
