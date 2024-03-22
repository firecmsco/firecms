import { useEffect, useRef, useState } from "react";
import { AuthController, FireCMSPlugin } from "../types";

export const DEFAULT_SERVER_DEV = "https://api-kdoe6pj3qq-ey.a.run.app";
export const DEFAULT_SERVER = "https://api-drplyi3b6q-ey.a.run.app";

export type AccessResponse = {
    blocked?: boolean;
    message?: string;
}

async function makeRequest(authController: AuthController, pluginKeys: string | undefined) {
    const firebaseToken = await authController.getAuthToken();
    return fetch(DEFAULT_SERVER + "/access_log",
        {
            // mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${firebaseToken}`,
            },
            body: JSON.stringify({ plugins: pluginKeys })
        })
        .then(async (res) => {
            return res.json();
        });
}

export function useProjectLog(authController: AuthController,
                              plugins?: FireCMSPlugin<any, any, any>[]): AccessResponse | null {
    const [accessResponse, setAccessResponse] = useState<AccessResponse | null>(null);
    const accessedUserRef = useRef<string | null>(null);
    const pluginKeys = plugins?.map(plugin => plugin.key).join(",");
    useEffect(() => {
        if (authController.user && authController.user.uid !== accessedUserRef.current && !authController.initialLoading) {
            makeRequest(authController, pluginKeys).then(setAccessResponse);
            accessedUserRef.current = authController.user.uid;
        }
    }, [authController]);
    return accessResponse;
}
