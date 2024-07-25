import React, { useCallback, useEffect } from "react";
import equal from "react-fast-compare"

import { UserManagement } from "../types";
import { Authenticator, DataSourceDelegate, Entity, PermissionsBuilder, Role, User } from "@firecms/core";
import { resolveUserRolePermissions } from "../utils";

type UserWithRoleIds = User & { roles: string[] };

export interface UserManagementParams {

    /**
     * The delegate in charge of persisting the data.
     */
    dataSourceDelegate?: DataSourceDelegate;

    /**
     * Path where the plugin users configuration is stored.
     * Default: __FIRECMS/config/users
     * You can specify a different path if you want to store the user management configuration in a different place.
     * Please keep in mind that the FireCMS users are not necessarily the same as the Firebase users (but they can be).
     * The path should be relative to the root of the database, and should always have an odd number of segments.
     */
    usersPath?: string;

    /**
     * Path where the plugin roles configuration is stored.
     * Default: __FIRECMS/config/roles
     */
    rolesPath?: string;

    /**
     * Maximum number of users that can be created.
     */
    usersLimit?: number;

    /**
     * Can the logged user edit roles
     */
    canEditRoles?: boolean;

    /**
     * If there are no roles in the database, provide a button to create the default roles.
     */
    allowDefaultRolesCreation?: boolean;

    /**
     * Include the collection config permissions in the user management system.
     */
    includeCollectionConfigPermissions?: boolean;

}

/**
 * This hook is used to build a user management object that can be used to
 * manage users and roles in a Firestore backend.
 * @param dataSourceDelegate
 * @param usersPath
 * @param rolesPath
 * @param usersLimit
 * @param canEditRoles
 * @param allowDefaultRolesCreation
 * @param includeCollectionConfigPermissions
 */
