import { useEffect, useRef, useState } from "react";
import { AuthController, DataSource, RebasePlugin } from "@rebasepro/types";

export const DEFAULT_SERVER_DEV = "https://api-kdoe6pj3qq-ey.a.run.app";
export const DEFAULT_SERVER = "https://api.rebase.pro";

export type AccessResponse = {
    blocked?: boolean;
    message?: string;
}

async function makeRequest(authController: AuthController, dataSourceKey: string | undefined, pluginKeys: string[] | undefined, apiKey?: string): Promise<AccessResponse> {
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
                apiKey,
                email: authController.user?.email ?? null,
                datasource: dataSourceKey,
                plugins: pluginKeys
            })
        })
        .then(async (res) => {
            return res.json();
        });
}

export interface UseProjectLogParams {
    apiKey?: string;
    authController: AuthController;
    dataSource: DataSource;
    plugins?: RebasePlugin<any, any, any>[];
}

export function useProjectLog({
    authController,
    dataSource,
    plugins,
    apiKey
}: UseProjectLogParams): AccessResponse | null {
    const [accessResponse, setAccessResponse] = useState<AccessResponse | null>(null);
    const accessedUserRef = useRef<string | null>(null);
    const dataSourceKey = dataSource.key;
    const pluginKeys = plugins?.map(plugin => plugin.key);
    useEffect(() => {
        if (authController.user && authController.user.uid !== accessedUserRef.current && !authController.initialLoading) {
            makeRequest(authController, dataSourceKey, pluginKeys, apiKey).then(setAccessResponse);
            accessedUserRef.current = authController.user.uid;
        }
    }, [authController, dataSourceKey, pluginKeys]);
    return accessResponse;
}
