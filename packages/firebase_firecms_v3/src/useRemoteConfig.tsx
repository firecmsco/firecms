import { collection, doc, getFirestore, onSnapshot } from "firebase/firestore";
import { EntityCollection } from "firecms";
import React, { useEffect, useRef, useState } from "react";
import { useInitialiseFirebase } from "./hooks/useInitialiseFirebase";

export type FireCMSRemoteConfig = {

    loading: boolean;

    name?: string;

    logo?: string;

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: EntityCollection[];

    users: object[];

    projectName?: string,
    subscriptionPlan?: string,
    configLoading: boolean,
    configError: boolean,

    clientFirebaseConfig?: object,
    clientFirebaseMissing?: boolean,
    serviceAccountMissing?: boolean,
    usersLimit: number | null,
};

const backendProdFirebaseConfig = {
    apiKey: "AIzaSyDa9HY0_H0GfAwvQnE3Zgo_ZJJEVO6CgrQ",
    authDomain: "firecms-backend.firebaseapp.com",
    projectId: "firecms-backend",
    storageBucket: "firecms-backend.appspot.com",
    messagingSenderId: "175047346381",
    appId: "1:175047346381:web:8159c8b49d65c043318184"
};

function useRemoteConfig({ projectId }: { projectId: string }): FireCMSRemoteConfig {

    const configPath = `projects/${projectId}`;

    const { firebaseApp: backendFirebaseApp, firebaseConfigLoading } = useInitialiseFirebase({ firebaseConfig: backendProdFirebaseConfig });

    const [collectionsLoading, setCollectionsLoading] = React.useState<boolean>(true);
    const [EntityCollections, setEntityCollections] = React.useState<EntityCollection[] | undefined>();

    const [collectionsError, setCollectionsError] = React.useState<Error | undefined>();
    const firestore = backendFirebaseApp ? getFirestore(backendFirebaseApp) : null;

    const [clientProjectName, setClientProjectName] = useState<string | undefined>();
    const [subscriptionPlan, setSubscriptionPlan] = useState<string>();
    const [clientConfigLoading, setClientConfigLoading] = useState<boolean>(false);
    const [clientFirebaseConfig, setClientFirebaseConfig] = useState<Record<string, unknown> | undefined>();
    const [clientFirebaseMissing, setClientFirebaseMissing] = useState<boolean | undefined>();
    const [serviceAccountMissing, setServiceAccountMissing] = useState<boolean | undefined>();
    const [clientConfigError, setClientConfigError] = useState<boolean>(false);

    const loadedProjectIdRef = useRef<string | undefined>(projectId);

    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [logo, setLogo] = React.useState<string | undefined>();
    const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
    const [users, setUsers] = React.useState<object[]>([]);

    const [usersError, setUsersError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!firestore || !configPath) return;

        return onSnapshot(collection(firestore, configPath, "collections"),
            {
                next: (snapshot) => {
                    setCollectionsError(undefined);
                    try {
                        const newCollections = docsToCollectionTree(snapshot.docs);
                        setEntityCollections(newCollections);
                    } catch (e) {
                        console.error(e);
                        setCollectionsError(e as Error);
                    }
                    setCollectionsLoading(false);
                },
                error: (e) => {
                    setCollectionsLoading(false);
                    setCollectionsError(e);
                }
            }
        );
    }, [configPath, firestore]);

    useEffect(() => {
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

                    setLogo(snapshot.get("logo"));
                    setClientProjectName(snapshot.get("name"));
                    setSubscriptionPlan(snapshot.get("subscription_plan") ?? "free"); // TODO: remove default value

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
                    setClientConfigError(false);

                    setServiceAccountMissing(!snapshot.get("service_account"));
                },
                error: (e) => {
                    console.error(e);
                    setClientConfigError(true);
                    setClientConfigLoading(false);
                }
            }
        );
    }, [backendFirebaseApp, projectId]);

    const usersLimit = subscriptionPlan === "free" ? 3 : null;
    const canEditRoles = subscriptionPlan !== "free";
    const canUploadLogo = subscriptionPlan !== "free";

    return {
        loading: usersLoading || collectionsLoading,
        collections: EntityCollections,
        users,
        logo,
        name: clientProjectName,
        projectName: clientProjectName,
        subscriptionPlan,
        configLoading: loadedProjectIdRef.current !== projectId || clientConfigLoading,
        configError: loadedProjectIdRef.current !== projectId ? false : clientConfigError,
        clientFirebaseConfig: loadedProjectIdRef.current !== projectId ? undefined : clientFirebaseConfig,
        clientFirebaseMissing: loadedProjectIdRef.current !== projectId ? false : clientFirebaseMissing,
        serviceAccountMissing: loadedProjectIdRef.current !== projectId ? undefined : serviceAccountMissing,
        usersLimit,
    }

}

