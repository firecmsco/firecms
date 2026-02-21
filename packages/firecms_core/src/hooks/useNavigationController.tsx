import { useContext } from "react";
import { NavigationController } from "@firecms/types";
import { useCollectionRegistryController, useNavigationStateController, useCMSUrlController } from "./navigation/contexts";

/**
 * Use this hook to get the navigation of the app.
 * This controller provides the resolved collections for the CMS as well
 * as utility methods.
 *
 * @group Hooks and utilities
 * @deprecated Use `useCollectionRegistryController`, `useNavigationStateController`, or `useCMSUrlController` instead.
 */
export const useNavigationController = (): NavigationController => {
    const collectionRegistry = useCollectionRegistryController();
    const navigationState = useNavigationStateController();
    const cmsUrl = useCMSUrlController();

    return {
        ...collectionRegistry,
        getCollectionById: collectionRegistry.getCollectionBySlug,
        ...navigationState,
        ...cmsUrl
    } as NavigationController;
};
