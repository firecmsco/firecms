import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { FireCMSUserProject, ProjectSubscriptionPlan } from "../types";
import { CMSType, UploadFileProps } from "@firecms/core";
import { FirebaseStorage, getDownloadURL, getStorage, ref, StorageReference, uploadBytes } from "firebase/storage";
import { ProjectsApi } from "../api/projects";
import { Role } from "@firecms/firebase";

export type ProjectConfig = {
    projectId: string;
    loading: boolean;

    logo?: string;
    uploadLogo: (file: File) => Promise<void>;

    projectName?: string;
    updateProjectName: (name: string) => Promise<void>;

    configLoading: boolean;
    configError?: Error;

    clientFirebaseConfig?: Record<string, unknown>;
    clientFirebaseMissing?: boolean;
    serviceAccountMissing?: boolean;

    subscriptionPlan?: ProjectSubscriptionPlan;
    customizationRevision?: string;
    usersLimit: number | null;

    canEditRoles: boolean;
    canUploadLogo: boolean;
    canExport: boolean;
};

interface ProjectConfigParams {
    backendFirebaseApp?: FirebaseApp;
    projectId: string;
    projectsApi: ProjectsApi
}

export function useBuildProjectConfig({
                                          backendFirebaseApp,
                                          projectId,
                                          projectsApi
                                      }: ProjectConfigParams): ProjectConfig {

    const configPath = projectId ? `projects/${projectId}` : undefined;

    const [clientProjectName, setClientProjectName] = useState<string | undefined>();
    const [subscriptionPlan, setSubscriptionPlan] = useState<ProjectSubscriptionPlan>();
    const [clientConfigLoading, setClientConfigLoading] = useState<boolean>(false);
    const [clientFirebaseConfig, setClientFirebaseConfig] = useState<Record<string, unknown> | undefined>();
    const [clientFirebaseMissing, setClientFirebaseMissing] = useState<boolean | undefined>();
    const [serviceAccountMissing, setServiceAccountMissing] = useState<boolean | undefined>();
    const [clientConfigError, setClientConfigError] = useState<Error | undefined>();

    const [customizationRevision, setCustomizationRevision] = useState<string | undefined>();

    const loadedProjectIdRef = useRef<string | undefined>(projectId);

    const firestoreRef = useRef<Firestore>();
    const storageRef = useRef<FirebaseStorage>();

    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [logo, setLogo] = React.useState<string | undefined>();
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

        return onSnapshot(doc(firestore, configPath),
            {
                next: (snapshot) => {
                    setLogo(snapshot.get("logo"));
                },
                error: (e) => {
                    console.error(e);
                }
            }
        );
    }, [configPath]);

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

    const saveUser = useCallback(async <M extends {
        [Key: string]: CMSType
    }>(user: FireCMSUserProject): Promise<FireCMSUserProject> => {

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

    const removeUser = useCallback(async <M extends {
        [Key: string]: CMSType
    }>(user: FireCMSUserProject): Promise<void> => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Deleting", user);
        const { uid } = user;
        return projectsApi.deleteUser(projectId, uid);
    }, [configPath]);

    const deleteRole = useCallback(<M extends { [Key: string]: CMSType }>(role: Role): Promise<void> => {

        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Deleting", role);
        const { id } = role;
        const ref = doc(firestore, configPath, "roles", id);
        return deleteDoc(ref);
    }, [configPath]);

    const uploadLogo = useCallback(async (file: File): Promise<void> => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const storage = storageRef.current;
        if (!storage) throw Error("useFirestoreConfigurationPersistence Storage not initialised");
        const fileRef = await uploadFile(storage, {
            file,
            path: `${configPath}/images`
        });
        const url = await getDownloadURL(fileRef);
        setDoc(doc(firestore, configPath), { logo: url }, { merge: true });
    }, [configPath]);

    const updateProjectName = useCallback(async (name: string): Promise<void> => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        return setDoc(doc(firestore, configPath), { name }, { merge: true });
    }, [configPath]);

    useEffect(() => {
        if (!projectId || !backendFirebaseApp) {
            setClientConfigLoading(false);
            return;
        }

        if (loadedProjectIdRef.current !== projectId) {
            setClientConfigLoading(true);
            setClientFirebaseConfig(undefined);
            loadedProjectIdRef.current = undefined;
        }

        const firestore = getFirestore(backendFirebaseApp);
        return onSnapshot(doc(firestore, "projects", projectId),
            {
                next: (snapshot) => {

                    setClientProjectName(snapshot.get("name"));
                    setSubscriptionPlan(snapshot.get("subscription_plan") ?? "free"); // TODO: remove default value
                    const currentCustomizationRevision = snapshot.get("current_app_config_revision");
                    setCustomizationRevision(currentCustomizationRevision);

                    const firebaseConfig = snapshot.get("firebase_config");

                    loadedProjectIdRef.current = projectId;
                    if (firebaseConfig === "loading") {
                        setClientConfigLoading(true);
                        setClientFirebaseConfig(undefined);
                        setClientFirebaseMissing(false);
                    } else if (typeof firebaseConfig === "object") {
                        setClientFirebaseConfig(firebaseConfig);
                        setClientConfigLoading(false);
                        setClientFirebaseMissing(false);
                    } else if (firebaseConfig === undefined) {
                        setClientConfigLoading(false);
                        setClientFirebaseMissing(true);
                    }
                    setClientConfigError(undefined);

                    setServiceAccountMissing(!snapshot.get("service_account"));
                },
                error: (e) => {
                    console.error(e);
                    setClientConfigError(e);
                    setClientConfigLoading(false);
                }
            }
        );
    }, [backendFirebaseApp, projectId]);

    const usersLimit = subscriptionPlan === "free" ? 3 : null;
    const canEditRoles = subscriptionPlan !== "free";
    const canUploadLogo = subscriptionPlan !== "free";
    const canExport = subscriptionPlan !== "free";

    return {

        projectId,
        loading: rolesLoading || usersLoading,
        roles,
        users,
        saveUser,
        saveRole,
        deleteUser: removeUser,
        deleteRole,
        logo,
        uploadLogo,
        updateProjectName,

        projectName: clientProjectName,
        subscriptionPlan: loadedProjectIdRef.current !== projectId ? undefined : subscriptionPlan,
        customizationRevision: loadedProjectIdRef.current !== projectId ? undefined : customizationRevision,
        configLoading: loadedProjectIdRef.current !== projectId || clientConfigLoading,
        configError: loadedProjectIdRef.current !== projectId ? undefined : clientConfigError,
        clientFirebaseConfig: loadedProjectIdRef.current !== projectId ? undefined : clientFirebaseConfig,
        clientFirebaseMissing: loadedProjectIdRef.current !== projectId ? undefined : clientFirebaseMissing,
        serviceAccountMissing: loadedProjectIdRef.current !== projectId ? undefined : serviceAccountMissing,
        usersLimit,
        canEditRoles,
        canUploadLogo,
        canExport
    }
}

const uploadFile = (storage: FirebaseStorage, {
    file,
    fileName,
    path,
    metadata
}: UploadFileProps): Promise<StorageReference> => {
    const usedFilename = fileName ?? file.name;
    console.debug("Uploading file", usedFilename, file, path, metadata);
    return uploadBytes(ref(storage, `${path}/${usedFilename}`), file, metadata)
        .then(snapshot => snapshot.ref);
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
