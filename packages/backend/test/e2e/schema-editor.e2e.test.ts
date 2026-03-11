import request from "supertest";
import express from "express";
import { defaultRestApiGenerator } from "../../src/api/api-generator";
import { configureJwt, generateAccessToken } from "../../src/auth/jwt";
import { requireAuth, requireAdmin } from "../../src/auth/middleware";
import { createSchemaEditorRoutes } from "../../src/api/schema-editor-routes";
import { AstSchemaEditor } from "../../src/api/ast-schema-editor";

// We don't need jest.mock since we will use jest.spyOn on the instance

describe("Schema Editor E2E Tests", () => {
    let app: express.Express;
    const testSecret = "schema-editor-e2e-secret-key-123";

    beforeAll(() => {
        configureJwt({
            secret: testSecret,
            accessExpiresIn: "1h",
            refreshExpiresIn: "30d"
        });

        // Setup mock implementations for the editor on the prototype
        jest.spyOn(AstSchemaEditor.prototype, 'saveProperty').mockResolvedValue(undefined);
        jest.spyOn(AstSchemaEditor.prototype, 'deleteProperty').mockResolvedValue(undefined);
        jest.spyOn(AstSchemaEditor.prototype, 'saveCollection').mockResolvedValue(undefined);
        jest.spyOn(AstSchemaEditor.prototype, 'deleteCollection').mockResolvedValue(undefined);

        app = express();
        app.use(express.json());

        // Apply exactly the same middleware stack as in server.ts
        const schemaEditorRoutes = createSchemaEditorRoutes("mock/path");
        app.use("/schema-editor", requireAuth, requireAdmin, schemaEditorRoutes);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Authentication & Authorization Enforcement", () => {
        const endpoints = [
            { method: "POST", path: "/schema-editor/property/save", body: { collectionId: "test-col", propertyKey: "newProp", propertyConfig: { dataType: "string" } } },
            { method: "POST", path: "/schema-editor/property/delete", body: { collectionId: "test-col", propertyKey: "deleteProp" } },
            { method: "POST", path: "/schema-editor/collection/save", body: { collectionId: "new-col", collectionData: { name: "New Col" } } },
            { method: "POST", path: "/schema-editor/collection/delete", body: { collectionId: "test-col" } }
        ];

        endpoints.forEach(({ method, path, body }) => {
            describe(`${method} ${path}`, () => {
                it("should return 401 Unauthorized when no token is provided", async () => {
                    const req = method === "GET" ? request(app).get(path) : 
                                method === "POST" ? request(app).post(path).send(body) : 
                                request(app).delete(path).send(body);
                                
                    const response = await req;
                    expect(response.status).toBe(401);
                    expect(response.body.error.code).toBe("UNAUTHORIZED");
                });

                it("should return 401 Unauthorized with completely invalid token", async () => {
                    const req = method === "GET" ? request(app).get(path) : 
                                method === "POST" ? request(app).post(path).send(body) : 
                                request(app).delete(path).send(body);
                                
                    const response = await req.set("Authorization", "Bearer invalid.token.here");
                    expect(response.status).toBe(401);
                });

                it("should return 403 Forbidden for authenticated users without admin roles", async () => {
                    const token = generateAccessToken("user-normal", ["editor", "viewer"]);
                    
                    const req = method === "GET" ? request(app).get(path) : 
                                method === "POST" ? request(app).post(path).send(body) : 
                                request(app).delete(path).send(body);
                                
                    const response = await req.set("Authorization", `Bearer ${token}`);
                    
                    expect(response.status).toBe(403);
                    expect(response.body.error.code).toBe("FORBIDDEN");
                });

                it("should return 200 OK for authenticated users WITH admin role", async () => {
                    const token = generateAccessToken("user-admin", ["admin"]);
                    
                    const req = method === "GET" ? request(app).get(path) : 
                                method === "POST" ? request(app).post(path).send(body) : 
                                request(app).delete(path).send(body);
                                
                    const response = await req.set("Authorization", `Bearer ${token}`);
                    
                    expect(response.status).toBe(200);
                });

                it("should return 200 OK for authenticated users WITH schema-admin role", async () => {
                    const token = generateAccessToken("user-schema-admin", ["schema-admin"]);
                    
                    const req = method === "GET" ? request(app).get(path) : 
                                method === "POST" ? request(app).post(path).send(body) : 
                                request(app).delete(path).send(body);
                                
                    const response = await req.set("Authorization", `Bearer ${token}`);
                    
                    // We only care that it's authorised (200), we mocked the actual implementation
                    expect(response.status).toBe(200);
                });
            });
        });
    });
});
