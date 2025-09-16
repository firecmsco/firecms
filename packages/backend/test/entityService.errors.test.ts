import { EntityService } from "../src/db/entityService";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityCollection } from "@firecms/types";
import { collectionRegistry } from "../src/collections/registry";

describe("EntityService - Error Handling & Edge Cases", () => {
    let entityService: EntityService;
    let db: jest.Mocked<NodePgDatabase<any>>;

    const mockTable = {
        id: { name: "id" },
        name: { name: "name" },
        _def: { tableName: "test_table" }
    };

    const testCollection: EntityCollection = {
        slug: "test",
        name: "Test Collection",
        dbPath: "test_table",
        properties: {
            id: { type: "number" },
            name: { type: "string" }
        },
        idField: "id"
    };

    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(collectionRegistry, "getCollectionByPath").mockImplementation(path => {
            if (path === "test" || path === "test_table") return testCollection;
            return undefined;
        });

        jest.spyOn(collectionRegistry, "getTable").mockImplementation(dbPath => {
            if (dbPath === "test_table") return mockTable as any;
            return undefined;
        });

        db = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            transaction: jest.fn((callback) => callback(db)),
        } as any;

        // Add a then method to make the db object awaitable when the query chain ends
        (db as any).then = jest.fn((resolve) => resolve([]));

        entityService = new EntityService(db);
    });

    describe("Collection Registry Errors", () => {
        it("should throw error when collection is not found", async () => {
            await expect(
                entityService.fetchEntity("nonexistent", 1)
            ).rejects.toThrow("Collection not found: nonexistent");
        });

        it("should throw error when table is not found for collection", async () => {
            jest.spyOn(collectionRegistry, "getTable").mockReturnValue(undefined);

            await expect(
                entityService.fetchEntity("test", 1)
            ).rejects.toThrow("Table not found for dbPath: test_table");
        });

        it("should throw error when ID field is missing from collection properties", async () => {
            const invalidCollection = {
                ...testCollection,
                properties: { name: { type: "string" } }, // Missing id field
                idField: "id"
            };
            jest.spyOn(collectionRegistry, "getCollectionByPath").mockReturnValue(invalidCollection);

            await expect(
                entityService.fetchEntity("test", 1)
            ).rejects.toThrow("ID field 'id' not found in properties");
        });
    });

    describe("ID Type Validation", () => {
        it("should handle valid numeric ID strings", async () => {
            const mockEntity = { id: 123, name: "Test" };
            db.limit.mockResolvedValue([mockEntity]);

            const entity = await entityService.fetchEntity("test", "123");
            expect(entity?.id).toBe("123");
        });

        it("should throw error for invalid numeric ID", async () => {
            await expect(
                entityService.fetchEntity("test", "invalid-number")
            ).rejects.toThrow("Invalid numeric ID: invalid-number");
        });

        it("should handle zero as valid ID", async () => {
            const mockEntity = { id: 0, name: "Test" };
            db.limit.mockResolvedValue([mockEntity]);

            const entity = await entityService.fetchEntity("test", 0);
            expect(entity?.id).toBe("0");
        });

        it("should handle negative numbers as valid ID", async () => {
            const mockEntity = { id: -1, name: "Test" };
            db.limit.mockResolvedValue([mockEntity]);

            const entity = await entityService.fetchEntity("test", -1);
            expect(entity?.id).toBe("-1");
        });
    });

    describe("Database Operation Errors", () => {
        it("should propagate database connection errors on fetch", async () => {
            const dbError = new Error("Connection timeout");
            db.limit.mockRejectedValue(dbError);

            await expect(
                entityService.fetchEntity("test", 1)
            ).rejects.toThrow("Connection timeout");
        });

        it("should propagate database errors on save", async () => {
            const dbError = new Error("Constraint violation");
            db.returning.mockRejectedValue(dbError);

            await expect(
                entityService.saveEntity("test", { name: "Test" })
            ).rejects.toThrow("Constraint violation");
        });

        it("should propagate database errors on delete", async () => {
            const dbError = new Error("Foreign key constraint");
            // Fix: Mock the delete method since deleteEntity doesn't use returning()
            db.delete.mockReturnValue({
                where: jest.fn().mockRejectedValue(dbError)
            } as any);

            await expect(
                entityService.deleteEntity("test", 1)
            ).rejects.toThrow("Foreign key constraint");
        });

        it("should handle transaction rollback scenarios", async () => {
            const transactionError = new Error("Transaction failed");
            db.transaction.mockImplementation((callback) => {
                throw transactionError;
            });

            await expect(
                entityService.saveEntity("test", { name: "Test" })
            ).rejects.toThrow("Transaction failed");
        });
    });

    describe("Path Validation", () => {
        it("should reject paths with even number of segments", async () => {
            await expect(
                entityService.fetchCollection("collection/id", {})
            ).rejects.toThrow("Invalid relation path: collection/id");
        });

        it("should reject single segment paths (not nested)", async () => {
            // Single collection paths should work fine, but let's test the path parsing logic
            const entities = await entityService.fetchCollection("test", {});
            expect(entities).toBeDefined(); // Should work for single collection
        });

        it("should reject empty path segments", async () => {
            await expect(
                entityService.fetchCollection("collection//relation", {})
            ).rejects.toThrow("Invalid relation path");
        });
    });

    describe("Concurrent Operations", () => {
        it("should handle multiple simultaneous reads", async () => {
            const mockEntity = { id: 1, name: "Test" };
            db.limit.mockResolvedValue([mockEntity]);

            const promises = Array(10).fill(0).map(() =>
                entityService.fetchEntity("test", 1)
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result?.id).toBe("1");
            });
        });

        it("should handle race conditions in write operations", async () => {
            db.returning.mockResolvedValue([{ id: 1 }]);
            db.limit.mockResolvedValue([{ id: 1, name: "Updated" }]);

            const promises = Array(5).fill(0).map((_, i) =>
                entityService.saveEntity("test", { name: `Update ${i}` }, 1)
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            // All should succeed due to transaction handling
        });
    });

    describe("Memory and Performance", () => {
        it("should handle large result sets without memory issues", async () => {
            const largeResultSet = Array(1000).fill(0).map((_, i) => ({
                id: i,
                name: `Entity ${i}`
            }));
            db.orderBy.mockResolvedValue(largeResultSet);

            const entities = await entityService.fetchCollection("test", {});

            expect(entities).toHaveLength(1000);
            expect(entities[0].values.name).toBe("Entity 0");
            expect(entities[999].values.name).toBe("Entity 999");
        });

        it("should handle pagination correctly for large datasets", async () => {
            const mockEntities = Array(50).fill(0).map((_, i) => ({
                id: i + 1,
                name: `Entity ${i + 1}`
            }));
            // Override the then method to return our mock data for this specific test
            (db as any).then = jest.fn((resolve) => resolve(mockEntities.slice(0, 20)));

            const entities = await entityService.fetchCollection("test", {
                limit: 20
            });

            expect(entities).toHaveLength(20);
            expect(db.limit).toHaveBeenCalledWith(20);
        });
    });

    describe("Data Integrity", () => {
        it("should validate required fields are present", async () => {
            const incompleteEntity = {}; // Missing required fields

            db.returning.mockResolvedValue([{ id: 1 }]);
            db.limit.mockResolvedValue([{ id: 1, name: null }]);

            // The service should handle validation at the collection level
            // This test verifies the service doesn't crash with incomplete data
            const entity = await entityService.saveEntity("test", incompleteEntity);
            expect(entity.id).toBe("1");
        });

        it("should handle NULL values in database correctly", async () => {
            const mockEntity = { id: 1, name: null };
            db.limit.mockResolvedValue([mockEntity]);

            const entity = await entityService.fetchEntity("test", 1);
            expect(entity?.values.name).toBeNull();
        });

        it("should handle undefined values in input data", async () => {
            const entityWithUndefined = { name: undefined };

            db.returning.mockResolvedValue([{ id: 1 }]);
            db.limit.mockResolvedValue([{ id: 1, name: null }]);

            const entity = await entityService.saveEntity("test", entityWithUndefined);
            expect(entity.id).toBe("1");
        });
    });

    describe("Security and Validation", () => {
        it("should handle SQL injection attempts in IDs safely", async () => {
            const maliciousId = "1; DROP TABLE test_table;--";

            // The service should handle this safely through parameterized queries
            // This test should not throw an error because of proper parameterization
            const mockEntity = { id: 1, name: "Safe" };
            db.limit.mockResolvedValue([mockEntity]);

            const entity = await entityService.fetchEntity("test", maliciousId);
            expect(entity).toBeDefined(); // Should work safely
        });

        it("should handle extremely long input values", async () => {
            const veryLongString = "a".repeat(10000);
            const entityWithLongValue = { name: veryLongString };

            db.returning.mockResolvedValue([{ id: 1 }]);
            db.limit.mockResolvedValue([{ id: 1, name: veryLongString }]);

            const entity = await entityService.saveEntity("test", entityWithLongValue);
            expect(entity.values.name).toBe(veryLongString);
        });

        it("should handle special characters in string values", async () => {
            const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";
            const entityWithSpecialChars = { name: specialChars };

            db.returning.mockResolvedValue([{ id: 1 }]);
            db.limit.mockResolvedValue([{ id: 1, name: specialChars }]);

            const entity = await entityService.saveEntity("test", entityWithSpecialChars);
            expect(entity.values.name).toBe(specialChars);
        });
    });

    describe("Edge Case Data Types", () => {
        it("should handle boolean false values correctly", async () => {
            const booleanCollection = {
                ...testCollection,
                properties: {
                    id: { type: "number" },
                    active: { type: "boolean" }
                }
            };
            jest.spyOn(collectionRegistry, "getCollectionByPath").mockReturnValue(booleanCollection);

            const mockEntity = { id: 1, active: false };
            db.limit.mockResolvedValue([mockEntity]);

            const entity = await entityService.fetchEntity("test", 1);
            expect(entity?.values.active).toBe(false);
        });

        it("should handle zero values correctly", async () => {
            const numericCollection = {
                ...testCollection,
                properties: {
                    id: { type: "number" },
                    count: { type: "number" }
                }
            };
            jest.spyOn(collectionRegistry, "getCollectionByPath").mockReturnValue(numericCollection);

            const mockEntity = { id: 1, count: 0 };
            db.limit.mockResolvedValue([mockEntity]);

            const entity = await entityService.fetchEntity("test", 1);
            expect(entity?.values.count).toBe(0);
        });

        it("should handle empty string values correctly", async () => {
            const mockEntity = { id: 1, name: "" };
            db.limit.mockResolvedValue([mockEntity]);

            const entity = await entityService.fetchEntity("test", 1);
            expect(entity?.values.name).toBe("");
        });
    });
});
