import type { NavigationStateController, CMSView, NavigationResult, RebasePlugin } from "@rebasepro/types/cms";
import React, { createContext } from "react";
;

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
