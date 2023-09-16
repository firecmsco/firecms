import { FirebaseApp } from "firebase/app";
import React from "react";

export const FireCMSBackendContext = React.createContext({} as FireCMSBackEnd);

type FireCMSBackEndProviderProps = {
    children: React.ReactNode,
    backendFirebaseApp: FirebaseApp;
    backendUid?: string;
    getFirebaseIdToken: () => Promise<string>;
};

export function FireCMSBackEndProvider({
                                           children,
                                           ...backend
                                       }: FireCMSBackEndProviderProps) {
    return <FireCMSBackendContext.Provider value={backend}>
        {children}
    </FireCMSBackendContext.Provider>
}

export type FireCMSBackEnd = {
    backendUid?: string;
    backendFirebaseApp: FirebaseApp;
    getFirebaseIdToken: () => Promise<string>;
};

export function useFireCMSBackend(): FireCMSBackEnd {
    return React.useContext(FireCMSBackendContext);
}
