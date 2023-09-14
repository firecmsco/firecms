import { EntityCollection } from "firecms";

export type FireCMSRemoteConfig = {

    name: string;

    logo?: string;

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: EntityCollection[];
};

function useRemoteConfig({ projectId }: { projectId: string }): FireCMSRemoteConfig {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [collectionsLoading, setCollectionsLoading] = React.useState<boolean>(true);
    const [persistedCollections, setPersistedCollections] = React.useState<PersistedCollection[] | undefined>();

    const [collectionsError, setCollectionsError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    useEffect(() => {
        if (!firestore || !configPath) return;

        return onSnapshot(collection(firestore, configPath, "collections"),
            {
                next: (snapshot) => {
                    setCollectionsError(undefined);
                    try {
                        const newCollections = docsToCollectionTree(snapshot.docs);
                        setPersistedCollections(newCollections);
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

    const deleteCollection = useCallback(({ path, parentPathSegments }: DeleteCollectionParams): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const collectionPath = buildCollectionPath(path, parentPathSegments);
        const ref = doc(firestore, configPath, "collections", collectionPath);
        return deleteDoc(ref);
    }, [configPath, firestore]);

    const saveCollection = useCallback(<M extends Record<string, any>>({ path, collectionData, previousPath, parentPathSegments }: SaveCollectionParams<M>): Promise<void> => {
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const cleanedCollection = prepareCollectionForPersistence(collectionData);
        const strippedPath = buildCollectionPath(path, parentPathSegments);
        const previousStrippedPath = previousPath ? buildCollectionPath(previousPath, parentPathSegments) : undefined;
        const ref = doc(firestore, configPath, "collections", strippedPath);
        console.debug("Saving collection", { path, previousPath, parentPathSegments, cleanedCollection });
        return runTransaction(firestore, async (transaction) => {
            transaction.set(ref, cleanedCollection, { merge: true });
            if (previousStrippedPath && previousStrippedPath !== strippedPath) {
                const previousRef = doc(firestore, configPath, "collections", previousStrippedPath);
                transaction.delete(previousRef);
            }
        });
    }, [configPath, firestore]);

    const collections = persistedCollections !== undefined ? applyPermissionsFunction(persistedCollections, permissions as PermissionsBuilder) : undefined;

    return {
        loading: collectionsLoading,
        collections,
        saveCollection,
        deleteCollection
    }

    const [clientProjectName, setClientProjectName] = useState<string | undefined>();
    const [subscriptionPlan, setSubscriptionPlan] = useState<ProjectSubscriptionPlan>();
    const [clientConfigLoading, setClientConfigLoading] = useState<boolean>(false);
    const [clientFirebaseConfig, setClientFirebaseConfig] = useState<Record<string, unknown> | undefined>();
    const [clientFirebaseMissing, setClientFirebaseMissing] = useState<boolean | undefined>();
    const [serviceAccountMissing, setServiceAccountMissing] = useState<boolean | undefined>();
    const [clientConfigError, setClientConfigError] = useState<boolean>(false);

    const loadedProjectIdRef = useRef<string | undefined>(projectId);

    const firestoreRef = useRef<Firestore>();
    const storageRef = useRef<FirebaseStorage>();

    const [rolesLoading, setRolesLoading] = React.useState<boolean>(true);
    const [logo, setLogo] = React.useState<string | undefined>();
    const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [users, setUsers] = React.useState<SaasUserProject[]>([]);

    const [rolesError, setRolesError] = React.useState<Error | undefined>();
    const [usersError, setUsersError] = React.useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
        storageRef.current = getStorage(firebaseApp);
    }, [firebaseApp]);

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
    }>(user: SaasUserProject): Promise<SaasUserProject> => {

        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Persisting", user);
        const {
            uid,
            ...userData
        } = user;
        const firebaseToken = await authController.getFirebaseIdToken();
        if (uid) {
            return updateUser(firebaseToken, projectId, uid, user);
        } else {
            return createNewUser(firebaseToken, projectId, user);
        }
    }, [authController, configPath, projectId]);

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
    }>(user: SaasUserProject): Promise<void> => {
        const firestore = firestoreRef.current;
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        console.debug("Deleting", user);
        const { uid } = user;
        const firebaseToken = await authController.getFirebaseIdToken();
        return deleteUser(firebaseToken, projectId, uid);
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
        if (!projectId || !firebaseApp) {
            setClientConfigLoading(false);
            return;
        }

        if (loadedProjectIdRef.current !== projectId) {
            setClientConfigLoading(true);
            setClientFirebaseConfig(undefined);
            loadedProjectIdRef.current = undefined;
        }

        const firestore = getFirestore(firebaseApp);
        return onSnapshot(doc(firestore, "projects", projectId),
            {
                next: (snapshot) => {

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
    }, [firebaseApp, projectId]);

    const usersLimit = subscriptionPlan === "free" ? 3 : null;
    const canEditRoles = subscriptionPlan !== "free";
    const canUploadLogo = subscriptionPlan !== "free";

    return {

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
        subscriptionPlan,
        configLoading: loadedProjectIdRef.current !== projectId || clientConfigLoading,
        configError: loadedProjectIdRef.current !== projectId ? false : clientConfigError,
        clientFirebaseConfig: loadedProjectIdRef.current !== projectId ? undefined : clientFirebaseConfig,
        clientFirebaseMissing: loadedProjectIdRef.current !== projectId ? undefined : clientFirebaseMissing,
        serviceAccountMissing: loadedProjectIdRef.current !== projectId ? undefined : serviceAccountMissing,
        usersLimit,
        canEditRoles,
        canUploadLogo
    }

}

