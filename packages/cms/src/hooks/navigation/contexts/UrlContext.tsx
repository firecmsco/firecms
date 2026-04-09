import type { UrlController } from "@rebasepro/types";
import React, { createContext } from "react";
import { NavigateOptions } from "react-router-dom";

;

export const UrlContext = createContext<UrlController>({
    basePath: "/",
    baseCollectionPath: "/c",
    urlPathToDataPath: () => "",
    homeUrl: "/",
    isUrlCollectionPath: () => false,
    buildUrlCollectionPath: () => "",
    buildAppUrlPath: () => "",
    resolveDatabasePathsFrom: () => "",
    navigate: () => { }
});

export function useUrlController(): UrlController {
    const context = React.useContext(UrlContext);
    if (context === undefined) {
        throw new Error("useUrlController must be used within a UrlContext.Provider");
    }
    return context;
}
