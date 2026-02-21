import request from "supertest";
import { FireCMSApiServer } from "../../src/api/server";
import { User } from "@firecms/types";

// Mock dependencies
jest.mock("graphql-http/lib/use/express", () => ({
    createHandler: jest.fn().mockImplementation(({ context }) => {
        return (req: any, res: any) => {
            const ctx = context(req);
            // Simulate a simple resolution that just accesses the dataSource to trigger spies
            return ctx.dataSource.fetchCollection({ path: "secrets" }).then(() => {
                res.json({ data: { fetch: true } });
            });
        };
    })
}));

jest.mock("cors", () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe("Auth and Context Request Scope E2E Tests", () => {
    let mockDefaultDataSource: any;
    let mockScopedDataSource: any;
    let mockCollections: any[];
    let mockWithAuth: jest.Mock;
    let server: FireCMSApiServer;
    let app: any;

    beforeEach(async () => {
        mockCollections = [
            {
                slug: "secrets",
                name: "Secrets",
                singularName: "Secret",
                dbPath: "secrets",
                properties: { id: { type: "string" } },
                idField: "id"
            }
        ];

        mockScopedDataSource = {
            fetchCollection: jest.fn().mockResolvedValue([{ id: "scoped-1" }]),
            fetchEntity: jest.fn().mockResolvedValue({ id: "scoped-1" }),
        };

        mockWithAuth = jest.fn().mockResolvedValue(mockScopedDataSource);

        mockDefaultDataSource = {
            key: "mock-data-source",
            withAuth: mockWithAuth,
            fetchCollection: jest.fn().mockResolvedValue([{ id: "default-1" }]),
            fetchEntity: jest.fn().mockResolvedValue({ id: "default-1" }),
            getConfigurations: jest.fn().mockResolvedValue({ collections: mockCollections, schema: {} })
        };
    });

    it("REST API: should route requests explicitly to the authenticated datasource if auth yields a User", async () => {
        const mockUser: User = { uid: "user-abc" };

        server = await FireCMSApiServer.create({
            dataSource: mockDefaultDataSource as any,
            collections: mockCollections,
            enableREST: true,
            auth: {
                enabled: true,
                validator: async () => mockUser
            }
        });
        app = server.getApp();

        const res = await request(app).get("/api/secrets");

        expect(res.status).toBe(200);
        expect(mockWithAuth).toHaveBeenCalledTimes(1);
        expect(mockWithAuth).toHaveBeenCalledWith(mockUser);

        expect(mockScopedDataSource.fetchCollection).toHaveBeenCalledTimes(1);
        expect(mockDefaultDataSource.fetchCollection).not.toHaveBeenCalled();
        expect(res.body.data[0].id).toBe("scoped-1");
    });

    it("REST API: should fallback to global datasource if auth is completely disabled", async () => {
        server = await FireCMSApiServer.create({
            dataSource: mockDefaultDataSource as any,
            collections: mockCollections,
            enableREST: true,
            auth: {
                enabled: false // Explicitly disabled
            }
        });
        app = server.getApp();

        const res = await request(app).get("/api/secrets");

        expect(mockWithAuth).not.toHaveBeenCalled();
        expect(mockScopedDataSource.fetchCollection).not.toHaveBeenCalled();
        expect(mockDefaultDataSource.fetchCollection).toHaveBeenCalledTimes(1);
        expect(res.body.data[0].id).toBe("default-1");
    });

    it("GraphQL API: should construct the execution context using the scoped data source", async () => {
        const mockUser: User = { uid: "graphql-user" };

        server = await FireCMSApiServer.create({
            dataSource: mockDefaultDataSource as any,
            collections: mockCollections,
            enableGraphQL: true,
            enableREST: false,
            auth: {
                enabled: true,
                validator: async () => mockUser
            }
        });
        app = server.getApp();

        // The mocked graphQL handler will forcibly access ctx.dataSource.fetchCollection() internally
        const res = await request(app)
            .post("/api/graphql")
            .send({ query: "query { secrets { id } }" });

        expect(res.status).toBe(200);
        expect(mockWithAuth).toHaveBeenCalledTimes(1);
        expect(mockWithAuth).toHaveBeenCalledWith(mockUser);
        expect(mockScopedDataSource.fetchCollection).toHaveBeenCalledTimes(1);
        expect(mockDefaultDataSource.fetchCollection).not.toHaveBeenCalled();
    });
});
