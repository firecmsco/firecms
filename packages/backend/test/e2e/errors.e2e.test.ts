import request from "supertest";
import { FireCMSApiServer } from "../../src/api/server";

// Mock dependencies
jest.mock("graphql-http/lib/use/express", () => ({
    createHandler: jest.fn().mockReturnValue((req: any, res: any) => res.json({}))
}));

jest.mock("cors", () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe("Global Error Handling E2E", () => {
    let mockDataSource: any;
    let mockCollections: any[];
    let server: FireCMSApiServer;
    let app: any;

    beforeEach(() => {
        mockCollections = [
            {
                slug: "faulty",
                name: "Faulty Collection",
                singularName: "Fault",
                dbPath: "faulty",
                properties: {
                    id: { type: "string" },
                },
                idField: "id"
            }
        ];

        mockDataSource = {
            key: "mock-data-source",
            fetchCollection: jest.fn().mockImplementation(() => {
                throw new Error("Unexpected database explosion");
            }),
            fetchEntity: jest.fn().mockImplementation(() => {
                const err: any = new Error("Entity not found");
                err.statusCode = 404;
                throw err;
            }),
            saveEntity: jest.fn().mockImplementation(() => {
                const err: any = new Error("Validation failed");
                err.code = "VALIDATION_ERROR";
                throw err;
            }),
            deleteEntity: jest.fn().mockResolvedValue(undefined),
            getConfigurations: jest.fn().mockResolvedValue({ collections: mockCollections, schema: {} })
        };

        server = new FireCMSApiServer({
            dataSource: mockDataSource as any,
            collections: mockCollections,
            enableGraphQL: false,
            enableREST: true
        });

        app = server.getApp();
    });

    it("should catch unexpected database errors and return 500 JSON", async () => {
        // Suppress console.error for clean test output
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

        const res = await request(app).get("/api/faulty");

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            error: {
                message: "Unexpected database explosion",
                code: "INTERNAL_ERROR"
            }
        });

        consoleSpy.mockRestore();
    });

    it("should respect statusCode property on errors (e.g., 404 NOT FOUND)", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

        const res = await request(app).get("/api/faulty/123");

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            error: {
                message: "Entity not found",
                code: "INTERNAL_ERROR" // Code isn't set, so it defaults
            }
        });

        consoleSpy.mockRestore();
    });

    it("should pass custom error codes to response", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

        const res = await request(app)
            .post("/api/faulty")
            .send({});

        expect(res.status).toBe(500); // Because we didn't set statusCode on the error, fallback 500
        expect(res.body).toEqual({
            error: {
                message: "Validation failed",
                code: "VALIDATION_ERROR"
            }
        });

        consoleSpy.mockRestore();
    });
});
