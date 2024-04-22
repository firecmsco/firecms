import React, { PropsWithChildren, useCallback, useContext, useEffect, useRef } from "react";
import { getAnalytics, logEvent, setUserProperties as setUserPropertiesGA } from "firebase/analytics";
import { FirebaseApp } from "firebase/app";

type SaasAnalytics = {
    setUserProperties: (userProperties: Record<string, string>) => void;
    logEvent: (eventName: string, eventParams?: Record<string, any>) => void;
    logGoogleLogin: () => void;
    logGoogleLoginDisplayed: (adminScopesRequired: boolean) => void;
    logSubscribeClick: (productId: string, selectedPriceId: string, projectId: string) => void;
    logMainScreenNewProject: () => void;
    logMainScreenSubscriptions: () => void;
    logProjectSelectNewProject: () => void;
    logProjectSelectProjectSelected: (projectId: string) => void;
    logProjectCreationNewProjectSelected: () => void;
    logProjectCreationNewProjectSelectedSuccess: (projectId: string) => void;
    logProjectCreationNewProjectError: () => void;
    logProjectCreationExistingProjectSelected: (projectId: string) => void;
    logProjectCreationExistingServiceAccountUsed: (projectId: string) => void;
    logProjectCreationExistingProjectSelectedSuccess: (projectId: string) => void;
    logDoctorScreenProjectSelected: (projectId: string) => void;
    logAdminPermissionsRequired: (projectId?: string) => void;
}

export const SaasAnalyticsContext = React.createContext<SaasAnalytics>({} as any);

export type SaasAnalyticsProviderProps = {
    backendFirebaseApp: FirebaseApp,
}

export const useSaasAnalytics = (): SaasAnalytics => useContext(SaasAnalyticsContext);

export function SaasAnalyticsProvider({ children, backendFirebaseApp }: PropsWithChildren<SaasAnalyticsProviderProps>) {

    const latestPathname = useRef<string | undefined>();

    useEffect(() => {
        if (latestPathname.current === window.location.pathname) {
            return;
        }
        logEvent(getAnalytics(backendFirebaseApp), "page_view", {
            page_location: window.location.href,
            page_path: window.location.pathname,
            page_title: document.title
        });
        latestPathname.current = window.location.pathname;
    }, [window.location.pathname]);

    const setUserProperties = useCallback((userProperties: Record<string, string>) => {
        console.debug("Analytics user properties", userProperties);
        setUserPropertiesGA(getAnalytics(backendFirebaseApp), userProperties);
    }, []);

    const logEventInternal = useCallback((eventName: string, eventParams?: Record<string, any>) => {
        console.debug("Analytics event", eventName, eventParams);
        logEvent(getAnalytics(backendFirebaseApp), eventName, eventParams);
    }, []);

    const logGoogleLogin = useCallback(() => {
        logEventInternal("login", {
            method: "google"
        });
    }, [logEventInternal]);

    const logGoogleLoginDisplayed = useCallback((adminScopesRequired: boolean) => {
        logEventInternal("login_displayed", {
            method: "google",
            admin_scopes_required: adminScopesRequired
        });
    }, [logEventInternal]);

    const logSubscribeClick = useCallback((productId: string, selectedPriceId: string, projectId: string) => {
        logEventInternal("subs:subscribe_click", {
            productId,
            selectedPriceId,
            projectId
        });
    }, [logEventInternal]);

    const logMainScreenNewProject = useCallback(() => {
        logEventInternal("main:new_project_click");
    }, [logEventInternal]);

    const logMainScreenSubscriptions = useCallback(() => {
        logEventInternal("main:subscriptions_click");
    }, [logEventInternal]);

    const logProjectSelectNewProject = useCallback(() => {
        logEventInternal("project_select:new_project_click");
    }, [logEventInternal]);

    const logProjectSelectProjectSelected = useCallback((projectId: string) => {
        logEventInternal("project_select:project_selected", { projectId });
    }, [logEventInternal]);

    const logProjectCreationNewProjectSelected = useCallback(() => {
        logEventInternal("project_creation:new_project", {});
    }, [logEventInternal]);

    const logProjectCreationNewProjectSelectedSuccess = useCallback((projectId: string) => {
        logEventInternal("project_creation:new_project_success", { projectId });
    }, [logEventInternal]);

    const logProjectCreationNewProjectError = useCallback(() => {
        logEventInternal("project_creation:new_project_error", {});
    }, [logEventInternal]);

    const logProjectCreationExistingProjectSelected = useCallback((projectId: string) => {
        logEventInternal("project_creation:existing_selected", { projectId });
    }, [logEventInternal]);

    const logProjectCreationExistingServiceAccountUsed = useCallback((projectId: string) => {
        logEventInternal("project_creation:service_account_used", { projectId });
    }, [logEventInternal]);

    const logProjectCreationExistingProjectSelectedSuccess = useCallback((projectId: string) => {
        logEventInternal("project_creation:existing_success", { projectId });
    }, [logEventInternal]);

    const logDoctorScreenProjectSelected = useCallback((projectId: string) => {
        logEventInternal("doctor_screen:existing_selected", { projectId });
    }, [logEventInternal]);

    const logAdminPermissionsRequired = useCallback((projectId?: string) => {
        logEventInternal("admin_permissions_required", { projectId });
    }, [logEventInternal]);

    const analytics: SaasAnalytics = {
        setUserProperties,
        logEvent: logEventInternal,
        logGoogleLogin,
        logGoogleLoginDisplayed,
        logMainScreenNewProject,
        logSubscribeClick,
        logMainScreenSubscriptions,
        logProjectSelectNewProject,
        logProjectSelectProjectSelected,
        logProjectCreationNewProjectSelected,
        logProjectCreationExistingServiceAccountUsed,
        logProjectCreationNewProjectSelectedSuccess,
        logProjectCreationNewProjectError,
        logProjectCreationExistingProjectSelected,
        logProjectCreationExistingProjectSelectedSuccess,
        logDoctorScreenProjectSelected,
        logAdminPermissionsRequired
    }

    return <SaasAnalyticsContext.Provider value={analytics}>
        {children}
    </SaasAnalyticsContext.Provider>
}
