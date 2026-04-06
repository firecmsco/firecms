import { buildRebaseData } from "../src/data/buildRebaseData";
import { DataDriver, Entity } from "@rebasepro/types";

// ── Mock driver ─────────────────────────────────────────────
function createMockDriver(overrides: Partial<DataDriver> = {}): DataDriver {
    return {
        fetchCollection: jest.fn().mockResolvedValue([]),
        fetchEntity: jest.fn().mockResolvedValue(undefined),
        saveEntity: jest.fn().mockImplementation(async ({ path, values, entityId, status }) => ({
            id: entityId ?? "new-id",
            path,
            values,
        })),
        deleteEntity: jest.fn().mockResolvedValue(undefined),
        countEntities: jest.fn().mockResolvedValue(0),
        ...overrides,
    };
}

describe("buildRebaseData", () => {
    it("creates a proxy that returns CollectionAccessor for any slug", () => {
        const driver = createMockDriver();
        const data = buildRebaseData(driver);

        expect(data.products).toBeDefined();
        expect(data.users).toBeDefined();
        expect(typeof data.products.find).toBe("function");
        expect(typeof data.products.findById).toBe("function");
        expect(typeof data.products.create).toBe("function");
        expect(typeof data.products.update).toBe("function");
        expect(typeof data.products.delete).toBe("function");
    });

    it("caches accessor instances", () => {
        const driver = createMockDriver();
        const data = buildRebaseData(driver);

        const ref1 = data.products;
        const ref2 = data.products;
        expect(ref1).toBe(ref2);
    });

    it("provides a collection() method", () => {
        const driver = createMockDriver();
        const data = buildRebaseData(driver);

        const accessor = data.collection("products");
        expect(accessor).toBe(data.products);
    });

    it("ignores Symbol properties", () => {
        const driver = createMockDriver();
        const data = buildRebaseData(driver);

        expect((data as any)[Symbol.toPrimitive]).toBeUndefined();
    });

    it("ignores 'then' property (Promise interop)", () => {
        const driver = createMockDriver();
        const data = buildRebaseData(driver);

        expect((data as any).then).toBeUndefined();
    });

    // ── find ────────────────────────────────────────────────
    describe("CollectionAccessor.find", () => {
        it("delegates to driver.fetchCollection", async () => {
            const mockEntities: Entity[] = [
                { id: "1", path: "products", values: { name: "Camera" } },
            ];
            const driver = createMockDriver({
                fetchCollection: jest.fn().mockResolvedValue(mockEntities),
            });
            const data = buildRebaseData(driver);

            const result = await data.products.find({ limit: 10 });

            expect(driver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({ path: "products", limit: 10 })
            );
            expect(result.data).toEqual(mockEntities);
            expect(result.meta.limit).toBe(10);
        });

        it("converts PostgREST where filters", async () => {
            const driver = createMockDriver({
                fetchCollection: jest.fn().mockResolvedValue([]),
            });
            const data = buildRebaseData(driver);

            await data.products.find({
                where: { status: "eq.published", price: "gte.100" },
            });

            expect(driver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: {
                        status: ["==", "published"],
                        price: [">=", 100],
                    },
                })
            );
        });

        it("parses comma-separated list values", async () => {
            const driver = createMockDriver({
                fetchCollection: jest.fn().mockResolvedValue([]),
            });
            const data = buildRebaseData(driver);

            await data.products.find({
                where: { role: "in.(admin,editor)" },
            });

            expect(driver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: {
                        role: ["in", ["admin", "editor"]],
                    },
                })
            );
        });

        it("parses orderBy string", async () => {
            const driver = createMockDriver({
                fetchCollection: jest.fn().mockResolvedValue([]),
            });
            const data = buildRebaseData(driver);

            await data.products.find({ orderBy: "created_at:desc" });

            expect(driver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: "created_at",
                    order: "desc",
                })
            );
        });

        it("sets hasMore based on entity count vs limit", async () => {
            const entities = Array.from({ length: 20 }, (_, i) => ({
                id: String(i),
                path: "products",
                values: {},
            }));
            const driver = createMockDriver({
                fetchCollection: jest.fn().mockResolvedValue(entities),
            });
            const data = buildRebaseData(driver);

            const result = await data.products.find({ limit: 20 });
            expect(result.meta.hasMore).toBe(true);

            const partial = entities.slice(0, 5);
            (driver.fetchCollection as jest.Mock).mockResolvedValue(partial);
            const result2 = await data.products.find({ limit: 20 });
            expect(result2.meta.hasMore).toBe(false);
        });
    });

    // ── findById ────────────────────────────────────────────
    describe("CollectionAccessor.findById", () => {
        it("delegates to driver.fetchEntity", async () => {
            const entity: Entity = { id: "abc", path: "products", values: { name: "Camera" } };
            const driver = createMockDriver({
                fetchEntity: jest.fn().mockResolvedValue(entity),
            });
            const data = buildRebaseData(driver);

            const result = await data.products.findById("abc");
            expect(result).toEqual(entity);
            expect(driver.fetchEntity).toHaveBeenCalledWith({ path: "products", entityId: "abc" });
        });
    });

    // ── create ──────────────────────────────────────────────
    describe("CollectionAccessor.create", () => {
        it("delegates to driver.saveEntity with status new", async () => {
            const driver = createMockDriver();
            const data = buildRebaseData(driver);

            await data.products.create({ name: "Camera", price: 299 });

            expect(driver.saveEntity).toHaveBeenCalledWith(
                expect.objectContaining({
                    path: "products",
                    values: { name: "Camera", price: 299 },
                    status: "new",
                })
            );
        });

        it("passes optional id", async () => {
            const driver = createMockDriver();
            const data = buildRebaseData(driver);

            await data.products.create({ name: "Camera" }, "custom-id");

            expect(driver.saveEntity).toHaveBeenCalledWith(
                expect.objectContaining({
                    entityId: "custom-id",
                    status: "new",
                })
            );
        });
    });

    // ── update ──────────────────────────────────────────────
    describe("CollectionAccessor.update", () => {
        it("delegates to driver.saveEntity with status existing", async () => {
            const driver = createMockDriver();
            const data = buildRebaseData(driver);

            await data.products.update("prod-1", { price: 399 });

            expect(driver.saveEntity).toHaveBeenCalledWith(
                expect.objectContaining({
                    path: "products",
                    entityId: "prod-1",
                    values: { price: 399 },
                    status: "existing",
                })
            );
        });
    });

    // ── delete ──────────────────────────────────────────────
    describe("CollectionAccessor.delete", () => {
        it("delegates to driver.deleteEntity", async () => {
            const driver = createMockDriver();
            const data = buildRebaseData(driver);

            await data.products.delete("prod-1");

            expect(driver.deleteEntity).toHaveBeenCalledWith(
                expect.objectContaining({
                    entity: expect.objectContaining({ id: "prod-1", path: "products" }),
                })
            );
        });
    });

    // ── count ───────────────────────────────────────────────
    describe("CollectionAccessor.count", () => {
        it("delegates to driver.countEntities when available", async () => {
            const driver = createMockDriver();
            const data = buildRebaseData(driver);

            expect(data.products.count).toBeDefined();
            const result = await data.products.count!();
            expect(driver.countEntities).toHaveBeenCalled();
        });

        it("is undefined when driver has no countEntities", () => {
            const driver = createMockDriver({ countEntities: undefined });
            const data = buildRebaseData(driver);
            expect(data.products.count).toBeUndefined();
        });
    });
});
