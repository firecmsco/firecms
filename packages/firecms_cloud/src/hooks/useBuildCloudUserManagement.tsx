import React, { useCallback, useEffect, useRef } from "react";
import {
    collection,
    deleteDoc,
    doc,
    DocumentSnapshot,
    Firestore,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    setDoc
} from "@firebase/firestore";
import { FirebaseApp } from "@firebase/app";
import { FireCMSBackend, FireCMSCloudUserWithRoles } from "@firecms/types";
import { CMSType, PermissionsBuilder, Role, User } from "@firecms/core";
import { ProjectsApi } from "../api/projects";
import { resolveUserRolePermissions, UserManagement } from "@firecms/user_management";

type UserWithRoleIds = User & { roles: string[], firebase_uid: string };

interface UserManagementParams {
    backendFirebaseApp?: FirebaseApp;
    projectId: string;
    projectsApi: ProjectsApi;
    fireCMSBackend: FireCMSBackend
}

export type CloudUserManagement = UserManagement<FireCMSCloudUserWithRoles> & {
    updateUserFields: (saas_uid: string, fields: Partial<FireCMSCloudUserWithRoles>) => Promise<void>;
};

export function useBuildCloudUserManagement({
    backendFirebaseApp,
    projectId,
    projectsApi,
    fireCMSBackend
}: UserManagementParams): CloudUserManagement {

    const configPath = projectId ? `projects/${projectId}` : undefined;

    const firestoreRef = useRef<Firestore>();

    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [usersWithRoleIds, setUsersWithRoleIds] = React.useState<UserWithRoleIds[]>([]);
    const users = usersWithRoleIds.map(u => ({
        ...u,
        uid: u.firebase_uid,
        saas_uid: u.uid,
        roles: roles.filter(r => u.roles.includes(r.id))
    } satisfies FireCMSCloudUserWithRoles));

    const [rolesError, setRolesError] = React.useState<Error | undefined>();
    const [usersError, setUsersError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!backendFirebaseApp) return;
        firestoreRef.current = getFirestore(backendFirebaseApp);
    }, [backendFirebaseApp]);

    useEffect(() => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) return;

        return onSnapshot(collection(firestore, configPath, "roles"),
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
    }, [configPath]);

    useEffect(() => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) return;

        return onSnapshot(query(collection(firestore, configPath, "users"), orderBy("created_on", "asc")),
            {
                next: (snapshot) => {
                    setUsersError(undefined);
                    try {
                        const newUsers = docsToUsers(snapshot.docs);
                        setUsersWithRoleIds(newUsers);
                    } catch (e) {
                        // console.error(e);
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
    }, [configPath]);

    const saveUser = useCallback(async (user: FireCMSCloudUserWithRoles): Promise<FireCMSCloudUserWithRoles> => {

        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Persisting", user);
        const {
            saas_uid,
            ...userData
        } = user;
        if (saas_uid) {
            return projectsApi.updateUser(projectId, saas_uid, user);
        } else {
            return projectsApi.createNewUser(projectId, user);
        }
    }, [configPath, projectId]);

    /**
     * Update specific fields of a user directly in Firestore.
     * This bypasses the API for simple field updates like photoURL.
     */
    const updateUserFields = useCallback(async (
        saas_uid: string,
        fields: Partial<FireCMSCloudUserWithRoles>
    ): Promise<void> => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("Firestore not initialised");
        console.debug("Updating user fields directly in Firestore", { saas_uid, fields });
        const ref = doc(firestore, configPath, "users", saas_uid);
        return setDoc(ref, {
            ...fields,
            updated_on: new Date()
        }, { merge: true });
    }, [configPath]);

    const saveRole = useCallback(<M extends { [Key: string]: CMSType }>(role: Role): Promise<void> => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Persisting", role);
        const {
            id,
            ...roleData
        } = role;
        const ref = doc(firestore, configPath, "roles", id);
        return setDoc(ref, roleData, { merge: true });
    }, [configPath]);

    const removeUser = useCallback(async (user: FireCMSCloudUserWithRoles): Promise<void> => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Deleting", user);
        const { saas_uid } = user;
        return projectsApi.deleteUser(projectId, saas_uid);
    }, [configPath]);

    const deleteRole = useCallback((role: Role): Promise<void> => {

        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Deleting", role);
        const { id } = role;
        const ref = doc(firestore, configPath, "roles", id);
        return deleteDoc(ref);
    }, [configPath]);

    const loggedInUser = users.find((u) => u.email?.toLowerCase() === fireCMSBackend.user?.email?.toLowerCase());

    const collectionPermissions: PermissionsBuilder = useCallback(({
        collection,
    }) => resolveUserRolePermissions({
        collection,
        user: loggedInUser ?? null
    }), [loggedInUser?.uid]);

    const userIds = users.map(u => u.uid);
    const defineRolesFor: ((user: User) => Role[] | undefined) = useCallback((user) => {
        if (!users) throw Error("Users not loaded");
        const mgmtUser = users.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase());
        return mgmtUser?.roles;
    }, [userIds]);

    const isAdmin = loggedInUser?.roles.some(r => r.id === "admin");

    const getUser = useCallback((uid: string): User | null => {
        if (!users) throw Error("Users not loaded");
        const mgmtUser = users.find(u => u.uid === uid);
        return mgmtUser ?? null;
    }, [userIds]);

    return {
        allowDefaultRolesCreation: false,
        includeCollectionConfigPermissions: true,
        loading: rolesLoading || usersLoading,
        roles,
        users,
        saveUser,
        updateUserFields,
        saveRole,
        defineRolesFor,
        deleteUser: removeUser,
        deleteRole,
        isAdmin,
        collectionPermissions,
        getUser
    }
}

const docsToUsers = (docs: DocumentSnapshot[]): UserWithRoleIds[] => {
    return docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id, // Document ID is the saas_uid (used for API calls)
        created_on: doc.data()?.created_on?.toDate(),
        updated_on: doc.data()?.updated_on?.toDate()
    } as unknown as UserWithRoleIds));
}

const docsToRoles = (docs: DocumentSnapshot[]): Role[] => {
    return docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    } as Role));
}
