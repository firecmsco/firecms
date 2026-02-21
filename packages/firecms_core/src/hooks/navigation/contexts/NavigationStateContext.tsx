import React, { createContext } from "react";
import { CMSView, NavigationResult, FireCMSPlugin } from "@firecms/types";

export type NavigationStateController = {
    views?: CMSView[];
    adminViews?: CMSView[];
    topLevelNavigation?: NavigationResult;
    loading: boolean;
    navigationLoadingError?: any;
    refreshNavigation: () => void;
    plugins?: FireCMSPlugin<any, any, any>[];
};

export const NavigationStateContext = createContext<NavigationStateController>({
    loading: true,
    refreshNavigation: () => { }
});

export function useNavigationStateController(): NavigationStateController {
    const context = React.useContext(NavigationStateContext);
    if (context === undefined) {
        throw new Error("useNavigationStateController must be used within a NavigationStateContext.Provider");
    }
    return context;
}
