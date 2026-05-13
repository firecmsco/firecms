import React, { useContext, useMemo } from "react";
import { FirebaseApp } from "@firebase/app";
import { getFirestore, Firestore } from "@firebase/firestore";
import { AdminApi } from "./admin_api";

interface AdminApiContextValue {
    adminApi: AdminApi;
    firestore?: Firestore;
    projectId?: string;
}

const AdminApiContext = React.createContext<AdminApiContextValue | null>(null);

export function AdminApiProvider({
    adminApi,
    backendFirebaseApp,
    projectId,
    children
}: {
    adminApi: AdminApi;
    backendFirebaseApp?: FirebaseApp;
    projectId?: string;
    children: React.ReactNode;
}) {
    const firestore = useMemo(
        () => backendFirebaseApp ? getFirestore(backendFirebaseApp) : undefined,
        [backendFirebaseApp]
    );

    const value = useMemo(
        () => ({ adminApi, firestore, projectId }),
        [adminApi, firestore, projectId]
    );

    return (
        <AdminApiContext.Provider value={value}>
            {children}
        </AdminApiContext.Provider>
    );
}

export function useAdminApi(): AdminApi {
    const ctx = useContext(AdminApiContext);
    if (!ctx) {
        throw new Error("useAdminApi must be used within an AdminApiProvider");
    }
    return ctx.adminApi;
}

export function useAdminProjectId(): string {
    const ctx = useContext(AdminApiContext);
    return ctx?.projectId ?? "";
}

/**
 * Returns the FireCMS backend Firestore instance, used for onSnapshot
 * listeners on admin job documents.
 */
export function useBackendFirestore(): Firestore | undefined {
    const ctx = useContext(AdminApiContext);
    return ctx?.firestore;
}
