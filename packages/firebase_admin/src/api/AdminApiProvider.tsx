import React, { useContext, useMemo } from "react";
import { FirebaseApp } from "@firebase/app";
import { getFirestore, Firestore } from "@firebase/firestore";
import { AdminApi } from "./admin_api";

interface AdminApiContextValue {
    adminApi: AdminApi;
    firestore?: Firestore;
}

const AdminApiContext = React.createContext<AdminApiContextValue | null>(null);

export function AdminApiProvider({
    adminApi,
    backendFirebaseApp,
    children
}: {
    adminApi: AdminApi;
    backendFirebaseApp?: FirebaseApp;
    children: React.ReactNode;
}) {
    const firestore = useMemo(
        () => backendFirebaseApp ? getFirestore(backendFirebaseApp) : undefined,
        [backendFirebaseApp]
    );

    const value = useMemo(
        () => ({ adminApi, firestore }),
        [adminApi, firestore]
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

/**
 * Returns the FireCMS backend Firestore instance, used for onSnapshot
 * listeners on admin job documents.
 */
export function useBackendFirestore(): Firestore | undefined {
    const ctx = useContext(AdminApiContext);
    return ctx?.firestore;
}
