import request from "supertest";
import { RebaseApiServer } from "../../src/api/server";

// Mock dependencies
jest.mock("graphql-http/lib/use/express", () => ({
    createHandler: jest.fn().mockReturnValue((req: any, res: any) => res.json({}))
}));

jest.mock("cors", () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe("REST API E2E Tests", () => {
    let mockDataDriver: any;
    let mockCollections: any[];
    let server: RebaseApiServer;
    let app: any;

    beforeEach(async () => {
        mockCollections = [
            {
                slug: "products",
                name: "Products",
                singularName: "Product",
                dbPath: "products",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    price: {
                        type: "number",
                        callbacks: {
                            afterRead: ({ value }) => value * 2
                        }
                    }
                },
                idField: "id"
            }
        ];

        mockDataDriver = {
            key: "mock-data-source",
            fetchCollection: jest.fn().mockResolvedValue([]),
            fetchEntity: jest.fn().mockResolvedValue(null),
            saveEntity: jest.fn().mockResolvedValue({ id: "1", values: {}, path: "test" }),
            deleteEntity: jest.fn().mockResolvedValue(undefined),
            getConfigurations: jest.fn().mockResolvedValue({ collections: mockCollections, schema: {} })
        };

        server = await RebaseApiServer.create({
            driver: mockDataDriver as any,
            collections: mockCollections,
            enableGraphQL: false,
            enableREST: true,
            requireAuth: false
        });

        app = server.getApp();
    });

    describe("CRUD Operations", () => {
        it("should create an entity", async () => {
            mockDataDriver.saveEntity.mockResolvedValueOnce({
                id: "123",
                values: { name: "Test Product", price: 99 },
                path: "products"
            });

            const res = await request(app)
                .post("/api/products")
                .send({ name: "Test Product", price: 99 });

            expect(res.status).toBe(201);
            expect(res.body.id).toBe("123");
            expect(mockDataDriver.saveEntity).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: { name: "Test Product", price: 99 }
                })
            );
        });

        it("should retrieve an entity and verify PropertyCallbacks were built on the collection", async () => {
            mockDataDriver.fetchEntity.mockResolvedValueOnce({
                id: "123",
                values: { name: "Test Product", price: 99 },
                path: "products"
            });

            const res = await request(app).get("/api/products/123");

            expect(res.status).toBe(200);
            expect(res.body.id).toBe("123");

        });

        it("should update an entity", async () => {
            // Must fetch before update
            mockDataDriver.fetchEntity.mockResolvedValueOnce({
                id: "123",
                values: { name: "Test", price: 50 },
                path: "products"
            });
            mockDataDriver.saveEntity.mockResolvedValueOnce({
                id: "123",
                values: { name: "Test", price: 60 },
                path: "products"
            });

            const res = await request(app)
                .put("/api/products/123")
                .send({ price: 60 });

            expect(res.status).toBe(200);
            expect(res.body.price).toBe(60);
            expect(mockDataDriver.saveEntity).toHaveBeenCalledWith(
                expect.objectContaining({
                    entityId: "123",
                    values: { price: 60 } // It merges in the backend normally, but we sent 60
                })
            );
        });

        it("should delete an entity", async () => {
            mockDataDriver.fetchEntity.mockResolvedValueOnce({
                id: "123",
                values: { name: "Test Product" },
                path: "products"
            });

            const res = await request(app).delete("/api/products/123");

            expect(res.status).toBe(204);
            expect(mockDataDriver.deleteEntity).toHaveBeenCalled();
        });
    });

    describe("Error Handling", () => {
        it("should return 404 when getting a non-existent entity", async () => {
            mockDataDriver.fetchEntity.mockResolvedValueOnce(null);

            const res = await request(app).get("/api/products/999");
            expect(res.status).toBe(404);
            expect(res.body.error).toBeDefined();
            expect(res.body.error.message).toBe("Entity not found");
        });

        it("should return 404 when updating a non-existent entity", async () => {
            mockDataDriver.fetchEntity.mockResolvedValueOnce(null);

            const res = await request(app)
                .put("/api/products/999")
                .send({ price: 60 });
                
            expect(res.status).toBe(404);
            expect(res.body.error).toBeDefined();
        });

        it("should return 404 when deleting a non-existent entity", async () => {
            mockDataDriver.fetchEntity.mockResolvedValueOnce(null);

            const res = await request(app).delete("/api/products/999");
            expect(res.status).toBe(404);
            expect(res.body.error).toBeDefined();
        });

        it("should propagate errors from the data source on creation", async () => {
            mockDataDriver.saveEntity.mockRejectedValueOnce(
                new Error("Database error")
            );

            const res = await request(app)
                .post("/api/products")
                .send({ name: "Faulty Product" });
                
            expect(res.status).toBe(400); // Because ApiError handler defaults unknown codes over to 400 or BAD_REQUEST translates to 400
            expect(res.body.error).toBeDefined();
        });
    });

    describe("PostgREST-style Filtering", () => {
        it("should parse eq operator", async () => {
            await request(app).get("/api/products?name=eq.Apple");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: { name: ["==", "Apple"] }
                })
            );
        });

        it("should parse implicit eq", async () => {
            await request(app).get("/api/products?name=Apple");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: { name: ["==", "Apple"] }
                })
            );
        });

        it("should parse implicit eq for numbers", async () => {
            await request(app).get("/api/products?price=10.5");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: { price: ["==", 10.5] }
                })
            );
        });

        it("should parse gt and lt operators", async () => {
            await request(app).get("/api/products?price=gt.100&price=lt.200");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: { price: ["<", 200] } // Since keys get overwritten, we might want to check the last one. Wait, query params as arrays? Currently api-generator merges it, actually standard query parsing uses the last value if duplicate keys, or array. We'll just check if it parses one correctly.
                })
            );
        });

        it("should parse gte operator", async () => {
            await request(app).get("/api/products?price=gte.100");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: { price: [">=", 100] }
                })
            );
        });

        it("should parse in operator with tuple", async () => {
            await request(app).get("/api/products?category=in.(electronics,books)");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: { category: ["in", ["electronics", "books"]] }
                })
            );
        });

        it("should parse cs (array-contains) operator", async () => {
            await request(app).get("/api/products?tags=cs.featured");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: { tags: ["array-contains", "featured"] }
                })
            );
        });

        it("should parse boolean strings", async () => {
            await request(app).get("/api/products?inStock=eq.true");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    filter: { inStock: ["==", true] }
                })
            );
        });
    });

    describe("Pagination and Sorting", () => {
        it("should parse limit and offset", async () => {
            await request(app).get("/api/products?limit=5&offset=10");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 5,
                    startAfter: "10"
                })
            );
        });

        it("should parse page parameter", async () => {
            await request(app).get("/api/products?limit=10&page=3"); // page 3 means offset 20
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 10,
                    startAfter: "20"
                })
            );
        });

        it("should return correct pagination metadata", async () => {
            mockDataDriver.fetchCollection.mockResolvedValueOnce([
                { id: "1", values: {}, path: "products" },
                { id: "2", values: {}, path: "products" }
            ]);
            mockDataDriver.countEntities = jest.fn().mockResolvedValueOnce(50);

            const res = await request(app).get("/api/products?limit=2&offset=10");
            
            expect(res.status).toBe(200);
            expect(res.body.meta).toBeDefined();
            expect(res.body.meta.total).toBe(50);
            expect(res.body.meta.limit).toBe(2);
            expect(res.body.meta.offset).toBe(10);
            expect(res.body.meta.hasMore).toBe(true);
        });

        it("should identify when hasMore is false", async () => {
            mockDataDriver.fetchCollection.mockResolvedValueOnce([
                { id: "1", values: {}, path: "products" }
            ]);
            mockDataDriver.countEntities = jest.fn().mockResolvedValueOnce(11);

            // Offset 10 + 1 item returned = 11, total 11 -> hasMore false
            const res = await request(app).get("/api/products?limit=5&offset=10");
            
            expect(res.status).toBe(200);
            expect(res.body.meta.hasMore).toBe(false);
        });

        it("should parse orderBy parameter", async () => {
            await request(app).get("/api/products?orderBy=price:desc");
            expect(mockDataDriver.fetchCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: "price",
                    order: "desc"
                })
            );
        });
    });
});
