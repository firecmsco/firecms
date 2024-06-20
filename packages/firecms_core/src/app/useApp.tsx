import React from "react";

/**
 * This context represents the state of the app in terms of layout.
 * @group Core
 */
export type DrawerState = {
    hasDrawer: boolean,
    drawerHovered: boolean,
    drawerOpen: boolean,
    openDrawer: () => void,
    closeDrawer: () => void,
    autoOpenDrawer?: boolean,
    logo?: string
}

export const AppContext = React.createContext<DrawerState>({
    hasDrawer: false,
    drawerHovered: false,
    drawerOpen: false,
    openDrawer: () => {
        throw new Error("openDrawer not implemented");
    },
    closeDrawer: () => {
        throw new Error("closeDrawer not implemented");
    },
    autoOpenDrawer: false
});

export function useApp() {
    return React.useContext(AppContext);
}
