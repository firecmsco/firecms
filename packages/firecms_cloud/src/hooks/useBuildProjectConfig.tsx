import React, { useCallback, useEffect, useRef, useState } from "react";
import { doc, getFirestore, onSnapshot, setDoc } from "@firebase/firestore";
import { FirebaseApp } from "@firebase/app";
import { ProjectSubscriptionPlan } from "../types";
import { UploadFileProps } from "@firecms/core";
import { FirebaseStorage, getDownloadURL, getStorage, ref, StorageReference, uploadBytes } from "@firebase/storage";
import { darkenColor, hexToRgbaWithOpacity } from "../utils";

const DEFAULT_PRIMARY_COLOR = "#0070F4";
const DEFAULT_SECONDARY_COLOR = "#FF5B79";

export type ProjectConfig = {

    projectId: string;

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
    usersLimit?: number;

    canEditRoles: boolean;
    canModifyTheme: boolean;
    canExport: boolean;
    canUseLocalTextSearch: boolean;

    localTextSearchEnabled: boolean;
    updateLocalTextSearchEnabled: (allow: boolean) => Promise<void>;

    primaryColor?: string;
    secondaryColor?: string;
    updatePrimaryColor: (color?: string) => void;
    updateSecondaryColor: (color?: string) => void;

    creationType?: "new" | "existing";
};

interface ProjectConfigParams {
    backendFirebaseApp?: FirebaseApp;
    projectId: string;
}

export function useBuildProjectConfig({
                                          backendFirebaseApp,
                                          projectId,
                                      }: ProjectConfigParams): ProjectConfig {

    const [primaryColor, setPrimaryColor] = useState<string | undefined>(DEFAULT_PRIMARY_COLOR);
    const [secondaryColor, setSecondaryColor] = useState<string | undefined>(DEFAULT_SECONDARY_COLOR);

    const configPath = projectId ? `projects/${projectId}` : undefined;

    const [clientProjectName, setClientProjectName] = useState<string | undefined>();
    const [subscriptionPlan, setSubscriptionPlan] = useState<ProjectSubscriptionPlan>();
    const [clientConfigLoading, setClientConfigLoading] = useState<boolean>(false);
    const [clientFirebaseConfig, setClientFirebaseConfig] = useState<Record<string, unknown> | undefined>();
    const [clientFirebaseMissing, setClientFirebaseMissing] = useState<boolean | undefined>();
    const [serviceAccountMissing, setServiceAccountMissing] = useState<boolean | undefined>();
    const [clientConfigError, setClientConfigError] = useState<Error | undefined>();
    const [localTextSearchEnabled, setLocalTextSearchEnabled] = useState<boolean>(false);

    const [customizationRevision, setCustomizationRevision] = useState<string | undefined>();
    const [creationType, setCreationType] = useState<"new" | "existing" | undefined>();

    const loadedProjectIdRef = useRef<string | undefined>(projectId);

    const [logo, setLogo] = React.useState<string | undefined>();

    useEffect(() => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
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

    // update css variables when colors change in :root
    useEffect(() => {
        if (primaryColor) {
            document.documentElement.style.setProperty("--fcms-primary", primaryColor);
            document.documentElement.style.setProperty("--fcms-primary-dark", darkenColor(primaryColor, 10));
            document.documentElement.style.setProperty("--fcms-primary-bg", hexToRgbaWithOpacity(primaryColor, 10));
        } else {
            document.documentElement.style.setProperty("--fcms-primary", darkenColor(DEFAULT_PRIMARY_COLOR, 10));
            document.documentElement.style.setProperty("--fcms-primary-dark", darkenColor(DEFAULT_PRIMARY_COLOR, 10));
            document.documentElement.style.setProperty("--fcms-primary-bg", hexToRgbaWithOpacity(DEFAULT_PRIMARY_COLOR, 10));
        }
        if (secondaryColor) {
            document.documentElement.style.setProperty("--fcms-secondary", secondaryColor);
        } else {
            document.documentElement.style.setProperty("--fcms-secondary", DEFAULT_SECONDARY_COLOR);
        }

    }, [primaryColor, secondaryColor]);

    const uploadLogo = useCallback(async (file: File): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const storage = getStorage(backendFirebaseApp);
        if (!storage) throw Error("useFirestoreConfigurationPersistence Storage not initialised");
        const fileRef = await uploadFile(storage, {
            file,
            path: `${configPath}/images`
        });
        const url = await getDownloadURL(fileRef);
        setDoc(doc(firestore, configPath), { logo: url }, { merge: true });
    }, [configPath]);

    const updateProjectName = useCallback(async (name: string): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        return setDoc(doc(firestore, configPath), { name }, { merge: true });
    }, [configPath]);

    const updateLocalTextSearchEnabled = useCallback(async (allowed: boolean): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        return setDoc(doc(firestore, configPath), { local_text_search_enabled: allowed }, { merge: true });
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

                    console.debug("Project config snapshot:", snapshot.data());
                    setClientProjectName(snapshot.get("name"));
                    const plan = snapshot.get("subscription_plan") ?? "free";
                    setSubscriptionPlan(plan); // TODO: remove default value
                    setLocalTextSearchEnabled(snapshot.get("local_text_search_enabled") ?? false);
                    if (plan === "free") {
                        setPrimaryColor(DEFAULT_PRIMARY_COLOR);
                        setSecondaryColor(DEFAULT_SECONDARY_COLOR);
                    } else {
                        setPrimaryColor(snapshot.get("primary_color") ?? DEFAULT_PRIMARY_COLOR);
                        setSecondaryColor(snapshot.get("secondary_color") ?? DEFAULT_SECONDARY_COLOR);
                    }

                    const currentCustomizationRevision = snapshot.get("current_app_config_revision");
                    setCustomizationRevision(currentCustomizationRevision);
                    setCreationType(snapshot.get("creation_type"));

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

    const usersLimit = subscriptionPlan === "free" ? 3 : undefined;
    const canEditRoles = subscriptionPlan !== "free";
    const canModifyTheme = subscriptionPlan !== "free";
    const canExport = subscriptionPlan !== "free";
    const canUseLocalTextSearch = subscriptionPlan !== "free";

    const updatePrimaryColor = useCallback(async (color?: string): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        setPrimaryColor(color);
        if (canModifyTheme)
            setDoc(doc(firestore, configPath), { primary_color: color }, { merge: true });
    }, [configPath, canModifyTheme]);

    const updateSecondaryColor = useCallback(async (color?: string): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        setSecondaryColor(color);
        if (canModifyTheme)
            setDoc(doc(firestore, configPath), { secondary_color: color }, { merge: true });
    }, [configPath, canModifyTheme]);

    return {

        projectId,
        logo: canModifyTheme ? logo : undefined,
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
        canModifyTheme,
        canExport,
        canUseLocalTextSearch,
        localTextSearchEnabled,
        updateLocalTextSearchEnabled,
        primaryColor,
        secondaryColor,
        updatePrimaryColor,
        updateSecondaryColor
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
