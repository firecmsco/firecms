import React, { useCallback, useEffect } from "react";
import equal from "react-fast-compare"

import { UserManagement } from "../types";
import {
    AuthController,
    Authenticator,
    DataSourceDelegate,
    Entity,
    PermissionsBuilder,
    removeUndefined,
    Role,
    User
} from "@firecms/core";
import { resolveUserRolePermissions } from "../utils";

type UserWithRoleIds<USER extends User = any> = Omit<USER, "roles"> & { roles: string[] };

export interface UserManagementParams<CONTROLLER extends AuthController<any> = AuthController<any>> {

    authController: CONTROLLER;

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
 * @param authController
 * @param dataSourceDelegate
 * @param usersPath
 * @param rolesPath
 * @param allowDefaultRolesCreation
 * @param includeCollectionConfigPermissions
 */
export function useBuildUserManagement<CONTROLLER extends AuthController<any> = AuthController<any>,
    USER extends User = CONTROLLER extends AuthController<infer U> ? U : any>
({
     authController,
     dataSourceDelegate,
     usersPath = "__FIRECMS/config/users",
     rolesPath = "__FIRECMS/config/roles",
     allowDefaultRolesCreation,
     includeCollectionConfigPermissions
 }: UserManagementParams<CONTROLLER>): UserManagement<USER> & CONTROLLER {

    if (!authController) {
        throw Error("useBuildUserManagement: You need to provide an authController since version 3.0.0-beta.11. Check https://firecms.co/docs/pro/migrating_from_v3_beta");
    }

    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [usersWithRoleIds, setUsersWithRoleIds] = React.useState<UserWithRoleIds<USER>[]>([]);

    const users = usersWithRoleIds.map(u => ({
        ...u,
        roles: roles.filter(r => u.roles?.includes(r.id))
    }) as USER);

    const [rolesError, setRolesError] = React.useState<Error | undefined>();
    const [usersError, setUsersError] = React.useState<Error | undefined>();

    const _usersLoading = usersLoading;
    const _rolesLoading = rolesLoading;

    const loading = _rolesLoading || _usersLoading;

    useEffect(() => {
        if (!dataSourceDelegate || !rolesPath) return;
        if (dataSourceDelegate.initialised !== undefined && !dataSourceDelegate.initialised) return;
        if (authController?.initialLoading) return;
        // if (authController.user === null) {
        //     setRolesLoading(false);
        //     return;
        // }

        setRolesLoading(true);
        return dataSourceDelegate.listenCollection?.({
            path: rolesPath,
            onUpdate(entities: Entity<any>[]): void {
                setRolesError(undefined);
                try {
                    const newRoles = entityToRoles(entities);
                    if (!equal(newRoles, roles)) {
                        setRoles(newRoles);
                    }
                } catch (e) {
                    setRoles([]);
                    console.error("Error loading roles", e);
                    setRolesError(e as Error);
                }
                setRolesLoading(false);
            },
            onError(e: any): void {
                setRoles([]);
                console.error("Error loading roles", e);
                setRolesError(e);
                setRolesLoading(false);
            }
        });

    }, [dataSourceDelegate?.initialised, authController?.initialLoading, authController?.user?.uid, rolesPath]);

    useEffect(() => {
        if (!dataSourceDelegate || !usersPath) return;
        if (dataSourceDelegate.initialised !== undefined && !dataSourceDelegate.initialised) {
            return;
        }
        if (authController?.initialLoading) {
            return;
        }

        setUsersLoading(true);
        return dataSourceDelegate.listenCollection?.({
            path: usersPath,
            onUpdate(entities: Entity<any>[]): void {
                console.debug("Updating users", entities);
                setUsersError(undefined);
                try {
                    const newUsers = entitiesToUsers(entities);
                    // if (!equal(newUsers, usersWithRoleIds))
                    setUsersWithRoleIds(newUsers);
                } catch (e) {
                    setUsersWithRoleIds([]);
                    console.error("Error loading users", e);
                    setUsersError(e as Error);
                }
                setUsersLoading(false);
            },
            onError(e: any): void {
                console.error("Error loading users", e);
                setUsersWithRoleIds([]);
                setUsersError(e);
                setUsersLoading(false);
            }
        });

    }, [dataSourceDelegate?.initialised, authController?.initialLoading, authController?.user?.uid, usersPath]);

    const saveUser = useCallback(async (user: USER): Promise<USER> => {
        if (!dataSourceDelegate) throw Error("useBuildUserManagement Firebase not initialised");
        if (!usersPath) throw Error("useBuildUserManagement Firestore not initialised");

        console.debug("Persisting user", user);

        const roleIds = user.roles?.map(r => r.id);
        const email = user.email?.toLowerCase().trim();
        if (!email) throw Error("Email is required");

        const userExists = users.find(u => u.email?.toLowerCase() === email);
        const data = {
            ...user,
            roles: roleIds ?? []
        };
        if (!userExists) {
            // @ts-ignore
            data.created_on = new Date();
        }
        // delete the previous user entry if it exists and the uid has changed
        if (userExists && userExists.uid !== user.uid) {
            const entity: Entity<any> = {
                values: {},
                path: usersPath,
                id: userExists.uid
            }
            await dataSourceDelegate.deleteEntity({ entity })
                .then(() => {
                    console.debug("Deleted previous user", userExists);
                })
                .catch(e => {
                    console.error("Error deleting user", e);
                });

        }

        return dataSourceDelegate.saveEntity({
            status: "existing",
            path: usersPath,
            entityId: email,
            values: removeUndefined(data)
        }).then(() => user);
    }, [usersPath, dataSourceDelegate?.initialised]);

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
            values: removeUndefined(roleData)
        }).then(() => {
            return;
        });
    }, [rolesPath, dataSourceDelegate?.initialised]);

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
    }, [usersPath, dataSourceDelegate?.initialised]);

    const deleteRole = useCallback(async (role: Role): Promise<void> => {
        if (!dataSourceDelegate) throw Error("useBuildUserManagement Firebase not initialised");
        if (!rolesPath) throw Error("useBuildUserManagement Firestore not initialised");
        console.debug("Deleting", role);
        const { id } = role;
        const entity: Entity<any> = {
            path: rolesPath,
            id: id,
            values: {}
        };
        await dataSourceDelegate.deleteEntity({ entity })
    }, [rolesPath, dataSourceDelegate?.initialised]);

    const collectionPermissions: PermissionsBuilder = useCallback(({
                                                                       collection,
                                                                       user
                                                                   }) =>
        resolveUserRolePermissions({
            collection,
            user
        }), []);

    const defineRolesFor: ((user: User) => Role[] | undefined) = useCallback((user) => {
        if (!usersWithRoleIds) throw Error("Users not loaded");
        const users = usersWithRoleIds.map(u => ({
            ...u,
            roles: roles.filter(r => u.roles?.includes(r.id))
        }) as User);
        const mgmtUser = users.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase());
        return mgmtUser?.roles;
    }, [roles, usersWithRoleIds]);

    const authenticator: Authenticator<USER> = useCallback(({ user }) => {

        if (loading) {
            return false;
        }
        if (user === null) {
            console.warn("User is null, returning");
            return false;
        }

        if (users.length === 0) {
            console.warn("No users created yet");
            return true; // If there are no users created yet, we allow access to every user
        }

        const mgmtUser = users.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase());
        if (mgmtUser) {
            // check if the uid is updated in the user management system
            if (mgmtUser.uid !== user.uid) {
                console.warn("User uid has changed, updating user in user management system");
                saveUser({
                    ...mgmtUser,
                    uid: user.uid
                }).then(() => {
                    console.debug("User updated in user management system", mgmtUser);
                }).catch(e => {
                    console.error("Error updating user in user management system", e);
                });
            }
            console.debug("User found in user management system", mgmtUser);
            return true;
        }

        throw Error("Could not find a user with the provided email in the user management system.");
    }, [loading, users]);

    const userRoles = authController.user ? defineRolesFor(authController.user) : undefined;
    const isAdmin = (userRoles ?? []).some(r => r.id === "admin");

    const userRoleIds = userRoles?.map(r => r.id);
    useEffect(() => {
        console.debug("Setting roles", userRoles);
        authController.setUserRoles?.(userRoles ?? []);
    }, [userRoleIds]);

    const getUser = useCallback((uid: string): USER | null => {
        if (!users) return null;
        const user = users.find(u => u.uid === uid);
        return user ?? null;
    }, [users]);

    console.log("users", users);
    return {
        loading,
        roles,
        users,
        saveUser,
        saveRole,
        rolesError,
        deleteUser,
        deleteRole,
        usersError,
        isAdmin,
        allowDefaultRolesCreation: allowDefaultRolesCreation === undefined ? true : allowDefaultRolesCreation,
        includeCollectionConfigPermissions: Boolean(includeCollectionConfigPermissions),
        collectionPermissions,
        defineRolesFor,
        authenticator,
        ...authController,
        initialLoading: authController.initialLoading || loading,
        userRoles: userRoles,
        getUser,
        user: authController.user ? {
            ...authController.user,
            roles: userRoles
        } : null
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
