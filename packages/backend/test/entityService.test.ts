import { EntityService } from "../src/db/entityService";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityCollection } from "@firecms/types";
import { collectionRegistry } from "../src/collections/registry";

// --- Mock Drizzle ORM table definitions (using 'as any' to avoid TS-specific syntax errors in a misconfigured Jest environment) ---
const mockAuthorsTable = {
    id: { name: "id" },
    name: { name: "name" },
    _def: { tableName: "authors" }
};
const mockPostsTable = {
    id: { name: "id" },
    title: { name: "title" },
    author_id: { name: "author_id" },
    _def: { tableName: "posts" }
};
const mockTagsTable = {
    id: { name: "id" },
    name: { name: "name" },
    _def: { tableName: "tags" }
};
const mockPostsTagsTable = {
    post_id: { name: "post_id" },
    tag_id: { name: "tag_id" },
    _def: { tableName: "posts_tags" }
};

// --- Correctly typed Mock Entity Collections ---
let authorsCollection: EntityCollection;
const tagsCollection: EntityCollection = {
    slug: "tags",
    name: "Tags",
    dbPath: "tags",
    properties: {
        id: { type: "number" },
        name: { type: "string" }
    },
    idField: "id",
};

const postsCollection: EntityCollection = {
    slug: "posts",
    name: "Posts",
    dbPath: "posts",
    properties: {
        id: { type: "number" },
        title: { type: "string" },
        author: {
            type: "relation",
            relationName: "author"
        },
        tags: {
            type: "relation",
            relationName: "tags"
        }
    },
    relations: [
        {
            relationName: "author",
            target: () => authorsCollection,
            cardinality: "one",
            direction: "owning",
            localKey: "author_id"
        },
        {
            relationName: "tags",
            target: () => tagsCollection,
            cardinality: "many",
            direction: "owning",
            through: {
                table: "posts_tags",
                sourceColumn: "post_id",
                targetColumn: "tag_id"
            }
        }
    ],
    idField: "id",
};

authorsCollection = {
    slug: "authors",
    name: "Authors",
    dbPath: "authors",
    properties: {
        id: { type: "number" },
        name: { type: "string" },
        posts: {
            type: "relation",
            relationName: "posts"
        }
    },
    relations: [
        {
            relationName: "posts",
            target: () => postsCollection,
            cardinality: "many",
            direction: "inverse",
            foreignKeyOnTarget: "author_id"
        }
    ],
    idField: "id",
};

describe("EntityService", () => {
    let entityService: EntityService;
    let db: jest.Mocked<NodePgDatabase<any>>;

    beforeEach(() => {
        jest.spyOn(collectionRegistry, "getCollectionByPath").mockImplementation(path => {
            if (path.startsWith("authors")) return authorsCollection;
            if (path.startsWith("posts")) return postsCollection;
            if (path.startsWith("tags")) return tagsCollection;
            return undefined;
        });
        jest.spyOn(collectionRegistry, "getTable").mockImplementation(dbPath => {
            if (dbPath === "authors") return mockAuthorsTable as any;
            if (dbPath === "posts") return mockPostsTable as any;
            if (dbPath === "tags") return mockTagsTable as any;
            if (dbPath === "posts_tags") return mockPostsTagsTable as any;
            return undefined;
        });
        jest.spyOn(collectionRegistry, "getAllCollectionsRecursively").mockReturnValue([authorsCollection, postsCollection, tagsCollection]);

        db = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([]),
            orderBy: jest.fn().mockResolvedValue([]), // This is now a terminal operation by default
            innerJoin: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            transaction: jest.fn((callback) => callback(db)),
        } as any;

        entityService = new EntityService(db);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("fetchEntity", () => {
        it("should parse a 'one' relation ID into a relation object with a string ID", async () => {
            const mockPost = {
                id: 2,
                title: "My First Post",
                author: 1
            };
            db.limit.mockResolvedValue([mockPost]);
            const entity = await entityService.fetchEntity("posts", 2);
            // The service correctly converts relation IDs to strings.
            expect(entity?.values.author).toEqual({
                id: "1",
                path: "authors",
                __type: "relation"
            });
        });
    });

    describe("saveEntity (create)", () => {
        it("should correctly serialize and deserialize a 'one' relation", async () => {
            const newPost = {
                title: "Post by Jane",
                author: {
                    id: "3",
                    path: "authors",
                    __type: "relation"
                }
            };
            db.returning.mockResolvedValue([{ id: 4 }]);
            // Mock the fetch-back call after the save
            db.limit.mockResolvedValue([{
                id: 4,
                title: "Post by Jane",
                author_id: "3"  // Database stores the foreign key
            }]);

            const entity = await entityService.saveEntity("posts", newPost);

            // 1. Check that the relation was serialized to a foreign key for the database insert
            expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
                title: "Post by Jane",
                author_id: "3"  // Should be serialized to FK for database storage
            }));

            // 2. Check that the returned entity has the relation deserialized correctly
            expect(entity.id).toBe("4");
            expect(entity.values.author).toEqual({
                id: "3",
                path: "authors",
                __type: "relation"
            });
        });
    });

    describe("saveEntity (update)", () => {
        it("should update junction table for a 'many' relation", async () => {
            const updatedPost = { tags: [{ id: 11 }, { id: 12 }] };
            db.limit.mockResolvedValue([{
                id: 5,
                title: "Post with Tags"
            }]);

            await entityService.saveEntity("posts", updatedPost, 5);

            expect(db.delete).toHaveBeenCalledWith(mockPostsTagsTable);
            expect(db.where).toHaveBeenCalledWith(expect.any(Object));
            expect(db.insert).toHaveBeenCalledWith(mockPostsTagsTable);
            expect(db.values).toHaveBeenLastCalledWith([{
                post_id: 5,
                tag_id: 11
            }, {
                post_id: 5,
                tag_id: 12
            }]);
        });
    });

    describe("fetchCollectionFromPath", () => {
        it("should fetch related entities from a nested path", async () => {
            const mockRelatedPosts = [{
                posts: {
                    id: 1,
                    title: "Post by John"
                }
            }, {
                posts: {
                    id: 2,
                    title: "Another Post by John"
                }
            }];
            // The chain ends with orderBy, so we mock its resolved value for this specific test.
            db.orderBy.mockResolvedValue(mockRelatedPosts);

            const entities = await entityService.fetchCollection("authors/1/posts", {});

            // The service should have been called to get the 'authors' collection definition.
            expect(collectionRegistry.getCollectionByPath).toHaveBeenCalledWith("authors");
            // For inverse relations like authors->posts, no join is needed as it uses a WHERE clause on the foreign key
            expect(entities).toHaveLength(2);
            expect(entities[0].values.title).toBe("Post by John");
        });
    });
});
