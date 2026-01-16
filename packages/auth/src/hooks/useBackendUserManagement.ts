import { useCallback, useEffect, useState } from "react";
import { PermissionsBuilder, Role, User } from "@firecms/core";

/**
 * UserManagement interface - compatible with @firecms/user_management
 * Defined inline to avoid dependency on that package
 */
export interface UserManagement<USER extends User = User> {
    loading: boolean;

    users: USER[];
    saveUser: (user: USER) => Promise<USER>;
    deleteUser: (user: USER) => Promise<void>;

    roles: Role[];
    saveRole: (role: Role) => Promise<void>;
    deleteRole: (role: Role) => Promise<void>;

    isAdmin?: boolean;
    allowDefaultRolesCreation?: boolean;
    includeCollectionConfigPermissions?: boolean;
    collectionPermissions: PermissionsBuilder;
    defineRolesFor: (user: User) => Promise<Role[] | undefined> | Role[] | undefined;
    getUser: (uid: string) => User | null;

    usersError?: Error;
    rolesError?: Error;
}

export interface BackendUserManagementConfig {
    /**
     * Base API URL for the backend
     */
    apiUrl: string;

    /**
     * Function to get the current auth token
     */
    getAuthToken: () => Promise<string>;

    /**
     * Current logged-in user
     */
    currentUser?: User | null;
}

interface ApiUser {
    uid: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
    roles: string[];
    createdAt?: string;
    updatedAt?: string;
}

interface ApiRole {
    id: string;
    name: string;
    isAdmin?: boolean;
    defaultPermissions?: {
        read?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
    };
    collectionPermissions?: Record<string, {
        read?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
    }>;
    config?: Record<string, any>;
}

/**
 * Convert API user to FireCMS User
 * @param apiUser - The API user object
 * @param availableRoles - Optional array of available roles to look up names
 */
function convertUser(apiUser: ApiUser, availableRoles?: Role[]): User {
    return {
        uid: apiUser.uid,
        email: apiUser.email,
        displayName: apiUser.displayName || null,
        photoURL: apiUser.photoURL || null,
        providerId: "custom",
        isAnonymous: false,
        roles: apiUser.roles.map(id => {
            const role = availableRoles?.find(r => r.id === id);
            return { id, name: role?.name ?? id };
        })
    };
}

/**
 * Convert API role to FireCMS Role
 */
function convertRole(apiRole: ApiRole): Role {
    return {
        id: apiRole.id,
        name: apiRole.name,
        isAdmin: apiRole.isAdmin ?? false,
        defaultPermissions: apiRole.defaultPermissions ?? undefined,
        collectionPermissions: apiRole.collectionPermissions ?? undefined,
        config: apiRole.config ?? undefined
    };
}

/**
 * Hook to manage users and roles via backend API
 * Compatible with FireCMS UserManagement interface
 */
