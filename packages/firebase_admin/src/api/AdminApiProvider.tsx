import React, { useContext } from "react";
import { AdminApi } from "./admin_api";

const AdminApiContext = React.createContext<AdminApi | null>(null);

export function AdminApiProvider({
    adminApi,
    children
}: {
    adminApi: AdminApi;
    children: React.ReactNode;
}) {
    return (
        <AdminApiContext.Provider value={adminApi}>
            {children}
        </AdminApiContext.Provider>
    );
}

export function useAdminApi(): AdminApi {
    const api = useContext(AdminApiContext);
    if (!api) {
        throw new Error("useAdminApi must be used within an AdminApiProvider");
    }
    return api;
}
