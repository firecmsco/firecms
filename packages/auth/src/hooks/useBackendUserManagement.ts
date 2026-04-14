import { useCallback, useEffect, useState } from "react";
import { Role, User } from "@rebasepro/types";

/**
 * UserManagement interface - compatible with @rebasepro/user_management
 * Defined inline to avoid dependency on that package
 */
export interface UserManagement<USER extends User = User> {
    loading: boolean;

    users: USER[];
    saveUser: (user: USER) => Promise<USER>;
    createUser?: (user: USER) => Promise<{
        user: USER;
        invitationSent: boolean;
        temporaryPassword?: string;
    }>;
    resetPassword?: (user: USER) => Promise<{
        user: USER;
        invitationSent: boolean;
        temporaryPassword?: string;
    }>;
    deleteUser: (user: USER) => Promise<void>;

    roles: Role[];
    saveRole: (role: Role) => Promise<void>;
    deleteRole: (role: Role) => Promise<void>;

    isAdmin?: boolean;
    allowDefaultRolesCreation?: boolean;
    includeCollectionConfigPermissions?: boolean;
    defineRolesFor: (user: User) => Promise<Role[] | undefined> | Role[] | undefined;
    getUser: (uid: string) => User | null;

    /**
     * Search users with server-side pagination.
     * When provided, the CMS will use this for the users table
     * instead of loading all users into memory.
     */
    searchUsers?: (options: {
        search?: string;
        limit?: number;
        offset?: number;
        orderBy?: string;
        orderDir?: "asc" | "desc";
    }) => Promise<{ users: USER[]; total: number }>;

    usersError?: Error;
    rolesError?: Error;
    bootstrapAdmin?: () => Promise<void>;
}

export interface BackendUserManagementConfig {
    /**
     * The Rebase Client instance
     */
    client?: any;

    /**
     * Base API URL for the backend (optional, extracted from client if not provided)
     */
    apiUrl?: string;

    /**
     * Function to get the current auth token (optional, extracted from client if not provided)
     */
    getAuthToken?: () => Promise<string>;

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
    config?: Record<string, any>;
}

/**
 * Convert API user to Rebase User
 * @param apiUser - The API user object
 * @param availableRoles - Optional array of available roles to look up names
 */
function convertUser(apiUser: ApiUser): User {
    return {
        uid: apiUser.uid,
        email: apiUser.email,
        displayName: apiUser.displayName || null,
        photoURL: apiUser.photoURL || null,
        providerId: "custom",
        isAnonymous: false,
        roles: apiUser.roles,
        createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : null
    } as User;
}

/**
 * Convert API role to Rebase Role
 */
function convertRole(apiRole: ApiRole): Role {
    return {
        id: apiRole.id,
        name: apiRole.name,
        isAdmin: apiRole.isAdmin ?? false,
        config: apiRole.config ?? undefined
    };
}

/**
 * Hook to manage users and roles via backend API
 * Compatible with Rebase UserManagement interface
 */
