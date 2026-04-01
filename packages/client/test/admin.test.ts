import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createAdmin } from "../src/admin";
import { Transport } from "../src/transport";

describe("createAdmin", () => {
    let mockRequest: jest.Mock<any>;
    let transport: Transport;

    beforeEach(() => {
        mockRequest = jest.fn() as jest.Mock<any>;
        transport = {
            request: mockRequest,
            baseUrl: "http://localhost",
            apiPath: "/api/v1",
            fetchFn: globalThis.fetch,
            setToken: jest.fn()
        } as unknown as Transport;
    });

    it("bootstrap calls POST /admin/bootstrap", async () => {
        const admin = createAdmin(transport as any);
        mockRequest.mockResolvedValueOnce({ ok: true } as any);

        const result = await admin.bootstrap();
        
        expect(result).toEqual({ ok: true });
        expect(mockRequest).toHaveBeenCalledWith("/admin/bootstrap", { method: "POST" });
    });

    describe("Users", () => {
        it("listUsers calls GET /admin/users", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ users: [] } as any);

            const result = await admin.listUsers();
            expect(result).toEqual({ users: [] });
            expect(mockRequest).toHaveBeenCalledWith("/admin/users", { method: "GET" });
        });

        it("getUser calls GET /admin/users/:id", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ user: { id: "usr_1" } } as any);

            const result = await admin.getUser("usr_1");
            expect(result).toEqual({ user: { id: "usr_1" } });
            expect(mockRequest).toHaveBeenCalledWith("/admin/users/usr_1", { method: "GET" });
        });

        it("createUser calls POST /admin/users", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ user: { id: "usr_1" } } as any);

            const data = { email: "admin@example.com", password: "123", roles: ["admin"] };
            const result = await admin.createUser(data);

            expect(result).toEqual({ user: { id: "usr_1" } });
            expect(mockRequest).toHaveBeenCalledWith("/admin/users", { method: "POST", body: JSON.stringify(data) });
        });

        it("updateUser calls PUT /admin/users/:id", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ user: { id: "usr_1", roles: [] } } as any);

            const patch = { roles: ["user"] };
            await admin.updateUser("usr_1", patch);

            expect(mockRequest).toHaveBeenCalledWith("/admin/users/usr_1", { method: "PUT", body: JSON.stringify(patch) });
        });

        it("deleteUser calls DELETE /admin/users/:id", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ ok: true } as any);

            await admin.deleteUser("usr_1");
            expect(mockRequest).toHaveBeenCalledWith("/admin/users/usr_1", { method: "DELETE" });
        });
    });

    describe("Roles", () => {
        it("listRoles calls GET /admin/roles", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ roles: [] } as any);

            const result = await admin.listRoles();
            expect(result).toEqual({ roles: [] });
            expect(mockRequest).toHaveBeenCalledWith("/admin/roles", { method: "GET" });
        });

        it("getRole calls GET /admin/roles/:id", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ role: { id: "admin" } } as any);

            await admin.getRole("admin");
            expect(mockRequest).toHaveBeenCalledWith("/admin/roles/admin", { method: "GET" });
        });

        it("createRole calls POST /admin/roles", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ role: { id: "editor" } } as any);

            const data = { id: "editor", name: "Editor", isAdmin: false };
            await admin.createRole(data);

            expect(mockRequest).toHaveBeenCalledWith("/admin/roles", { method: "POST", body: JSON.stringify(data) });
        });

        it("updateRole calls PUT /admin/roles/:id", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ role: { id: "editor" } } as any);

            const patch = { name: "Senior Editor" };
            await admin.updateRole("editor", patch);

            expect(mockRequest).toHaveBeenCalledWith("/admin/roles/editor", { method: "PUT", body: JSON.stringify(patch) });
        });

        it("deleteRole calls DELETE /admin/roles/:id", async () => {
            const admin = createAdmin(transport as any);
            mockRequest.mockResolvedValueOnce({ ok: true } as any);

            await admin.deleteRole("editor");
            expect(mockRequest).toHaveBeenCalledWith("/admin/roles/editor", { method: "DELETE" });
        });
    });
});
