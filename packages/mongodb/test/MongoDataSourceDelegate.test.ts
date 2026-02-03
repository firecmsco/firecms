/**
 * MongoDataSourceDelegate Tests
 * 
 * Tests for the DataSourceDelegate implementation that integrates with FireCMS.
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, Db, ObjectId } from "mongodb";
import { MongoDataSourceDelegate } from "../src/services/MongoDataSourceDelegate";
import { EntityCollection } from "@firecms/types";

describe("MongoDataSourceDelegate", () => {
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let db: Db;
    let delegate: MongoDataSourceDelegate;

    const mockCollection: EntityCollection = {
        name: "users",
        properties: {
            name: { dataType: "string" },
            email: { dataType: "string" },
            age: { dataType: "number" }
        }
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        client = new MongoClient(uri);
        await client.connect();
        db = client.db("test");
        delegate = new MongoDataSourceDelegate(db);
    });

    afterAll(async () => {
        await client.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            await db.dropCollection(col.name);
        }
    });

    describe("key and initialization", () => {
        it("should have key set to 'mongodb'", () => {
            expect(delegate.key).toBe("mongodb");
        });

        it("should be initialized", () => {
            expect(delegate.initialised).toBe(true);
        });

        it("should report as ready", () => {
            expect(delegate.isReady()).toBe(true);
        });
    });

    describe("generateEntityId", () => {
        it("should generate a valid ObjectId string", () => {
            const id = delegate.generateEntityId("users");
            expect(ObjectId.isValid(id)).toBe(true);
        });
    });

    describe("currentTime", () => {
        it("should return current timestamp", () => {
            const before = new Date();
            const time = delegate.currentTime();
            const after = new Date();

            expect(time.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(time.getTime()).toBeLessThanOrEqual(after.getTime());
        });
    });

    describe("setDateToMidnight", () => {
        it("should set date to midnight UTC", () => {
            const date = new Date("2024-06-15T14:30:00Z");
            const midnight = delegate.setDateToMidnight(date);

            expect(midnight.getUTCHours()).toBe(0);
            expect(midnight.getUTCMinutes()).toBe(0);
            expect(midnight.getUTCSeconds()).toBe(0);
            expect(midnight.getUTCMilliseconds()).toBe(0);
        });

        it("should return non-Date values unchanged", () => {
            expect(delegate.setDateToMidnight("string")).toBe("string");
            expect(delegate.setDateToMidnight(123)).toBe(123);
            expect(delegate.setDateToMidnight(null)).toBe(null);
        });
    });

    describe("fetchEntity", () => {
        it("should fetch an entity", async () => {
            // Insert test data
            const result = await db.collection("users").insertOne({
                name: "Test User",
                email: "test@example.com"
            });

            const entity = await delegate.fetchEntity({
                path: "users",
                entityId: result.insertedId.toString(),
                collection: mockCollection
            });

            expect(entity).toBeDefined();
            expect(entity?.values.name).toBe("Test User");
        });

        it("should return undefined for non-existent entity", async () => {
            const entity = await delegate.fetchEntity({
                path: "users",
                entityId: new ObjectId().toString(),
                collection: mockCollection
            });

            expect(entity).toBeUndefined();
        });
    });

    describe("fetchCollection", () => {
        beforeEach(async () => {
            await db.collection("users").insertMany([
                { name: "Alice", age: 25 },
                { name: "Bob", age: 30 },
                { name: "Charlie", age: 35 }
            ]);
        });

        it("should fetch all entities", async () => {
            const entities = await delegate.fetchCollection({
                path: "users",
                collection: mockCollection
            });

            expect(entities).toHaveLength(3);
        });

        it("should apply limit", async () => {
            const entities = await delegate.fetchCollection({
                path: "users",
                collection: mockCollection,
                limit: 2
            });

            expect(entities).toHaveLength(2);
        });

        it("should apply ordering", async () => {
            const entities = await delegate.fetchCollection({
                path: "users",
                collection: mockCollection,
                orderBy: "age",
                order: "desc"
            });

            const ages = entities.map(e => e.values.age);
            expect(ages).toEqual([35, 30, 25]);
        });
    });

    describe("saveEntity", () => {
        it("should create a new entity", async () => {
            const entity = await delegate.saveEntity({
                path: "users",
                values: { name: "New User", email: "new@example.com" },
                collection: mockCollection,
                status: "new"
            });

            expect(entity.id).toBeDefined();
            expect(entity.values.name).toBe("New User");

            // Verify it was saved
            const fetched = await delegate.fetchEntity({
                path: "users",
                entityId: entity.id,
                collection: mockCollection
            });
            expect(fetched?.values.name).toBe("New User");
        });

        it("should update an existing entity", async () => {
            // Create first
            const created = await delegate.saveEntity({
                path: "users",
                values: { name: "Original", email: "test@example.com" },
                collection: mockCollection,
                status: "new"
            });

            // Update
            const updated = await delegate.saveEntity({
                path: "users",
                entityId: created.id,
                values: { name: "Updated", email: "test@example.com" },
                collection: mockCollection,
                status: "existing"
            });

            expect(updated.id).toBe(created.id);
            expect(updated.values.name).toBe("Updated");
        });
    });

    describe("deleteEntity", () => {
        it("should delete an entity", async () => {
            // Create
            const entity = await delegate.saveEntity({
                path: "users",
                values: { name: "To Delete" },
                collection: mockCollection,
                status: "new"
            });

            // Delete
            await delegate.deleteEntity({
                entity,
                collection: mockCollection
            });

            // Verify deleted
            const fetched = await delegate.fetchEntity({
                path: "users",
                entityId: entity.id,
                collection: mockCollection
            });
            expect(fetched).toBeUndefined();
        });
    });

    describe("countEntities", () => {
        beforeEach(async () => {
            await db.collection("users").insertMany([
                { status: "active" },
                { status: "active" },
                { status: "inactive" }
            ]);
        });

        it("should count all entities", async () => {
            const count = await delegate.countEntities({
                path: "users",
                collection: mockCollection
            });

            expect(count).toBe(3);
        });

        it("should count with filter", async () => {
            const count = await delegate.countEntities({
                path: "users",
                collection: mockCollection,
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

        it("should return true for unique value", async () => {
            const isUnique = await delegate.checkUniqueField(
                "users",
                "email",
                "unique@example.com",
                undefined,
                mockCollection
            );

            expect(isUnique).toBe(true);
        });

        it("should return false for existing value", async () => {
            const isUnique = await delegate.checkUniqueField(
                "users",
                "email",
                "alice@example.com",
                undefined,
                mockCollection
            );

            expect(isUnique).toBe(false);
        });
    });

    describe("listenCollection", () => {
        it("should call onUpdate with initial data", (done) => {
            db.collection("users").insertMany([
                { name: "User 1" },
                { name: "User 2" }
            ]).then(() => {
                const unsubscribe = delegate.listenCollection({
                    path: "users",
                    collection: mockCollection,
                    onUpdate: (entities) => {
                        expect(entities).toHaveLength(2);
                        unsubscribe();
                        done();
                    },
                    onError: (error) => {
                        unsubscribe();
                        done(error);
                    }
                });
            });
        });

        it("should return unsubscribe function", () => {
            const unsubscribe = delegate.listenCollection({
                path: "users",
                collection: mockCollection,
                onUpdate: () => { },
                onError: () => { }
            });

            expect(typeof unsubscribe).toBe("function");
            unsubscribe();
        });
    });

    describe("listenEntity", () => {
        it("should call onUpdate with initial data", (done) => {
            db.collection("users").insertOne({ name: "Test User" }).then((result) => {
                const entityId = result.insertedId.toString();

                const unsubscribe = delegate.listenEntity({
                    path: "users",
                    entityId,
                    collection: mockCollection,
                    onUpdate: (entity) => {
                        expect(entity?.values.name).toBe("Test User");
                        unsubscribe();
                        done();
                    },
                    onError: (error) => {
                        unsubscribe();
                        done(error);
                    }
                });
            });
        });
    });
});
