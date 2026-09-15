import { useEffect, useRef, useState } from "react";
import { AccessResponse, AuthController, DataSourceDelegate, FireCMSPlugin } from "../types";
import { PRO_PLUGIN_KEYS } from "../core/pro_plugins";

export const DEFAULT_SERVER_DEV = "https://api-kdoe6pj3qq-ey.a.run.app";
export const DEFAULT_SERVER = "https://api.firecms.co";

async function makeRequest(authController: AuthController, dataSourceKey: string, pluginKeys: string[] | undefined, apiKey?: string): Promise<AccessResponse> {
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
    dataSourceDelegate: DataSourceDelegate;
    /**
     * Every plugin the app mounts, before any are paused: the server decides
     * from these keys whether the project needs a license.
     */
    plugins?: FireCMSPlugin<any, any, any>[];
    /**
     * When false, no request is sent, unless the request is a license check:
     * with an `apiKey`, or with a PRO plugin mounted, it is always sent.
     */
    telemetry?: boolean;
}

export function useProjectLog({
                                  authController,
                                  dataSourceDelegate,
                                  plugins,
                                  apiKey,
                                  telemetry = true
                              }: UseProjectLogParams): AccessResponse | null {
    const [accessResponse, setAccessResponse] = useState<AccessResponse | null>(null);
    const accessedUserRef = useRef<string | null>(null);
    const dataSourceKey = dataSourceDelegate.key;
    const pluginKeys = plugins?.map(plugin => plugin.key);
    // Opting out is for apps without PRO plugins. With one mounted, the
    // request is what starts the trial and pauses PRO when it ends, so
    // skipping it would unlock PRO for good.
    const runsProPlugin = (pluginKeys ?? []).some(key => PRO_PLUGIN_KEYS.includes(key));
    const enabled = Boolean(apiKey) || runsProPlugin || telemetry !== false;
    useEffect(() => {
        if (!enabled) return;
        if (authController.user && authController.user.uid !== accessedUserRef.current && !authController.initialLoading) {
            makeRequest(authController, dataSourceKey, pluginKeys, apiKey)
                .then((response) => setAccessResponse(response && typeof response === "object" ? response : null))
                .catch((error) => {
                    // The check never gates the CMS, so a failed one only
                    // leaves the license status unknown.
                    console.debug("FireCMS license check failed", error);
                });
            accessedUserRef.current = authController.user.uid;
        }
    }, [authController, dataSourceKey, pluginKeys, enabled]);
    return accessResponse;
}
