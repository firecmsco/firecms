import { FirebaseApp } from "@firebase/app";

export const getFirebaseApps = async (): Promise<FirebaseApp[]> => {
    const app = await import("firebase/app");
    return app.getApps();
}

export const getFirebaseApp = async (): Promise<FirebaseApp> => {
    const app = await import("firebase/app");
    return app.getApp();
}
