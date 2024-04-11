import React, { useCallback, useEffect } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentSnapshot,
    getFirestore,
    onSnapshot,
    setDoc
} from "firebase/firestore";
import { FirebaseApp } from "firebase/app";
import { UserManagement } from "../types";
import { Authenticator, PermissionsBuilder, Role, User } from "@firecms/core";
import { resolveUserRolePermissions } from "../utils";

type UserWithRoleIds = User & { roles: string[] };

export interface UserManagementParams {
    /**
     * The Firebase app to use for the user management. The config will be saved in the Firestore
     * collection indicated by `configPath`.
     */
    firebaseApp?: FirebaseApp;
    /**
     * Path where the plugin users configuration is stored.
     * Default: __FIRECMS/config/users
     * You can specify a different path if you want to store the user management configuration in a different place.
     * Please keep in mind that the FireCMS users are not necessarily the same as the Firebase users (but they can be).
     * The path should be relative to the root of the Firestore database, and should always have an odd number of segments.
     */
    usersPath?: string;

    /**
     * Path where the plugin roles configuration is stored.
     * Default: __FIRECMS/config/roles
     */
    rolesPath?: string;

    usersLimit?: number;

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
 * @param backendFirebaseApp
 * @param usersPath
 * @param rolesPath
 * @param usersLimit
 * @param canEditRoles
 */
export function useFirestoreUserManagement({
                                               firebaseApp,
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
        if (!firebaseApp || !rolesPath) return;
        const firestore = getFirestore(firebaseApp);

        return onSnapshot(collection(firestore, rolesPath),
            {
                next: (snapshot) => {
                    setRolesError(undefined);
                    try {
                        const newRoles = docsToRoles(snapshot.docs);
                        setRoles(newRoles);
                    } catch (e) {
                        // console.error(e);
                        setRolesError(e as Error);
                    }
                    setRolesLoading(false);
                },
                error: (e) => {
                    setRolesError(e);
                    setRolesLoading(false);
                }
            }
        );
    }, [firebaseApp, rolesPath]);

    useEffect(() => {
        if (!firebaseApp || !usersPath) return;
        const firestore = getFirestore(firebaseApp);

        return onSnapshot(collection(firestore, usersPath),
            {
                next: (snapshot) => {
                    setUsersError(undefined);
                    try {
                        const newUsers = docsToUsers(snapshot.docs);
                        setUsersWithRoleIds(newUsers);
                    } catch (e) {
                        setUsersError(e as Error);
                    }
                    setUsersLoading(false);
                },
                error: (e) => {
                    setUsersError(e);
                    setUsersLoading(false);
                }
            }
        );
    }, [firebaseApp, usersPath]);

    const saveUser = useCallback(async (user: User): Promise<User> => {
        if (!firebaseApp) throw Error("useFirestoreUserManagement Firebase not initialised");
        const firestore = getFirestore(firebaseApp);
        if (!firestore || !usersPath) throw Error("useFirestoreUserManagement Firestore not initialised");
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
            return setDoc(doc(firestore, usersPath, uid), data, { merge: true }).then(() => user);
        } else {
            return addDoc(collection(firestore, usersPath), data).then(() => user);
        }
    }, [usersPath, firebaseApp]);

    const saveRole = useCallback((role: Role): Promise<void> => {
        if (!firebaseApp) throw Error("useFirestoreUserManagement Firebase not initialised");
        const firestore = getFirestore(firebaseApp);
        if (!firestore || !rolesPath) throw Error("useFirestoreUserManagement Firestore not initialised");
        console.debug("Persisting role", role);
        const {
            id,
            ...roleData
        } = role;
        const ref = doc(firestore, rolesPath, id);
        return setDoc(ref, roleData, { merge: true });
    }, [rolesPath, firebaseApp]);

    const deleteUser = useCallback(async (user: User): Promise<void> => {
        if (!firebaseApp) throw Error("useFirestoreUserManagement Firebase not initialised");
        const firestore = getFirestore(firebaseApp);
        if (!firestore || !usersPath) throw Error("useFirestoreUserManagement Firestore not initialised");
        console.debug("Deleting", user);
        const { uid } = user;
        return deleteDoc(doc(firestore, usersPath, uid));
    }, [usersPath, firebaseApp]);

    const deleteRole = useCallback((role: Role): Promise<void> => {
        if (!firebaseApp) throw Error("useFirestoreUserManagement Firebase not initialised");
        const firestore = getFirestore(firebaseApp);
        if (!firestore || !rolesPath) throw Error("useFirestoreUserManagement Firestore not initialised");
        console.debug("Deleting", role);
        const { id } = role;
        const ref = doc(firestore, rolesPath, id);
        return deleteDoc(ref);
    }, [rolesPath, firebaseApp]);

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
        console.log("Authenticating user", user);
        // return true;"

        // console.log("authentication", user, userManagement);
        if (loading) {
            console.log("User management is still loading");
            return false;
        }

        // This is an example of how you can link the access system to the user management plugin
        if (users.length === 0) {
            return true; // If there are no users created yet, we allow access to every user
        }

        const mgmtUser = users.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase());
        if (mgmtUser) {
            // authController.setRoles(mgmtUser.roles ?? [])
            return true;
        }

        throw Error("Could not find a user with the provided email");
    }, [loading, users])

    return {
        loading,
        roles,
        users,
        saveUser,
        saveRole,
        deleteUser,
        deleteRole,
        usersLimit,
        canEditRoles: canEditRoles === undefined ? true : canEditRoles,
        allowDefaultRolesCreation: allowDefaultRolesCreation === undefined ? true : allowDefaultRolesCreation,
        includeCollectionConfigPermissions: Boolean(includeCollectionConfigPermissions),
        collectionPermissions,
        defineRolesFor,
        authenticator
    }
}

const docsToUsers = (docs: DocumentSnapshot[]): (UserWithRoleIds)[] => {
    return docs.map((doc) => {
        const data = doc.data() as any;
        const newVar = {
            uid: doc.id,
            ...data,
            created_on: data?.created_on?.toDate(),
            updated_on: data?.updated_on?.toDate()
        };
        return newVar as (UserWithRoleIds);
    });
}

const docsToRoles = (docs: DocumentSnapshot[]): Role[] => {
    return docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    } as Role));
}