export function useBuildUserManagement({
                                           dataSourceDelegate,
                                           usersPath = "__FIRECMS/config/users",
                                           rolesPath = "__FIRECMS/config/roles",
                                           usersLimit,
                                           canEditRoles = true,
                                           allowDefaultRolesCreation,
                                           includeCollectionConfigPermissions
                                       }: UserManagementParams): UserManagement {

    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [usersWithRoleIds, setUsersWithRoleIds] = React.useState<UserWithRoleIds[]>([]);

    const users = usersWithRoleIds.map(u => ({
        ...u,
        roles: roles.filter(r => u.roles?.includes(r.id))
    }) as User);

    const [rolesError, setRolesError] = React.useState<Error | undefined>();
    const [usersError, setUsersError] = React.useState<Error | undefined>();

    const loading = rolesLoading || usersLoading;

    useEffect(() => {
        if (!dataSourceDelegate || !rolesPath) return;
        if (dataSourceDelegate.initialised !== undefined && !dataSourceDelegate.initialised) return;

        return dataSourceDelegate.listenCollection?.({
            path: rolesPath,
            onUpdate(entities: Entity<any>[]): void {
                setRolesError(undefined);
                try {
                    const newRoles = entityToRoles(entities);
                    if (!equal(newRoles, roles))
                        setRoles(newRoles);
                } catch (e) {
                    console.error("Error loading roles", e);
                    setRolesError(e as Error);
                }
                setRolesLoading(false);
            },
            onError(e: any): void {
                console.error("Error loading roles", e);
                setRolesError(e);
                setRolesLoading(false);
            }
        });

    }, [dataSourceDelegate, rolesPath]);

    useEffect(() => {
        if (!dataSourceDelegate || !usersPath) return;
        if (dataSourceDelegate.initialised !== undefined && !dataSourceDelegate.initialised) return;

        return dataSourceDelegate.listenCollection?.({
            path: usersPath,
            onUpdate(entities: Entity<any>[]): void {
                setUsersError(undefined);
                try {
                    const newUsers = entitiesToUsers(entities);
                    if (!equal(newUsers, usersWithRoleIds))
                        setUsersWithRoleIds(newUsers);
                } catch (e) {
                    console.error("Error loading users", e);
                    setUsersError(e as Error);
                }
                setUsersLoading(false);
            },
            onError(e: any): void {
                console.error("Error loading users", e);
                setUsersError(e);
                setUsersLoading(false);
            }
        });

    }, [dataSourceDelegate, usersPath]);

    const saveUser = useCallback(async (user: User): Promise<User> => {
        if (!dataSourceDelegate) throw Error("useBuildUserManagement Firebase not initialised");
        if (!usersPath) throw Error("useBuildUserManagement Firestore not initialised");

        console.debug("Persisting user", user);

        const roleIds = user.roles?.map(r => r.id);
        const {
            uid,
            ...userData
        } = user;
        const data = {
            ...userData,
            roles: roleIds
        };
        if (uid) {
            return dataSourceDelegate.saveEntity({
                status: "existing",
                path: usersPath,
                entityId: uid,
                values: data
            }).then(() => user);
        } else {
            return dataSourceDelegate.saveEntity({
                status: "new",
                path: usersPath,
                values: data
            }).then(() => user);
        }
    }, [usersPath, dataSourceDelegate]);

    const saveRole = useCallback((role: Role): Promise<void> => {
        if (!dataSourceDelegate) throw Error("useBuildUserManagement Firebase not initialised");
        if (!rolesPath) throw Error("useBuildUserManagement Firestore not initialised");
        console.debug("Persisting role", role);
        const {
            id,
            ...roleData
        } = role;
        return dataSourceDelegate.saveEntity({
            status: "existing",
            path: rolesPath,
            entityId: id,
            values: roleData
        }).then(() => {
            return;
        });
    }, [rolesPath, dataSourceDelegate]);

    const deleteUser = useCallback(async (user: User): Promise<void> => {
        if (!dataSourceDelegate) throw Error("useBuildUserManagement Firebase not initialised");
        if (!usersPath) throw Error("useBuildUserManagement Firestore not initialised");
        console.debug("Deleting", user);
        const { uid } = user;
        const entity: Entity<any> = {
            path: usersPath,
            id: uid,
            values: {}
        };
        await dataSourceDelegate.deleteEntity({ entity })
    }, [usersPath, dataSourceDelegate]);

    const deleteRole = useCallback(async (role: Role): Promise<void> => {
        if (!dataSourceDelegate) throw Error("useBuildUserManagement Firebase not initialised");
        if (!rolesPath) throw Error("useBuildUserManagement Firestore not initialised");
        console.debug("Deleting", role);
        const { id } = role;
        const entity: Entity<any> = {
            path: usersPath,
            id: id,
            values: {}
        };
        await dataSourceDelegate.deleteEntity({ entity })
    }, [rolesPath, dataSourceDelegate]);

    const collectionPermissions: PermissionsBuilder = useCallback(({
                                                                       collection,
                                                                       user
                                                                   }) => resolveUserRolePermissions({
        collection,
        user
    }), []);

    const defineRolesFor: ((user: User) => Role[] | undefined) = useCallback((user) => {
        if (!users) throw Error("Users not loaded");
        const mgmtUser = users.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase());
        return mgmtUser?.roles;
    }, [users]);

    const authenticator: Authenticator = useCallback(({ user }) => {
        console.debug("Authenticating user", user);

        if (loading) {
            console.warn("User management is still loading");
            return false;
        }

        // This is an example of how you can link the access system to the user management plugin
        if (users.length === 0) {
            return true; // If there are no users created yet, we allow access to every user
        }

        const mgmtUser = users.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase());
        if (mgmtUser) {
            return true;
        }

        throw Error("Could not find a user with the provided email in the user management system.");
    }, [loading, users]);

    const isAdmin = roles.some(r => r.id === "admin");

    return {
        loading,
        roles,
        users,
        saveUser,
        saveRole,
        rolesError,
        deleteUser,
        deleteRole,
        usersLimit,
        usersError,
        isAdmin,
        canEditRoles: canEditRoles === undefined ? true : canEditRoles,
        allowDefaultRolesCreation: allowDefaultRolesCreation === undefined ? true : allowDefaultRolesCreation,
        includeCollectionConfigPermissions: Boolean(includeCollectionConfigPermissions),
        collectionPermissions,
        defineRolesFor,
        authenticator
    }
}

const entitiesToUsers = (docs: Entity<Omit<UserWithRoleIds, "id">>[]): (UserWithRoleIds)[] => {
    return docs.map((doc) => {
        const data = doc.values as any;
        const newVar = {
            uid: doc.id,
            ...data,
            created_on: data?.created_on,
            updated_on: data?.updated_on
        };
        return newVar as (UserWithRoleIds);
    });
}

const entityToRoles = (entities: Entity<Omit<Role, "id">>[]): Role[] => {
    return entities.map((doc) => ({
        id: doc.id,
        ...doc.values
    } as Role));
}
