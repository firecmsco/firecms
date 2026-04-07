import type { CMSUrlController } from "@rebasepro/types/cms";
import React, { createContext } from "react";
import { NavigateOptions } from "react-router-dom";

;

export const CMSUrlContext = createContext<CMSUrlController>({
    basePath: "/",
    baseCollectionPath: "/c",
    urlPathToDataPath: () => "",
    homeUrl: "/",
    isUrlCollectionPath: () => false,
    buildUrlCollectionPath: () => "",
    buildCMSUrlPath: () => "",
    resolveDatabasePathsFrom: () => "",
    navigate: () => { }
});

export function useCMSUrlController(): CMSUrlController {
    const context = React.useContext(CMSUrlContext);
    if (context === undefined) {
        throw new Error("useCMSUrlController must be used within a CMSUrlContext.Provider");
    }
    return context;
}