export function useBackendUserManagement(config: BackendUserManagementConfig): UserManagement {
    const { client, apiUrl, getAuthToken, currentUser } = config;

    // We no longer load ALL users into memory.
    // `users` now only holds admin/role-bearing users for getUser/defineRolesFor lookups.
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
        body?: Record<string, unknown>,
        retryCount: number = 6,
        signal?: AbortSignal
    ): Promise<any> => {
        let lastError: Error | null = null;
        for (let attempt = 0; attempt < retryCount; attempt++) {
            if (signal?.aborted) {
                const error = new Error("Request aborted");
                error.name = "AbortError";
                throw error;
            }

            try {
                // Determine token provider
                const token = getAuthToken ? await getAuthToken() : (client ? await client.resolveToken() : null);
                const baseUrl = apiUrl || (client?.baseUrl ? client.baseUrl : "");
                
                // Use /api/admin prefix for admin endpoints
                const response = await fetch(`${baseUrl}/api/admin${endpoint}`, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { "Authorization": `Bearer ${token}` } : {})
                    },
                    body: body ? JSON.stringify(body) : undefined,
                    signal
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = "API request failed";
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error?.message || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || `HTTP error ${response.status}`;
                    }

                    const error = Object.assign(new Error(errorMessage), { status: response.status });
                    throw error;
                }

                return await response.json();
            } catch (error: unknown) {
                if (error instanceof Error && error.name === "AbortError" || signal?.aborted) {
                    throw error;
                }

                lastError = error instanceof Error ? error : new Error(String(error));

                // Retry conditions: Network errors (TypeError) OR 5xx Server Errors (Backend rebooting)
                const isNetworkError = error instanceof TypeError;
                const isServerError = typeof (error as { status?: number }).status === "number" && (error as { status: number }).status >= 500 && (error as { status: number }).status < 600;

                if (attempt < retryCount - 1 && (isNetworkError || isServerError)) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // 1s, 2s, 4s...
                    console.warn(`Admin API request to ${endpoint} failed, retrying in ${delay}ms...`);
                    
                    // Wait for delay or abort
                    await new Promise<void>((resolve, reject) => {
                        if (signal?.aborted) return reject(new Error("AbortError"));
                        const timer = setTimeout(resolve, delay);
                        if (signal) {
                            signal.addEventListener("abort", () => {
                                clearTimeout(timer);
                                reject(new Error("AbortError"));
                            }, { once: true });
                        }
                    }).catch(() => {}); // Catch AbortError from wait
                    
                    if (signal?.aborted) {
                        const abortError = new Error("Request aborted");
                        abortError.name = "AbortError";
                        throw abortError;
                    }
                    continue;
                }

                console.error("Admin API error after retries:", error);
                throw error;
            }
        }
        throw lastError;
    }, [apiUrl, getAuthToken]);

    /**
     * Load roles from API
     */
    const loadRoles = useCallback(async (signal?: AbortSignal) => {
        try {
            const data = await apiRequest("/roles", "GET", undefined, 6, signal);
            setRoles(data.roles.map(convertRole));
            setRolesError(undefined);
        } catch (error: unknown) {
            if (error instanceof Error && error.name === "AbortError") return;
            console.error("Failed to load roles:", error);
            setRolesError(error instanceof Error ? error : new Error(String(error)));
        }
    }, [apiRequest]);

    /**
     * Load admin users (users that have roles) for getUser/defineRolesFor lookups.
     * This is intentionally a small subset — not all app users.
     */
    const loadAdminUsers = useCallback(async (signal?: AbortSignal) => {
        try {
            // Load all users — for now this is the same endpoint.
            // In future, a dedicated endpoint could filter by "has roles" on the server.
            const data = await apiRequest("/users", "GET", undefined, 6, signal);
            const allUsers: User[] = data.users.map((u: ApiUser) => convertUser(u));
            // Only keep users that have at least one role assigned
            const adminUsers = allUsers.filter(u => u.roles && u.roles.length > 0);
            setUsers(adminUsers);
            setUsersError(undefined);
        } catch (error: unknown) {
            if (error instanceof Error && error.name === "AbortError") return;
            console.error("Failed to load admin users:", error);
            setUsersError(error instanceof Error ? error : new Error(String(error)));
        }
    }, [apiRequest]);

    /**
     * Initial data load - only when user is logged in
     * Load roles first, then admin users
     */
    useEffect(() => {
        // Don't load if no user is logged in
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const abortController = new AbortController();

        const load = async () => {
            setLoading(true);
            // Load roles first
            try {
                const data = await apiRequest("/roles", "GET", undefined, 6, abortController.signal);
                setRoles(data.roles.map(convertRole));
                setRolesError(undefined);
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== "AbortError") {
                    console.error("Failed to load roles:", error);
                    setRolesError(error);
                }
            }
            // Then load admin users if not aborted
            if (!abortController.signal.aborted) {
                await loadAdminUsers(abortController.signal);
            }
            
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        };
        load();
        
        return () => {
            abortController.abort();
        };
    }, [currentUser, apiRequest, loadAdminUsers]);

    /**
     * Search users with server-side pagination.
     * This is the primary method used by the UsersView table.
     */
    const searchUsers = useCallback(async (options: {
        search?: string;
        limit?: number;
        offset?: number;
        orderBy?: string;
        orderDir?: "asc" | "desc";
    }): Promise<{ users: User[]; total: number }> => {
        const params = new URLSearchParams();
        if (options.limit !== undefined) params.set("limit", String(options.limit));
        if (options.offset !== undefined) params.set("offset", String(options.offset));
        if (options.search) params.set("search", options.search);
        if (options.orderBy) params.set("orderBy", options.orderBy);
        if (options.orderDir) params.set("orderDir", options.orderDir);
        const qs = params.toString();

        const data = await apiRequest("/users" + (qs ? "?" + qs : ""), "GET");
        return {
            users: data.users.map((u: ApiUser) => convertUser(u)),
            total: data.total
        };
    }, [apiRequest]);

    /**
     * Save user (create or update)
     */
    const saveUser = useCallback(async (user: User): Promise<User> => {
        const roleIds = user.roles ?? [];

        // Check if user exists
        const existingUser = users.find(u => u.uid === user.uid);

        if (existingUser) {
            // Update
            const data = await apiRequest(`/users/${user.uid}`, "PUT", {
                email: user.email,
                displayName: user.displayName,
                roles: roleIds
            });
            const updated = convertUser(data.user);
            setUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
            return updated;
        } else {
            // Create
            const data = await apiRequest("/users", "POST", {
                email: user.email,
                displayName: user.displayName,
                roles: roleIds
            });
            const created = convertUser(data.user);
            setUsers(prev => [...prev, created]);
            return created;
        }
    }, [apiRequest, users, roles]);

    /**
     * Create a new user with invitation/password generation support.
     * Returns additional info about how credentials were delivered.
     */
    const createUser = useCallback(async (user: User): Promise<{
        user: User;
        invitationSent: boolean;
        temporaryPassword?: string;
    }> => {
        const roleIds = user.roles ?? [];

        const data = await apiRequest("/users", "POST", {
            email: user.email,
            displayName: user.displayName,
            roles: roleIds
        });
        const created = convertUser(data.user);
        // Add to admin users cache if they have roles
        if (created.roles && created.roles.length > 0) {
            setUsers(prev => [...prev, created]);
        }
        return {
            user: created,
            invitationSent: data.invitationSent ?? false,
            temporaryPassword: data.temporaryPassword
        };
    }, [apiRequest, roles]);

    /**
     * Reset the password for an existing user
     */
    const resetPassword = useCallback(async (user: User): Promise<{
        user: User;
        invitationSent: boolean;
        temporaryPassword?: string;
    }> => {
        const data = await apiRequest(`/users/${user.uid}/reset-password`, "POST");
        const updatedUser = convertUser(data.user);
        setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
        return {
            user: updatedUser,
            invitationSent: data.invitationSent ?? false,
            temporaryPassword: data.temporaryPassword
        };
    }, [apiRequest]);

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

        // Return roles from our cached role data (string IDs → full Role objects)
        const userRoleIds = existingUser.roles ?? [];
        return roles.filter(r => userRoleIds.includes(r.id));
    }, [users, roles]);

    /**
     * Check if current user is admin
     */
    const isAdmin = currentUser?.roles?.includes("admin") ?? false;



    /**
     * Bootstrap default admin
     */
    const bootstrapAdmin = useCallback(async (): Promise<void> => {
        try {
            await apiRequest("/bootstrap", "POST");
            // Reload users and roles after successful bootstrap
            const data = await apiRequest("/roles");
            const loadedRoles = data.roles.map(convertRole);
            setRoles(loadedRoles);
            await loadAdminUsers();
        } catch (error) {
            console.error("Failed to bootstrap admin:", error);
            throw error;
        }
    }, [apiRequest, loadAdminUsers]);

    return {
        loading,
        users,
        saveUser,
        createUser,
        resetPassword,
        deleteUser,
        roles,
        saveRole,
        deleteRole,
        isAdmin,
        allowDefaultRolesCreation: true,
        includeCollectionConfigPermissions: true,
        defineRolesFor,
        getUser,
        searchUsers,
        usersError,
        rolesError,
        bootstrapAdmin
    };
}
