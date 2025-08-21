import React from "react";
import { FireCMSBackend } from "@firecms/types";

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
