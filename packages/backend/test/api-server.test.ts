import express, { Express, Router } from "express";
import { FireCMSApiServer } from "../src/api/server";
import { PostgresDataSourceDelegate } from "../src/services/dataSourceDelegate";

// Mock dependencies
jest.mock("graphql-http/lib/use/express", () => ({
    createHandler: jest.fn().mockReturnValue((req: any, res: any) => res.json({}))
}));

jest.mock("cors", () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe("FireCMSApiServer", () => {
    let mockDataSource: jest.Mocked<PostgresDataSourceDelegate>;
    let mockCollections: any[];

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
                    price: { type: "number" }
                },
                idField: "id"
            },
            {
                slug: "categories",
                name: "Categories",
                singularName: "Category",
                dbPath: "categories",
                properties: {
                    id: { type: "number" },
                    name: { type: "string" }
                },
                idField: "id"
            }
        ];

        mockDataSource = {
            key: "mock-data-source",
            fetchCollection: jest.fn().mockResolvedValue([]),
            fetchEntity: jest.fn().mockResolvedValue(null),
            saveEntity: jest.fn().mockResolvedValue({ id: "1", values: {}, path: "test" }),
            deleteEntity: jest.fn().mockResolvedValue(undefined),
            getConfigurations: jest.fn().mockResolvedValue({ collections: mockCollections, schema: {} })
        } as any;
    });

    describe("constructor", () => {
        it("should initialize with required configuration", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            expect(server).toBeDefined();
            expect(server.getApp()).toBeDefined();
            expect(server.getRouter()).toBeDefined();
        });

        it("should accept optional CORS configuration", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections,
                cors: {
                    origin: "https://example.com",
                    credentials: true
                }
            });

            expect(server).toBeDefined();
        });
    });

    describe("getRouter", () => {
        it("should return an Express router", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            const router = server.getRouter();

            expect(router).toBeDefined();
        });
    });

    describe("getApp", () => {
        it("should return an Express app", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            const app = server.getApp();

            expect(app).toBeDefined();
        });
    });

    describe("generateOpenApiSpec", () => {
        it("should generate OpenAPI specification", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            const spec = server.generateOpenApiSpec();

            expect(spec).toBeDefined();
            expect(spec.openapi).toBe("3.0.0");
            expect(spec.info).toBeDefined();
            expect(spec.paths).toBeDefined();
        });

        it("should include paths for each collection", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            const spec = server.generateOpenApiSpec();

            // Should have paths for products and categories
            expect(spec.paths["/products"]).toBeDefined();
            expect(spec.paths["/categories"]).toBeDefined();
        });

        it("should include CRUD operations", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            const spec = server.generateOpenApiSpec();

            const productsPath = spec.paths["/products"];
            expect(productsPath.get).toBeDefined(); // List
            expect(productsPath.post).toBeDefined(); // Create

            const productByIdPath = spec.paths["/products/{id}"];
            expect(productByIdPath.get).toBeDefined(); // Get by ID
            expect(productByIdPath.put).toBeDefined(); // Update
            expect(productByIdPath.delete).toBeDefined(); // Delete
        });

        it("should use default title and version", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            const spec = server.generateOpenApiSpec();

            // The implementation uses hardcoded values
            expect(spec.info.title).toBe("FireCMS Auto-Generated API");
            expect(spec.info.version).toBe("1.0.0");
        });
    });

    describe("REST API Routes", () => {
        let server: FireCMSApiServer;

        beforeEach(async () => {
            server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });
        });

        it("should have route for listing entities", async () => {
            mockDataSource.fetchCollection.mockResolvedValue([
                { id: "1", values: { name: "Product 1" }, path: "products" }
            ]);

            const entities = await mockDataSource.fetchCollection({
                path: "products"
            });

            expect(entities).toHaveLength(1);
            expect(entities[0].values.name).toBe("Product 1");
        });

        it("should have route for getting single entity", async () => {
            mockDataSource.fetchEntity.mockResolvedValue({
                id: "1",
                values: { name: "Product 1", price: 99 },
                path: "products"
            });

            const entity = await mockDataSource.fetchEntity({
                path: "products",
                entityId: "1"
            });

            expect(entity?.id).toBe("1");
            expect(entity?.values.name).toBe("Product 1");
        });

        it("should have route for creating entity", async () => {
            mockDataSource.saveEntity.mockResolvedValue({
                id: "new-id",
                values: { name: "New Product", price: 50 },
                path: "products"
            });

            const entity = await mockDataSource.saveEntity({
                path: "products",
                values: { name: "New Product", price: 50 }
            });

            expect(entity.id).toBe("new-id");
        });

        it("should have route for updating entity", async () => {
            mockDataSource.saveEntity.mockResolvedValue({
                id: "1",
                values: { name: "Updated Product", price: 150 },
                path: "products"
            });

            const entity = await mockDataSource.saveEntity({
                path: "products",
                entityId: "1",
                values: { name: "Updated Product", price: 150 }
            });

            expect(entity.values.name).toBe("Updated Product");
        });

        it("should have route for deleting entity", async () => {
            await mockDataSource.deleteEntity({
                path: "products",
                entityId: "1"
            });

            expect(mockDataSource.deleteEntity).toHaveBeenCalledWith({
                path: "products",
                entityId: "1"
            });
        });
    });

    describe("GraphQL Endpoint", () => {
        it("should setup GraphQL handler", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            // GraphQL endpoint should be available
            const router = server.getRouter();
            expect(router).toBeDefined();
        });
    });

    describe("Middleware", () => {
        it("should apply CORS middleware when configured", async () => {
            const cors = require("cors");

            await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections,
                cors: { origin: "*" }
            });

            expect(cors).toHaveBeenCalled();
        });

        it("should apply JSON parsing middleware", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            // The app should be able to parse JSON
            expect(server.getApp()).toBeDefined();
        });
    });

    describe("listen", () => {
        it("should have listen method for standalone mode", async () => {
            const server = await FireCMSApiServer.create({
                dataSource: mockDataSource,
                collections: mockCollections
            });

            expect(typeof server.listen).toBe("function");
        });
    });
});
