import { Transport } from "./transport";

export interface AdminUser {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    provider: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

export interface RebaseRole {
    id: string;
    name: string;
    isAdmin: boolean;
    defaultPermissions: Record<string, any> | null;
    config: Record<string, any> | null;
}

export interface CreateAdminOptions {
    adminPath?: string;
}

export function createAdmin(transport: Transport, options?: CreateAdminOptions) {
    const opts = options || {};
    const adminPath = opts.adminPath || "/admin";

    async function listUsers() {
        return transport.request<{ users: AdminUser[] }>(adminPath + "/users", { method: "GET" });
    }

    async function listUsersPaginated(options?: { search?: string; limit?: number; offset?: number; orderBy?: string; orderDir?: "asc" | "desc" }) {
        const params = new URLSearchParams();
        if (options?.limit !== undefined) params.set("limit", String(options.limit));
        if (options?.offset !== undefined) params.set("offset", String(options.offset));
        if (options?.search) params.set("search", options.search);
        if (options?.orderBy) params.set("orderBy", options.orderBy);
        if (options?.orderDir) params.set("orderDir", options.orderDir);
        const qs = params.toString();
        return transport.request<{ users: AdminUser[]; total: number; limit: number; offset: number }>(
            adminPath + "/users" + (qs ? "?" + qs : ""), { method: "GET" }
        );
    }

    async function getUser(userId: string) {
        return transport.request<{ user: AdminUser }>(adminPath + "/users/" + encodeURIComponent(userId), { method: "GET" });
    }

    async function createUser(data: { email: string, displayName?: string, password?: string, roles?: string[] }) {
        return transport.request<{ user: AdminUser }>(adminPath + "/users", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async function updateUser(userId: string, data: { email?: string, displayName?: string, password?: string, roles?: string[] }) {
        return transport.request<{ user: AdminUser }>(adminPath + "/users/" + encodeURIComponent(userId), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async function deleteUser(userId: string) {
        return transport.request<{ success: boolean }>(adminPath + "/users/" + encodeURIComponent(userId), {
            method: "DELETE",
        });
    }

    async function listRoles() {
        return transport.request<{ roles: RebaseRole[] }>(adminPath + "/roles", { method: "GET" });
    }

    async function getRole(roleId: string) {
        return transport.request<{ role: RebaseRole }>(adminPath + "/roles/" + encodeURIComponent(roleId), { method: "GET" });
    }

    async function createRole(data: { id: string, name: string, isAdmin?: boolean, defaultPermissions?: any, config?: any }) {
        return transport.request<{ role: RebaseRole }>(adminPath + "/roles", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async function updateRole(roleId: string, data: { name?: string, isAdmin?: boolean, defaultPermissions?: any, config?: any }) {
        return transport.request<{ role: RebaseRole }>(adminPath + "/roles/" + encodeURIComponent(roleId), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async function deleteRole(roleId: string) {
        return transport.request<{ success: boolean }>(adminPath + "/roles/" + encodeURIComponent(roleId), {
            method: "DELETE",
        });
    }

    async function bootstrap() {
        return transport.request<{ success: boolean; message: string; user: { uid: string; roles: string[] } }>(adminPath + "/bootstrap", {
            method: "POST",
        });
    }

    return {
        listUsers,
        listUsersPaginated,
        getUser,
        createUser,
        updateUser,
        deleteUser,
        listRoles,
        getRole,
        createRole,
        updateRole,
        deleteRole,
        bootstrap,
    };
}
