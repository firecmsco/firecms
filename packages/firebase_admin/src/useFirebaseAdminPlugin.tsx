import React, { PropsWithChildren, useMemo } from "react";
import { FireCMSContext, FireCMSPlugin } from "@firecms/core";
import { FirebaseApp } from "@firebase/app";
import { buildAdminApi } from "./api/admin_api";
import { AdminApiProvider } from "./api/AdminApiProvider";

export type UseFirebaseAdminPluginProps = {
    /**
     * Whether the current user is an admin. If false, the plugin won't render.
     */
    isAdmin: boolean;
    /**
     * The project ID for the current FireCMS Cloud project.
     */
    projectId: string;
    /**
     * The backend API host (e.g. "https://api.firecms.co").
     */
    backendApiHost: string;
    /**
     * Function to get the backend auth token for API calls.
     */
    getBackendAuthToken: () => Promise<string>;
    /**
     * The backend Firebase app, used for real-time onSnapshot listeners
     * on admin job documents.
     */
    backendFirebaseApp?: FirebaseApp;
};

function AdminProviderComponent({
    children,
    adminApi,
    backendFirebaseApp,
}: PropsWithChildren<{ context: FireCMSContext; adminApi: ReturnType<typeof buildAdminApi>; backendFirebaseApp?: FirebaseApp }>) {
    return (
        <AdminApiProvider adminApi={adminApi} backendFirebaseApp={backendFirebaseApp}>
            {children}
        </AdminApiProvider>
    );
}

/**
 * Hook that builds a FireCMS plugin for the Firebase Admin panel.
 * Returns a plugin that adds admin views to the navigation.
 * Only active when the user is an admin.
 */
export function useFirebaseAdminPlugin({
    isAdmin,
    projectId,
    backendApiHost,
    getBackendAuthToken,
    backendFirebaseApp,
}: UseFirebaseAdminPluginProps): FireCMSPlugin {
    const adminApi = useMemo(
        () => buildAdminApi(backendApiHost, getBackendAuthToken),
        [backendApiHost, getBackendAuthToken]
    );

    return useMemo(
        () => ({
            key: "firebase_admin",
            provider: isAdmin
                ? {
                      Component: AdminProviderComponent,
                      props: { adminApi, backendFirebaseApp },
                  }
                : undefined,
        }),
        [isAdmin, adminApi, backendFirebaseApp]
    );
}
