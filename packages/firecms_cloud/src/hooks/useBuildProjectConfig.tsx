import React, { useCallback, useEffect, useRef, useState } from "react";
import { doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
import { ReCaptchaEnterpriseProvider, ReCaptchaV3Provider } from "firebase/app-check";

import { FirebaseApp } from "firebase/app";
import { ProjectSubscriptionData, ProjectSubscriptionPlan } from "../types";
import { UploadFileProps } from "@firecms/core";
import { FirebaseStorage, getDownloadURL, getStorage, ref, StorageReference, uploadBytes } from "firebase/storage";
import { darkenColor, hexToRgbaWithOpacity } from "../utils";
import { AppCheckOptions } from "@firecms/firebase";
import { ProjectsApi } from "../api/projects";
import { useRetryStalledFirebaseConfig } from "./useRetryStalledFirebaseConfig";

const DEFAULT_PRIMARY_COLOR = "#0070F4";
const DEFAULT_SECONDARY_COLOR = "#FF5B79";

export type TypesenseSearchConfig = {
    enabled: boolean;
    region: string;
    extensionInstanceId: string;
    collections?: string[];
};

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
    subscriptionData?: ProjectSubscriptionData;
    trialValidUntil?: Date;
    isTrialOver: boolean;
    subscriptionStatus?: object;
    subscriptionSource?: "stripe" | "gcp_marketplace";
    isGCPMarketplace: boolean;
    customizationRevision?: string;

    localTextSearchEnabled: boolean;
    updateLocalTextSearchEnabled: (allow: boolean) => Promise<void>;

    typesenseSearchConfig?: TypesenseSearchConfig;
    updateTypesenseSearchConfig: (config: TypesenseSearchConfig | null) => Promise<void>;

    primaryColor?: string;
    secondaryColor?: string;
    updatePrimaryColor: (color?: string) => void;
    updateSecondaryColor: (color?: string) => void;

    blocked: boolean;

    defaultLocale?: string;
    updateDefaultLocale: (locale: string) => Promise<void>;

    creationType?: "new" | "existing";

    appCheck?: AppCheckOptions;
    serializedAppCheck: SerializedAppCheckOptions | null;
    updateAppCheck: (appCheck: SerializedAppCheckOptions | null) => Promise<void>;

    historyDefaultEnabled: boolean;
    updateHistoryDefaultEnabled: (enabled: boolean) => Promise<void>;

    updateSurveyData: (surveyData: Record<string, any>) => Promise<void>;
};

interface ProjectConfigParams {
    backendFirebaseApp?: FirebaseApp;
    projectId: string;
    /**
     * Lets the hook ask the backend for the project's web app when its
     * Firebase config stays pending. See `useRetryStalledFirebaseConfig`.
     */
    projectsApi?: ProjectsApi;
}

