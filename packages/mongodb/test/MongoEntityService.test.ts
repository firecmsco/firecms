/**
 * MongoEntityService Tests
 * 
 * Tests for MongoDB entity CRUD operations using mongodb-memory-server.
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, Db, ObjectId } from "mongodb";
import { MongoEntityService } from "../src/db/MongoEntityService";

describe("MongoEntityService", () => {
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let db: Db;
    let entityService: MongoEntityService;

    beforeAll(async () => {
        // Start in-memory MongoDB
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        client = new MongoClient(uri);
        await client.connect();
        db = client.db("test");
        entityService = new MongoEntityService(db);
    });

    afterAll(async () => {
        await client.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear all collections before each test
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            await db.dropCollection(col.name);
        }
    });

    describe("generateEntityId", () => {
        it("should generate a valid ObjectId string", () => {
            const id = entityService.generateEntityId();
            expect(ObjectId.isValid(id)).toBe(true);
            expect(id).toHaveLength(24);
        });

        it("should generate unique IDs", () => {
            const ids = new Set<string>();
            for (let i = 0; i < 100; i++) {
                ids.add(entityService.generateEntityId());
            }
            expect(ids.size).toBe(100);
        });
    });

    describe("saveEntity", () => {
        it("should create a new entity without ID", async () => {
            const values = { name: "Test User", email: "test@example.com" };
            const entity = await entityService.saveEntity("users", values);

            expect(entity.id).toBeDefined();
            expect(ObjectId.isValid(entity.id)).toBe(true);
            expect(entity.path).toBe("users");
            expect(entity.values.name).toBe("Test User");
            expect(entity.values.email).toBe("test@example.com");
        });

        it("should create a new entity with provided ID", async () => {
            const id = new ObjectId().toString();
            const values = { name: "Test User", email: "test@example.com" };
            const entity = await entityService.saveEntity("users", values, id);

            expect(entity.id).toBe(id);
            expect(entity.values.name).toBe("Test User");
        });

        it("should update an existing entity", async () => {
            // Create entity
            const values = { name: "Original Name", email: "test@example.com" };
            const created = await entityService.saveEntity("users", values);

            // Update entity
            const updated = await entityService.saveEntity(
                "users",
                { name: "Updated Name", email: "test@example.com" },
                created.id
            );

            expect(updated.id).toBe(created.id);
            expect(updated.values.name).toBe("Updated Name");
        });

        it("should handle nested objects", async () => {
            const values = {
                name: "Test User",
                address: {
                    street: "123 Main St",
                    city: "Test City",
                    country: "Test Country"
                }
            };
            const entity = await entityService.saveEntity("users", values);

            expect(entity.values.address).toEqual({
                street: "123 Main St",
                city: "Test City",
                country: "Test Country"
            });
        });

        it("should handle arrays", async () => {
            const values = {
                name: "Test Post",
                tags: ["javascript", "mongodb", "testing"]
            };
            const entity = await entityService.saveEntity("posts", values);

            expect(entity.values.tags).toEqual(["javascript", "mongodb", "testing"]);
        });

        it("should handle Date values", async () => {
            const now = new Date();
            const values = { name: "Test", createdAt: now };
            const entity = await entityService.saveEntity("items", values);

            expect(entity.values.createdAt).toEqual(now);
        });
    });

    describe("fetchEntity", () => {
        it("should fetch an entity by ID", async () => {
            const values = { name: "Test User", email: "test@example.com" };
            const created = await entityService.saveEntity("users", values);

            const fetched = await entityService.fetchEntity("users", created.id);

            expect(fetched).toBeDefined();
            expect(fetched?.id).toBe(created.id);
            expect(fetched?.values.name).toBe("Test User");
        });

        it("should return undefined for non-existent entity", async () => {
            const nonExistentId = new ObjectId().toString();
            const entity = await entityService.fetchEntity("users", nonExistentId);

            expect(entity).toBeUndefined();
        });

        it("should handle string IDs", async () => {
            // Insert with a custom string ID (non-ObjectId)
            await db.collection("items").insertOne({
                _id: "custom-string-id" as any,
                name: "Custom ID Item"
            });

            const entity = await entityService.fetchEntity("items", "custom-string-id");
            expect(entity?.id).toBe("custom-string-id");
        });
    });

    describe("fetchCollection", () => {
        beforeEach(async () => {
            // Insert test data
            const users = [
                { name: "Alice", age: 25, status: "active" },
                { name: "Bob", age: 30, status: "active" },
                { name: "Charlie", age: 35, status: "inactive" },
                { name: "David", age: 40, status: "active" },
                { name: "Eve", age: 28, status: "pending" }
            ];
            await db.collection("users").insertMany(users);
        });

        it("should fetch all entities in a collection", async () => {
            const entities = await entityService.fetchCollection("users", {});
            expect(entities).toHaveLength(5);
        });

        it("should apply limit", async () => {
            const entities = await entityService.fetchCollection("users", { limit: 2 });
            expect(entities).toHaveLength(2);
        });

        it("should apply ordering (ascending)", async () => {
            const entities = await entityService.fetchCollection("users", {
                orderBy: "age",
                order: "asc"
            });

            const ages = entities.map(e => e.values.age);
            expect(ages).toEqual([25, 28, 30, 35, 40]);
        });

        it("should apply ordering (descending)", async () => {
            const entities = await entityService.fetchCollection("users", {
                orderBy: "age",
                order: "desc"
            });

            const ages = entities.map(e => e.values.age);
            expect(ages).toEqual([40, 35, 30, 28, 25]);
        });

        it("should apply equality filter", async () => {
            const entities = await entityService.fetchCollection("users", {
                filter: { status: ["==", "active"] }
            });

            expect(entities).toHaveLength(3);
            entities.forEach(e => expect(e.values.status).toBe("active"));
        });

        it("should apply greater than filter", async () => {
            const entities = await entityService.fetchCollection("users", {
                filter: { age: [">", 30] }
            });

            expect(entities).toHaveLength(2);
            entities.forEach(e => expect(e.values.age).toBeGreaterThan(30));
        });

        it("should apply combined filters", async () => {
            const entities = await entityService.fetchCollection("users", {
                filter: {
                    status: ["==", "active"],
                    age: [">=", 30]
                }
            });

            expect(entities).toHaveLength(2);
            entities.forEach(e => {
                expect(e.values.status).toBe("active");
                expect(e.values.age).toBeGreaterThanOrEqual(30);
            });
        });

        it("should return empty array for no matches", async () => {
            const entities = await entityService.fetchCollection("users", {
                filter: { status: ["==", "nonexistent"] }
            });

            expect(entities).toEqual([]);
        });
    });

    describe("deleteEntity", () => {
        it("should delete an existing entity", async () => {
            const values = { name: "To Delete" };
            const created = await entityService.saveEntity("users", values);

            await entityService.deleteEntity("users", created.id);

            const fetched = await entityService.fetchEntity("users", created.id);
            expect(fetched).toBeUndefined();
        });

        it("should not throw for non-existent entity", async () => {
            const nonExistentId = new ObjectId().toString();

            // Should not throw
            await expect(
                entityService.deleteEntity("users", nonExistentId)
            ).resolves.not.toThrow();
        });
    });

    describe("countEntities", () => {
        beforeEach(async () => {
            await db.collection("users").insertMany([
                { status: "active" },
                { status: "active" },
                { status: "inactive" },
            ]);
        });

        it("should count all entities", async () => {
            const count = await entityService.countEntities("users", {});
            expect(count).toBe(3);
        });

        it("should count with filter", async () => {
            const count = await entityService.countEntities("users", {
                filter: { status: ["==", "active"] }
            });
            expect(count).toBe(2);
        });
    });

    describe("checkUniqueField", () => {
        beforeEach(async () => {
            await db.collection("users").insertMany([
                { email: "alice@example.com" },
                { email: "bob@example.com" }
            ]);
        });

        it("should return true if value is unique", async () => {
            const isUnique = await entityService.checkUniqueField(
                "users",
                "email",
                "new@example.com"
            );
            expect(isUnique).toBe(true);
        });

        it("should return false if value exists", async () => {
            const isUnique = await entityService.checkUniqueField(
                "users",
                "email",
                "alice@example.com"
            );
            expect(isUnique).toBe(false);
        });

        it("should exclude specified entity from check", async () => {
            // Get Alice's ID
            const alice = await db.collection("users").findOne({ email: "alice@example.com" });

            // Should be unique when we exclude Alice
            const isUnique = await entityService.checkUniqueField(
                "users",
                "email",
                "alice@example.com",
                alice!._id.toString()
            );
            expect(isUnique).toBe(true);
        });
    });

    describe("nested collection paths", () => {
        it("should handle nested paths", async () => {
            // Create entity in nested path
            const values = { content: "Test comment" };
            const entity = await entityService.saveEntity("posts/123/comments", values);

            expect(entity.path).toBe("posts/123/comments");

            // The actual MongoDB collection should be "posts_123_comments"
            const collections = await db.listCollections().toArray();
            expect(collections.some(c => c.name === "posts_123_comments")).toBe(true);
        });
    });
});
