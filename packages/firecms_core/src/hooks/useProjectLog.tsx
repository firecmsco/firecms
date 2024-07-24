import { useEffect, useRef, useState } from "react";
import { AuthController, DataSourceDelegate, FireCMSPlugin } from "../types";

export const DEFAULT_SERVER_DEV = "https://api-kdoe6pj3qq-ey.a.run.app";
export const DEFAULT_SERVER = "https://api-drplyi3b6q-ey.a.run.app";

export type AccessResponse = {
    blocked?: boolean;
    message?: string;
}

async function makeRequest(authController: AuthController, dataSourceKey: string, pluginKeys: string[] | undefined) {
    let idToken: string | null;
    try {
        idToken = await authController.getAuthToken();
    } catch (e) {
        idToken = null;
    }
    return fetch(DEFAULT_SERVER + "/access_log",
        {
            // mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${idToken}`
            },
            body: JSON.stringify({
                email: authController.user?.email ?? null,
                datasource: dataSourceKey,
                plugins: pluginKeys
            })
        })
        .then(async (res) => {
            return res.json();
        });
}

export function useProjectLog(authController: AuthController,
                              dataSourceDelegate: DataSourceDelegate,
                              plugins?: FireCMSPlugin<any, any, any>[]): AccessResponse | null {
    const [accessResponse, setAccessResponse] = useState<AccessResponse | null>(null);
    const accessedUserRef = useRef<string | null>(null);
    const dataSourceKey = dataSourceDelegate.key;
    const pluginKeys = plugins?.map(plugin => plugin.key);
    useEffect(() => {
        if (authController.user && authController.user.uid !== accessedUserRef.current && !authController.initialLoading) {
            makeRequest(authController, dataSourceKey, pluginKeys).then(setAccessResponse);
            accessedUserRef.current = authController.user.uid;
        }
    }, [authController, dataSourceKey, pluginKeys]);
    return accessResponse;
}
