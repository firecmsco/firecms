import React, { createContext } from "react";
import { NavigateOptions } from "react-router-dom";

export type CMSUrlController = {
    basePath: string;
    baseCollectionPath: string;
    urlPathToDataPath: (cmsPath: string) => string;
    homeUrl: string;
    isUrlCollectionPath: (urlPath: string) => boolean;
    buildUrlCollectionPath: (path: string) => string;
    buildCMSUrlPath: (path: string) => string;
    resolveDatabasePathsFrom: (path: string) => string;
    navigate: (to: string, options?: NavigateOptions) => void;
};

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
