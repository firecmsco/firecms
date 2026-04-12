import { HistoryService, findChangedFields } from "../src/history/HistoryService";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleClient } from "../src/interfaces";

describe("HistoryService - changedFields and history insertion logic", () => {
    describe("findChangedFields", () => {
        it("should return null when identical flat objects are compared", () => {
            const oldValues = { title: "Hello", description: "World" };
            const newValues = { title: "Hello", description: "World" };
            const result = findChangedFields(oldValues, newValues);
            expect(result).toBeNull();
        });

        it("should detect changes on simple properties", () => {
            const oldValues = { title: "Hello" };
            const newValues = { title: "Hello World" };
            const result = findChangedFields(oldValues, newValues);
            expect(result).toEqual(["title"]);
        });

        it("should skip properties starting with double underscore", () => {
            const oldValues = { title: "Hello", __internal: 123 };
            const newValues = { title: "Hello", __internal: 456 };
            const result = findChangedFields(oldValues, newValues);
            expect(result).toBeNull();
        });

        it("should return null for deeply identical relations", () => {
            const oldValues = {
                author: { id: "1", path: "authors", __type: "relation" },
                tags: [{ id: "1" }, { id: "2" }]
            };
            const newValues = {
                author: { id: "1", path: "authors", __type: "relation" },
                tags: [{ id: "1" }, { id: "2" }]
            };
            const result = findChangedFields(oldValues as Record<string, unknown>, newValues as Record<string, unknown>);
            expect(result).toBeNull();
        });

        it("should detect changes in relation properties when IDs differ", () => {
            const oldValues = {
                author: { id: "1", path: "authors", __type: "relation" }
            };
            const newValues = {
                author: { id: "2", path: "authors", __type: "relation" }
            };
            const result = findChangedFields(oldValues as Record<string, unknown>, newValues as Record<string, unknown>);
            expect(result).toEqual(["author"]);
        });
        
        it("should detect differences in relation arrays", () => {
            const oldValues = {
                tags: [{ id: "1" }]
            };
            const newValues = {
                tags: [{ id: "1" }, { id: "2" }]
            };
            const result = findChangedFields(oldValues as unknown as Record<string, unknown>, newValues as unknown as Record<string, unknown>);
            expect(result).toEqual(["tags"]);
        });
    });

    describe("recordHistory execution mapping", () => {
        let db: jest.Mocked<NodePgDatabase>;
        let historyService: HistoryService;

        beforeEach(() => {
            db = {
                execute: jest.fn().mockResolvedValue({})
            } as unknown as jest.Mocked<NodePgDatabase>;
            historyService = new HistoryService(db as unknown as DrizzleClient, {} as any);
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should skip execution when changed fields evaluate to null on update", async () => {
            await historyService.recordHistory({
                tableName: "posts",
                entityId: "1",
                action: "update",
                previousValues: { title: "same" },
                values: { title: "same" },
            });

            // db.execute should not be called since there is no data to log
            expect(db.execute).not.toHaveBeenCalled();
        });

        it("should properly structure database query on actual array changes", async () => {
            await historyService.recordHistory({
                tableName: "posts",
                entityId: "1",
                action: "update",
                previousValues: { title: "old", tags: [{ id: 1 }] },
                values: { title: "new", tags: [{ id: 2 }] }
            });

            // Since it's a difference, db.execute should be called.
            expect(db.execute).toHaveBeenCalledTimes(1);
            
            const executedSql = db.execute.mock.calls[0][0] as unknown as { query: string; sql?: string; strings?: string[]; values?: unknown[] };
            
            // Drizzle wraps SQL in its own SQL type which contains sql strings and params.
            // Wait, we can test that the text array serialization syntax is correctly matched.
            const queryStrings = executedSql.strings || [];
            const joinedStrings = queryStrings.join("?");
            
            // The syntax we added is ARRAY[?]::text[] or similar
            expect(joinedStrings).toContain("::text[]");
            expect(joinedStrings).toContain("ARRAY[");
        });

        it("should properly perform query during entity creation (insert)", async () => {
            await historyService.recordHistory({
                tableName: "posts",
                entityId: "1",
                action: "create",
                previousValues: undefined,
                values: { title: "new" }
            });

            expect(db.execute).toHaveBeenCalledTimes(1);
        });
    });
});