export function useBackendUserManagement(config: BackendUserManagementConfig): UserManagement {
    const { apiUrl, getAuthToken, currentUser } = config;

    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersError, setUsersError] = useState<Error | undefined>();
    const [rolesError, setRolesError] = useState<Error | undefined>();

    /**
     * Make authenticated API request
     */
    const apiRequest = useCallback(async (
        endpoint: string,
        method: string = "GET",
        body?: any
    ): Promise<any> => {
        const token = await getAuthToken();
        // Use /api/admin prefix for admin endpoints
        const response = await fetch(`${apiUrl}/api/admin${endpoint}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Admin API error:", error);
            throw new Error(error.error?.message || "API request failed");
        }

        return response.json();
    }, [apiUrl, getAuthToken]);

    /**
     * Load users from API
     * @param availableRoles - Optional roles array to resolve role names
     */
    const loadUsers = useCallback(async (availableRoles?: Role[]) => {
        try {
            const data = await apiRequest("/users");
            setUsers(data.users.map((u: ApiUser) => convertUser(u, availableRoles)));
            setUsersError(undefined);
        } catch (error) {
            console.error("Failed to load users:", error);
            setUsersError(error as Error);
        }
    }, [apiRequest]);

    /**
     * Load roles from API
     */
    const loadRoles = useCallback(async () => {
        try {
            const data = await apiRequest("/roles");
            setRoles(data.roles.map(convertRole));
            setRolesError(undefined);
        } catch (error) {
            console.error("Failed to load roles:", error);
            setRolesError(error as Error);
        }
    }, [apiRequest]);

    /**
     * Initial data load - only when user is logged in
     * Load roles first, then users (so role names can be resolved)
     */
    useEffect(() => {
        // Don't load if no user is logged in
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            // Load roles first
            let loadedRoles: Role[] = [];
            try {
                const data = await apiRequest("/roles");
                loadedRoles = data.roles.map(convertRole);
                setRoles(loadedRoles);
                setRolesError(undefined);
            } catch (error) {
                console.error("Failed to load roles:", error);
                setRolesError(error as Error);
            }
            // Then load users with roles available for name resolution
            await loadUsers(loadedRoles);
            setLoading(false);
        };
        load();
    }, [currentUser, apiRequest, loadUsers]);

    /**
     * Save user (create or update)
     */
    const saveUser = useCallback(async (user: User): Promise<User> => {
        const roleIds = user.roles?.map(r => r.id) ?? [];

        // Check if user exists
        const existingUser = users.find(u => u.uid === user.uid);

        if (existingUser) {
            // Update
            const data = await apiRequest(`/users/${user.uid}`, "PUT", {
                email: user.email,
                displayName: user.displayName,
                roles: roleIds
            });
            const updated = convertUser(data.user, roles);
            setUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
            return updated;
        } else {
            // Create
            const data = await apiRequest("/users", "POST", {
                email: user.email,
                displayName: user.displayName,
                roles: roleIds
            });
            const created = convertUser(data.user, roles);
            setUsers(prev => [...prev, created]);
            return created;
        }
    }, [apiRequest, users, roles]);

    /**
     * Delete user
     */
    const deleteUser = useCallback(async (user: User): Promise<void> => {
        await apiRequest(`/users/${user.uid}`, "DELETE");
        setUsers(prev => prev.filter(u => u.uid !== user.uid));
    }, [apiRequest]);

    /**
     * Save role (create or update)
     */
    const saveRole = useCallback(async (role: Role): Promise<void> => {
        // Check if role exists
        const existingRole = roles.find(r => r.id === role.id);

        if (existingRole) {
            // Update
            const data = await apiRequest(`/roles/${role.id}`, "PUT", {
                name: role.name,
                isAdmin: role.isAdmin,
                defaultPermissions: role.defaultPermissions,
                collectionPermissions: role.collectionPermissions,
                config: role.config
            });
            const updated = convertRole(data.role);
            setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
        } else {
            // Create
            const data = await apiRequest("/roles", "POST", {
                id: role.id,
                name: role.name,
                isAdmin: role.isAdmin ?? false,
                defaultPermissions: role.defaultPermissions,
                collectionPermissions: role.collectionPermissions,
                config: role.config
            });
            const created = convertRole(data.role);
            setRoles(prev => [...prev, created]);
        }
    }, [apiRequest, roles]);

    /**
     * Delete role
     */
    const deleteRole = useCallback(async (role: Role): Promise<void> => {
        await apiRequest(`/roles/${role.id}`, "DELETE");
        setRoles(prev => prev.filter(r => r.id !== role.id));
    }, [apiRequest]);

    /**
     * Get user by uid
     */
    const getUser = useCallback((uid: string): User | null => {
        return users.find(u => u.uid === uid) ?? null;
    }, [users]);

    /**
     * Define roles for a given user (for authController)
     */
    const defineRolesFor = useCallback(async (user: User): Promise<Role[] | undefined> => {
        // Find the user in our list
        const existingUser = users.find(u => u.uid === user.uid || u.email === user.email);
        if (!existingUser) return undefined;

        // Return roles from our cached role data
        const userRoleIds = existingUser.roles?.map(r => r.id) ?? [];
        return roles.filter(r => userRoleIds.includes(r.id));
    }, [users, roles]);

    /**
     * Check if current user is admin
     */
    const isAdmin = currentUser?.roles?.some(r => r.id === "admin") ?? false;

    /**
     * Collection permissions builder
     */
    const collectionPermissions = useCallback(({ user }: { user: User | null }) => {
        if (!user) return { read: false, create: false, edit: false, delete: false };

        const userRoles = user.roles ?? [];
        const hasAdmin = userRoles.some(r => r.id === "admin");

        if (hasAdmin) {
            return { read: true, create: true, edit: true, delete: true };
        }

        // Aggregate permissions from all user roles
        const roleObjects = roles.filter(r => userRoles.some(ur => ur.id === r.id));

        return {
            read: roleObjects.some(r => r.defaultPermissions?.read),
            create: roleObjects.some(r => r.defaultPermissions?.create),
            edit: roleObjects.some(r => r.defaultPermissions?.edit),
            delete: roleObjects.some(r => r.defaultPermissions?.delete)
        };
    }, [roles]);

    return {
        loading,
        users,
        saveUser,
        deleteUser,
        roles,
        saveRole,
        deleteRole,
        isAdmin,
        allowDefaultRolesCreation: true,
        includeCollectionConfigPermissions: true,
        collectionPermissions,
        defineRolesFor,
        getUser,
        usersError,
        rolesError
    };
}
