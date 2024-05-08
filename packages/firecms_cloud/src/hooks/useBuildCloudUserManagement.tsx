import React, { useCallback, useEffect, useRef } from "react";
import {
    collection,
    deleteDoc,
    doc,
    DocumentSnapshot,
    Firestore,
    getFirestore,
    onSnapshot,
    setDoc
} from "@firebase/firestore";
import { FirebaseApp } from "@firebase/app";
import { FireCMSBackend, FireCMSCloudUserWithRoles } from "../types";
import { CMSType, PermissionsBuilder, Role, User } from "@firecms/core";
import { ProjectsApi } from "../api/projects";
import { resolveUserRolePermissions, UserManagement } from "@firecms/user_management";

type UserWithRoleIds = User & { roles: string[] };

interface UserManagementParams {
    backendFirebaseApp?: FirebaseApp;
    projectId: string;
    projectsApi: ProjectsApi;
    usersLimit?: number;
    canEditRoles?: boolean;
    fireCMSBackend: FireCMSBackend
}

export function useBuildCloudUserManagement({
                                                backendFirebaseApp,
                                                projectId,
                                                projectsApi,
                                                usersLimit,
                                                canEditRoles,
                                                fireCMSBackend
                                            }: UserManagementParams): UserManagement<FireCMSCloudUserWithRoles> {

    const configPath = projectId ? `projects/${projectId}` : undefined;

    const firestoreRef = useRef<Firestore>();

    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [usersWithRoleIds, setUsersWithRoleIds] = React.useState<UserWithRoleIds[]>([]);
    const users = usersWithRoleIds.map(u => ({
        ...u,
        roles: roles.filter(r => u.roles.includes(r.id))
    } as FireCMSCloudUserWithRoles));

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

        return onSnapshot(collection(firestore, configPath, "users"),
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
            uid,
            ...userData
        } = user;
        if (uid) {
            return projectsApi.updateUser(projectId, uid, user);
        } else {
            return projectsApi.createNewUser(projectId, user);
        }
    }, [configPath, projectId]);

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
        const { uid } = user;
        return projectsApi.deleteUser(projectId, uid);
    }, [configPath]);

    const deleteRole = useCallback((role: Role): Promise<void> => {

        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Deleting", role);
        const { id } = role;
        const ref = doc(firestore, configPath, "roles", id);
        return deleteDoc(ref);
    }, [configPath]);

    const loggedInUser = users.find((u) => u.email.toLowerCase() === fireCMSBackend.user?.email?.toLowerCase());

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

    return {
        allowDefaultRolesCreation: false,
        includeCollectionConfigPermissions: true,
        loading: rolesLoading || usersLoading,
        roles,
        users,
        saveUser,
        saveRole,
        defineRolesFor,
        deleteUser: removeUser,
        deleteRole,
        usersLimit,
        canEditRoles: canEditRoles === undefined ? true : canEditRoles,
        collectionPermissions
    }
}

const docsToUsers = (docs: DocumentSnapshot[]): UserWithRoleIds[] => {
    return docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
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
