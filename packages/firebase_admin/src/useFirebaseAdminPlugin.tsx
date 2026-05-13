import React, { PropsWithChildren, useCallback, useMemo } from "react";
import { EntityCollection, FireCMSContext, FireCMSPlugin } from "@firecms/core";
import { FirebaseApp } from "@firebase/app";
import { FirestoreIcon } from "@firecms/ui";
import { buildAdminApi } from "./api/admin_api";
import { AdminApiProvider } from "./api/AdminApiProvider";
import { RawDataView } from "./RawDataView";

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
    projectId,
}: PropsWithChildren<{ context: FireCMSContext; adminApi: ReturnType<typeof buildAdminApi>; backendFirebaseApp?: FirebaseApp; projectId?: string }>) {
    return (
        <AdminApiProvider adminApi={adminApi} backendFirebaseApp={backendFirebaseApp} projectId={projectId}>
            {children}
        </AdminApiProvider>
    );
}

/**
 * Hook that builds a FireCMS plugin for the Firebase Admin panel.
 * Returns a plugin that adds admin views to the navigation.
 * Only active when the user is an admin.
 *
 * When admin, also injects a "Raw Data" tab into every entity view,
 * showing the raw Firestore document fields exactly like the Firebase console.
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

    const modifyCollection = useCallback((collection: EntityCollection) => {
        if (!isAdmin) return collection;

        // Inject the raw data view tab for admin users
        return {
            ...collection,
            entityViews: [
                ...(collection.entityViews ?? []),
                {
                    key: "__raw_data",
                    name: "Raw Data",
                    tabComponent: <FirestoreIcon size={"small"} />,
                    Builder: RawDataView,
                    position: "start"
                }
            ],
        } satisfies EntityCollection;
    }, [isAdmin]);

    return useMemo(
        () => ({
            key: "firebase_admin",
            provider: isAdmin
                ? {
                      Component: AdminProviderComponent,
                      props: { adminApi, backendFirebaseApp, projectId },
                  }
                : undefined,
            collection: isAdmin
                ? { modifyCollection }
                : undefined,
        }),
        [isAdmin, adminApi, backendFirebaseApp, modifyCollection, projectId]
    );
}
