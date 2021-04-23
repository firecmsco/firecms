import React, { useContext, useEffect, useState } from "react";
import { EntityCollection } from "../models";
import { Navigation, NavigationBuilder } from "../CMSAppProps";

const DEFAULT_NAVIGATION_CONTROLLER = {
    navigationLoadingError: null
};

export type NavigationContext = {
    navigation?: Navigation;
    navigationLoadingError: Error | null;
};

export const NavigationContext = React.createContext<NavigationContext>(DEFAULT_NAVIGATION_CONTROLLER);
export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
    children: React.ReactNode;
    navigationOrCollections: Navigation | NavigationBuilder | EntityCollection[];
    user: firebase.User | null;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
                                                                            children,
                                                                            navigationOrCollections,
                                                                            user
                                                                        }) => {

    const [navigation, setNavigation] = useState<Navigation>();
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error| null>(null);

    useEffect(() => {
        getNavigation(navigationOrCollections, user).then((result: Navigation) => {
            setNavigation(result);
        }).catch(setNavigationLoadingError);
    }, [user, navigationOrCollections]);

    return (
        <NavigationContext.Provider
            value={{
                navigation,
                navigationLoadingError
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};


async function getNavigation(navigationOrCollections: Navigation | NavigationBuilder | EntityCollection[], user: firebase.User | null): Promise<Navigation> {
    if (Array.isArray(navigationOrCollections)) {
        return {
            collections: navigationOrCollections
        };
    } else if (typeof navigationOrCollections === "function") {
        return navigationOrCollections({ user });
    } else {
        return navigationOrCollections;
    }
}
