import { useEffect, useRef } from "react";
import { AuthController } from "../types";

export const DEFAULT_SERVER_DEV = "https://api-kdoe6pj3qq-ey.a.run.app";
export const DEFAULT_SERVER = "https://api-drplyi3b6q-ey.a.run.app";

async function makeRequest(authController: AuthController) {
    const firebaseToken = await authController.getAuthToken();
    return fetch(DEFAULT_SERVER_DEV + "/access_log",
        {
            // mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${firebaseToken}`,
            },
            body: JSON.stringify({})
        })
        .then(async (res) => {
            console.log("res", res)
        });
}

export function useProjectLog(authController: AuthController) {
    const accessedUserRef = useRef<string | null>(null);
    useEffect(() => {
        if (authController.user && authController.user.uid !== accessedUserRef.current && !authController.initialLoading) {
            makeRequest(authController);
            accessedUserRef.current = authController.user.uid;
        }
    }, [authController]);
}