export function useBuildProjectConfig({
    backendFirebaseApp,
    projectId,
    projectsApi
}: ProjectConfigParams): ProjectConfig {

    const [primaryColor, setPrimaryColor] = useState<string | undefined>(() => {
        // Check for legacy CSS property
        const legacyPrimary = getComputedStyle(document.documentElement)
            .getPropertyValue('--fcms-primary')?.trim();
        return legacyPrimary || DEFAULT_PRIMARY_COLOR;
    });
    const [secondaryColor, setSecondaryColor] = useState<string | undefined>(() => {
        // Check for legacy CSS property
        const legacySecondary = getComputedStyle(document.documentElement)
            .getPropertyValue('--fcms-secondary')?.trim();
        return legacySecondary || DEFAULT_SECONDARY_COLOR;
    });

    const projectPath = `projects/${projectId}`;
    const configPath = projectId ? projectPath : undefined;

    const [clientProjectName, setClientProjectName] = useState<string | undefined>();
    const [subscriptionPlan, setSubscriptionPlan] = useState<ProjectSubscriptionPlan>();
    const [subscriptionData, setSubscriptionData] = useState<ProjectSubscriptionData | undefined>();
    const [trialValidUntil, setTrialValidUntil] = useState<Date | undefined>();
    const [subscriptionSource, setSubscriptionSource] = useState<"stripe" | "gcp_marketplace" | undefined>();

    const isTrialOver = (subscriptionPlan === "free" && trialValidUntil ? new Date() > trialValidUntil : false) || false;

    const [clientConfigLoading, setClientConfigLoading] = useState<boolean>(false);
    const [clientFirebaseConfig, setClientFirebaseConfig] = useState<Record<string, unknown> | undefined>();
    const [clientFirebaseMissing, setClientFirebaseMissing] = useState<boolean | undefined>();
    const [clientFirebasePending, setClientFirebasePending] = useState<boolean>(false);
    const [serviceAccountMissing, setServiceAccountMissing] = useState<boolean | undefined>();
    const [clientConfigError, setClientConfigError] = useState<Error | undefined>();
    const [localTextSearchEnabled, setLocalTextSearchEnabled] = useState<boolean>(false);
    const [typesenseSearchConfig, setTypesenseSearchConfig] = useState<TypesenseSearchConfig | undefined>();
    const [historyDefaultEnabled, setHistoryDefaultEnabled] = useState<boolean>(false);
    const [blocked, setBlocked] = useState<boolean>(false);

    const [appCheck, setAppCheck] = useState<AppCheckOptions | undefined>();
    const [serializedAppCheck, setSerializedAppCheck] = useState<SerializedAppCheckOptions | null>(null);

    const [defaultLocale, setDefaultLocale] = useState<string | undefined>();

    const [customizationRevision, setCustomizationRevision] = useState<string | undefined>();
    const [creationType, setCreationType] = useState<"new" | "existing" | undefined>();

    const loadedProjectIdRef = useRef<string | undefined>(projectId);

    const [logo, setLogo] = React.useState<string | undefined>();

    useEffect(() => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) return;

        // Denied while the project is still being created, like the project
        // listener below, so it listens again the same way.
        let unsubscribe: (() => void) | undefined;
        let retryTimeout: ReturnType<typeof setTimeout> | undefined;
        let deniedAttempts = 0;

        const subscribe = () => {
            unsubscribe = onSnapshot(doc(firestore, configPath),
                {
                    next: (snapshot) => {
                        deniedAttempts = 0;
                        setLogo(snapshot.get("logo"));
                    },
                    error: (e) => {
                        console.error(e);
                        if (e.code === "permission-denied") {
                            const delay = Math.min(1000 * 2 ** deniedAttempts, 10000);
                            deniedAttempts++;
                            retryTimeout = setTimeout(subscribe, delay);
                        }
                    }
                });
        };
        subscribe();

        return () => {
            clearTimeout(retryTimeout);
            unsubscribe?.();
        };
    }, [configPath]);

    // update css variables when colors change in :root
    useEffect(() => {
        if (primaryColor) {
            document.documentElement.style.setProperty("--color-primary", primaryColor);
            document.documentElement.style.setProperty("--color-primary-dark", darkenColor(primaryColor, 10));
            document.documentElement.style.setProperty("--fcms-primary", primaryColor);
        } else {
            document.documentElement.style.setProperty("--color-primary", DEFAULT_PRIMARY_COLOR);
            document.documentElement.style.setProperty("--color-primary-dark", darkenColor(DEFAULT_PRIMARY_COLOR, 10));
            document.documentElement.style.setProperty("--fcms-primary", DEFAULT_PRIMARY_COLOR);
        }
        if (secondaryColor) {
            document.documentElement.style.setProperty("--color-secondary", secondaryColor);
            document.documentElement.style.setProperty("--fcms-secondary", secondaryColor);
        } else {
            document.documentElement.style.setProperty("--color-secondary", DEFAULT_SECONDARY_COLOR);
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

    const updateTypesenseSearchConfig = useCallback(async (config: TypesenseSearchConfig | null): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        return setDoc(doc(firestore, configPath), { typesense_search_config: config }, { merge: true });
    }, [configPath]);

    const updateHistoryDefaultEnabled = useCallback(async (enabled: boolean): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        return setDoc(doc(firestore, configPath), { history_default_enabled: enabled }, { merge: true });
    }, [configPath]);

    const updateSurveyData = useCallback(async (surveyData: Record<string, string>): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        return setDoc(doc(firestore, configPath), { survey_data: surveyData }, { merge: true });
    }, [configPath]);

    const updateDefaultLocale = useCallback(async (locale: string): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        return setDoc(doc(firestore, configPath), { default_locale: locale }, { merge: true });
    }, [configPath]);

    useEffect(() => {
        if (!projectId || !backendFirebaseApp) {
            setClientConfigLoading(false);
            return;
        }

        if (loadedProjectIdRef.current !== projectId) {
            setClientConfigLoading(true);
            setClientFirebaseConfig(undefined);
            setClientFirebasePending(false);
            loadedProjectIdRef.current = undefined;
        }

        const firestore = getFirestore(backendFirebaseApp);

        // Firestore ends a listener for good once it is denied, and a project that
        // is still being created denies reads: its members are written at the end
        // of provisioning. Without listening again, the new-project flow never sees
        // the service account or Firebase config arrive and waits forever.
        let unsubscribe: (() => void) | undefined;
        let retryTimeout: ReturnType<typeof setTimeout> | undefined;
        let deniedAttempts = 0;

        const subscribe = () => {
            unsubscribe = onSnapshot(doc(firestore, projectPath),
                {
                    next: (snapshot) => {
                        deniedAttempts = 0;
                        console.debug("Project config snapshot:", {
                            data: snapshot.data()
                        });
                        setClientProjectName(snapshot.get("name"));
                        const plan = snapshot.get("subscription_plan") ?? "free";
                        setSubscriptionPlan(plan);
                        setSubscriptionData(snapshot.get("subscription_data"));
                        setSubscriptionSource(snapshot.get("subscription_source"));
                        setLocalTextSearchEnabled(snapshot.get("local_text_search_enabled") ?? false);
                        setTypesenseSearchConfig(snapshot.get("typesense_search_config"));
                        setHistoryDefaultEnabled(snapshot.get("history_default_enabled") ?? false);
                        const trialTimestamp = snapshot.get("trial_valid_until");
                        if (trialTimestamp) {
                            setTrialValidUntil(trialTimestamp.toDate());
                        }

                        setPrimaryColor(snapshot.get("primary_color") ?? DEFAULT_PRIMARY_COLOR);
                        setSecondaryColor(snapshot.get("secondary_color") ?? DEFAULT_SECONDARY_COLOR);

                        const currentCustomizationRevision = snapshot.get("current_app_config_revision");
                        setCustomizationRevision(currentCustomizationRevision);
                        setCreationType(snapshot.get("creation_type"));
                        setBlocked(snapshot.get("blocked"));
                        setDefaultLocale(snapshot.get("default_locale"));

                        const updatedSerializedAppCheck = snapshot.get("app_check");
                        if (updatedSerializedAppCheck) {
                            const appCheckOptions = updatedSerializedAppCheck ? deserializeAppCheckOptions(updatedSerializedAppCheck) : undefined;
                            setAppCheck(appCheckOptions);
                            setSerializedAppCheck(updatedSerializedAppCheck);
                        }

                        const firebaseConfig = snapshot.get("firebase_config");

                        loadedProjectIdRef.current = projectId;
                        // "error" is a web app creation that failed: still on
                        // its way as far as the UI is concerned, since the
                        // stalled config retry below asks for it again.
                        const firebaseConfigPending = firebaseConfig === "loading" || firebaseConfig === "error";
                        setClientFirebasePending(firebaseConfigPending);
                        if (firebaseConfigPending) {
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
                        if (e.code === "permission-denied") {
                            const delay = Math.min(1000 * 2 ** deniedAttempts, 10000);
                            deniedAttempts++;
                            retryTimeout = setTimeout(subscribe, delay);
                        }
                    }
                });
        };
        subscribe();

        return () => {
            clearTimeout(retryTimeout);
            unsubscribe?.();
        };
    }, [backendFirebaseApp, projectId]);

    useRetryStalledFirebaseConfig({
        projectId,
        pending: clientFirebasePending,
        createFirebaseWebapp: projectsApi?.createFirebaseWebapp
    });

    const updatePrimaryColor = useCallback(async (color?: string): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        setPrimaryColor(color);
        setDoc(doc(firestore, configPath), { primary_color: color }, { merge: true });
    }, [configPath]);

    const updateSecondaryColor = useCallback(async (color?: string): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        setSecondaryColor(color);
        setDoc(doc(firestore, configPath), { secondary_color: color }, { merge: true });
    }, [configPath]);

    const updateAppCheck = useCallback(async (appCheck: SerializedAppCheckOptions | null): Promise<void> => {
        if (!backendFirebaseApp) throw Error("useBuildProjectConfig Firebase not initialised");
        const firestore = getFirestore(backendFirebaseApp);
        if (!firestore || !configPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        setDoc(doc(firestore, configPath), { app_check: appCheck }, { merge: true });
    }, [configPath]);

    return {

        projectId,
        logo,
        uploadLogo,
        updateProjectName,

        projectName: clientProjectName,
        subscriptionPlan: loadedProjectIdRef.current !== projectId ? undefined : subscriptionPlan,
        subscriptionData: loadedProjectIdRef.current !== projectId ? undefined : subscriptionData,
        trialValidUntil: loadedProjectIdRef.current !== projectId ? undefined : trialValidUntil,
        isTrialOver: (loadedProjectIdRef.current !== projectId ? undefined : isTrialOver) ?? false,
        subscriptionSource: loadedProjectIdRef.current !== projectId ? undefined : subscriptionSource,
        isGCPMarketplace: subscriptionSource === "gcp_marketplace",
        customizationRevision: loadedProjectIdRef.current !== projectId ? undefined : customizationRevision,
        configLoading: loadedProjectIdRef.current !== projectId || clientConfigLoading,
        configError: loadedProjectIdRef.current !== projectId ? undefined : clientConfigError,
        clientFirebaseConfig: loadedProjectIdRef.current !== projectId ? undefined : clientFirebaseConfig,
        clientFirebaseMissing: loadedProjectIdRef.current !== projectId ? undefined : clientFirebaseMissing,
        serviceAccountMissing: loadedProjectIdRef.current !== projectId ? undefined : serviceAccountMissing,
        localTextSearchEnabled,
        updateLocalTextSearchEnabled,
        typesenseSearchConfig,
        updateTypesenseSearchConfig,
        historyDefaultEnabled,
        updateHistoryDefaultEnabled,
        updateSurveyData,
        primaryColor,
        secondaryColor,
        updatePrimaryColor,
        updateSecondaryColor,
        defaultLocale,
        updateDefaultLocale,
        blocked,
        updateAppCheck,
        appCheck,
        serializedAppCheck
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

const deserializeAppCheckOptions = (appCheck: SerializedAppCheckOptions): AppCheckOptions => {
    if (appCheck.provider === "recaptcha_v3") {
        return {
            provider: new ReCaptchaV3Provider(appCheck.siteKey) as unknown as AppCheckOptions['provider'],
            isTokenAutoRefreshEnabled: appCheck.isTokenAutoRefreshEnabled,
            debugToken: appCheck.debugToken,
            forceRefresh: appCheck.forceRefresh
        }
    } else if (appCheck.provider === "recaptcha_enterprise") {
        return {
            provider: new ReCaptchaEnterpriseProvider(appCheck.siteKey) as unknown as AppCheckOptions['provider'],
            isTokenAutoRefreshEnabled: appCheck.isTokenAutoRefreshEnabled,
            debugToken: appCheck.debugToken,
            forceRefresh: appCheck.forceRefresh
        }
    }
    throw Error("Invalid app check type");
}

export interface SerializedAppCheckOptions {
    provider: "recaptcha_v3" | "recaptcha_enterprise";
    siteKey: string;
    isTokenAutoRefreshEnabled?: boolean;
    debugToken?: string;
    forceRefresh?: boolean;
}
