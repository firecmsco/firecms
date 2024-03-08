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
} from "firebase/firestore";
import { FirebaseApp } from "firebase/app";
import { FireCMSBackend, FireCMSUserProject } from "../types";
import { CMSType } from "@firecms/core";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { ProjectsApi } from "../api/projects";
import { Role } from "@firecms/firebase";
import { UserManagement } from "@firecms/user_management";

interface UserManagementParams {
    backendFirebaseApp?: FirebaseApp;
    projectId: string;
    projectsApi: ProjectsApi;
    usersLimit: number | null;
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
                                            }: UserManagementParams): UserManagement {

    const configPath = projectId ? `projects/${projectId}` : undefined;

    const firestoreRef = useRef<Firestore>();
    const storageRef = useRef<FirebaseStorage>();

    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [users, setUsers] = React.useState<FireCMSUserProject[]>([]);

    const [rolesError, setRolesError] = React.useState<Error | undefined>();
    const [usersError, setUsersError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!backendFirebaseApp) return;
        firestoreRef.current = getFirestore(backendFirebaseApp);
        storageRef.current = getStorage(backendFirebaseApp);
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
                        setUsers(newUsers);
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

    const saveUser = useCallback(async (user: FireCMSUserProject): Promise<FireCMSUserProject> => {

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

    const removeUser = useCallback(async (user: FireCMSUserProject): Promise<void> => {
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

    const loggedUser = users.find(u => u.uid === fireCMSBackend.user?.uid);

    return {
        loading: rolesLoading || usersLoading,
        roles,
        users,
        saveUser,
        saveRole,
        deleteUser: removeUser,
        deleteRole,
        usersLimit,
        canEditRoles: canEditRoles === undefined ? true : canEditRoles,
        loggedUser: loggedUser ?? null
    }
}

const docsToUsers = (docs: DocumentSnapshot[]): FireCMSUserProject[] => {
    return docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        created_on: doc.data()?.created_on?.toDate(),
        updated_on: doc.data()?.updated_on?.toDate()
    } as FireCMSUserProject));
}

const docsToRoles = (docs: DocumentSnapshot[]): Role[] => {
    return docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    } as Role));
}
