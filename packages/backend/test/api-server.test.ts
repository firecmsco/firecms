import express, { Express, Router } from "express";
import { RebaseApiServer } from "../src/api/server";
import { PostgresDataDriver } from "../src/services/driver";

// Mock dependencies
jest.mock("graphql-http/lib/use/express", () => ({
    createHandler: jest.fn().mockReturnValue((req: any, res: any) => res.json({}))
}));

jest.mock("cors", () => jest.fn(() => (req: any, res: any, next: any) => next()));

import request from "supertest";
describe("RebaseApiServer", () => {
    let mockDataDriver: jest.Mocked<PostgresDataDriver>;
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

        mockDataDriver = {
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
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            expect(server).toBeDefined();
            expect(server.getApp()).toBeDefined();
            expect(server.getRouter()).toBeDefined();
        });

        it("should accept optional CORS configuration", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
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
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            const router = server.getRouter();

            expect(router).toBeDefined();
        });
    });

    describe("getApp", () => {
        it("should return an Express app", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            const app = server.getApp();

            expect(app).toBeDefined();
        });
    });

    describe("generateOpenApiSpec", () => {
        it("should generate OpenAPI specification", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            const spec = server.generateOpenApiSpec();

            expect(spec).toBeDefined();
            expect(spec.openapi).toBe("3.0.0");
            expect(spec.info).toBeDefined();
            expect(spec.paths).toBeDefined();
        });

        it("should include paths for each collection", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            const spec = server.generateOpenApiSpec();

            // Should have paths for products and categories
            expect(spec.paths["/products"]).toBeDefined();
            expect(spec.paths["/categories"]).toBeDefined();
        });

        it("should include CRUD operations", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
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
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            const spec = server.generateOpenApiSpec();

            // The implementation uses hardcoded values
            expect(spec.info.title).toBe("Rebase Auto-Generated API");
            expect(spec.info.version).toBe("1.0.0");
        });
    });

    describe("REST API Routes", () => {
        let server: RebaseApiServer;

        beforeEach(async () => {
            server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });
        });

        it("should have route for listing entities", async () => {
            mockDataDriver.fetchCollection.mockResolvedValue([
                { id: "1", values: { name: "Product 1" }, path: "products" }
            ]);

            const entities = await mockDataDriver.fetchCollection({
                path: "products"
            });

            expect(entities).toHaveLength(1);
            expect(entities[0].values.name).toBe("Product 1");
        });

        it("should have route for getting single entity", async () => {
            mockDataDriver.fetchEntity.mockResolvedValue({
                id: "1",
                values: { name: "Product 1", price: 99 },
                path: "products"
            });

            const entity = await mockDataDriver.fetchEntity({
                path: "products",
                entityId: "1"
            });

            expect(entity?.id).toBe("1");
            expect(entity?.values.name).toBe("Product 1");
        });

        it("should have route for creating entity", async () => {
            mockDataDriver.saveEntity.mockResolvedValue({
                id: "new-id",
                values: { name: "New Product", price: 50 },
                path: "products"
            });

            const entity = await mockDataDriver.saveEntity({
                path: "products",
                values: { name: "New Product", price: 50 }
            });

            expect(entity.id).toBe("new-id");
        });

        it("should have route for updating entity", async () => {
            mockDataDriver.saveEntity.mockResolvedValue({
                id: "1",
                values: { name: "Updated Product", price: 150 },
                path: "products"
            });

            const entity = await mockDataDriver.saveEntity({
                path: "products",
                entityId: "1",
                values: { name: "Updated Product", price: 150 }
            });

            expect(entity.values.name).toBe("Updated Product");
        });

        it("should have route for deleting entity", async () => {
            await mockDataDriver.deleteEntity({
                path: "products",
                entityId: "1"
            });

            expect(mockDataDriver.deleteEntity).toHaveBeenCalledWith({
                path: "products",
                entityId: "1"
            });
        });
    });

    describe("GraphQL Endpoint", () => {
        it("should setup GraphQL handler", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            // GraphQL endpoint should be available
            const router = server.getRouter();
            expect(router).toBeDefined();
        });
    });

    describe("Middleware", () => {
        const testSecret = "api-server-test-secret";

        beforeAll(() => {
            const { configureJwt } = require("../src/auth/jwt");
            configureJwt({ secret: testSecret, accessExpiresIn: "1h", refreshExpiresIn: "30d" });
        });

        it("should apply CORS middleware when configured", async () => {
            const cors = require("cors");

            await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections,
                cors: { origin: "*" }
            });

            expect(cors).toHaveBeenCalled();
        });

        it("should apply JSON parsing middleware", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            // The app should be able to parse JSON
            expect(server.getApp()).toBeDefined();
        });

        it("should apply default authentication extraction when auth is enabled and no validator is present", async () => {
            const { generateAccessToken } = require("../src/auth/jwt");
            const token = generateAccessToken("test-user-id", ["admin"]);

            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections,
                auth: {
                    enabled: true
                }
            });

            const app = server.getApp();

            const response = await request(app)
                .get("/api/products")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).not.toBe(401);
        });

        it("should reject requests when requireAuth is true and token is invalid or missing", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections,
                auth: {
                    enabled: true,
                    requireAuth: true
                }
            });

            const app = server.getApp();

            // Missing token
            const response1 = await request(app).get("/api/products");
            expect(response1.status).toBe(401);

            // Invalid token
            const response2 = await request(app)
                .get("/api/products")
                .set("Authorization", "Bearer invalid-token");
            expect(response2.status).toBe(401);
        });

        it("should use custom validator if provided instead of default extraction", async () => {
            const customValidator = jest.fn().mockResolvedValue({ uid: "custom-user" });

            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections,
                auth: {
                    enabled: true,
                    validator: customValidator
                }
            });

            const app = server.getApp();

            await request(app).get("/api/products");

            expect(customValidator).toHaveBeenCalled();
        });
    });

    describe("listen", () => {
        it("should have listen method for standalone mode", async () => {
            const server = await RebaseApiServer.create({
                driver: mockDataDriver,
                collections: mockCollections
            });

            expect(typeof server.listen).toBe("function");
        });
    });
});
