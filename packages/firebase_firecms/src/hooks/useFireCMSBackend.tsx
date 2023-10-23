// import { FirebaseApp } from "firebase/app";
import React from "react";
import { FireCMSBackend } from "../types";
// import { ProjectsApi } from "../api/projects";
//
export const FireCMSBackendContext = React.createContext({} as FireCMSBackend);
//
export function FireCMSBackEndProvider({
                                           children,
                                           ...backend
                                       }: React.PropsWithChildren<FireCMSBackend>) {
    return <FireCMSBackendContext.Provider value={backend}>
        {children}
    </FireCMSBackendContext.Provider>
}

export function useFireCMSBackend(): FireCMSBackend {
    return React.useContext(FireCMSBackendContext);
}
